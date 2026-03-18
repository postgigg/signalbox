import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import type { Database } from '../../lib/supabase/types';

const BATCH_SIZE = 100;
const RETENTION_DAYS = 30;

function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Hash an IP address using SHA-256 with a salt.
 * Returns a hex-encoded hash string.
 */
function hashIpAddress(ip: string, salt: string): string {
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export default async function handler(): Promise<void> {
  const supabase = createAdminClient();

  const ipHashSalt = process.env.IP_HASH_SALT;
  if (!ipHashSalt) {
    console.error('[hash-old-ips] Missing IP_HASH_SALT environment variable');
    return;
  }

  const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  let totalProcessed = 0;
  let totalErrors = 0;
  let hasMore = true;

  console.log(`[hash-old-ips] Nullifying IPs older than ${RETENTION_DAYS} days (before ${cutoffDate})`);

  while (hasMore) {
    // Query submissions with non-null IP addresses older than retention period.
    // Since ip_address is INET type in Postgres, we nullify it for privacy
    // and store the hash in the notes field as metadata (preserving any existing notes).
    // This ensures compliance with data privacy requirements while maintaining
    // a way to correlate repeated submissions from the same IP.
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('id, ip_address, notes')
      .not('ip_address', 'is', null)
      .lt('created_at', cutoffDate)
      .limit(BATCH_SIZE);

    if (error) {
      console.error('[hash-old-ips] Failed to query submissions:', error.message);
      return;
    }

    if (!submissions || submissions.length === 0) {
      hasMore = false;
      break;
    }

    for (const submission of submissions) {
      if (!submission.ip_address) {
        continue;
      }

      try {
        const ipHash = hashIpAddress(submission.ip_address, ipHashSalt);

        // Append the IP hash to existing notes, or create a new notes entry.
        // Format: [ip_hash:<hash>]
        const existingNotes = submission.notes ?? '';
        const hashNote = `[ip_hash:${ipHash}]`;
        const updatedNotes = existingNotes
          ? `${existingNotes}\n${hashNote}`
          : hashNote;

        const { error: updateError } = await supabase
          .from('submissions')
          .update({
            ip_address: null,
            notes: updatedNotes,
          })
          .eq('id', submission.id);

        if (updateError) {
          console.error(`[hash-old-ips] Failed to update submission ${submission.id}:`, updateError.message);
          totalErrors++;
        } else {
          totalProcessed++;
        }
      } catch (err) {
        console.error(`[hash-old-ips] Error processing submission ${submission.id}:`, err instanceof Error ? err.message : String(err));
        totalErrors++;
      }
    }

    // If we got fewer than BATCH_SIZE results, we're done
    if (submissions.length < BATCH_SIZE) {
      hasMore = false;
    }
  }

  console.log(`[hash-old-ips] Complete: ${totalProcessed} IPs hashed and nullified, ${totalErrors} errors`);
}
