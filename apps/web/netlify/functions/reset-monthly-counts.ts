import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/supabase/types';

const BATCH_SIZE = 500;

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

export default async function handler(): Promise<void> {
  const supabase = createAdminClient();

  console.log('[reset-monthly-counts] Starting monthly submission count reset');

  let totalReset = 0;
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    // Find widgets that have a non-zero submission_count
    const { data: widgets, error: queryError } = await supabase
      .from('widgets')
      .select('id')
      .gt('submission_count', 0)
      .range(offset, offset + BATCH_SIZE - 1);

    if (queryError) {
      console.error('[reset-monthly-counts] Failed to query widgets:', queryError.message);
      return;
    }

    if (!widgets || widgets.length === 0) {
      hasMore = false;
      break;
    }

    const widgetIds = widgets.map((w) => w.id);

    // Reset submission_count to 0 for this batch
    const { error: updateError, count } = await supabase
      .from('widgets')
      .update({
        submission_count: 0,
        updated_at: new Date().toISOString(),
      })
      .in('id', widgetIds)
      .select('id');

    if (updateError) {
      console.error('[reset-monthly-counts] Failed to reset widget counts:', updateError.message);
      // Continue with next batch even if this one fails
      offset += BATCH_SIZE;
      continue;
    }

    totalReset += count ?? widgets.length;

    if (widgets.length < BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += BATCH_SIZE;
    }
  }

  console.log(`[reset-monthly-counts] Complete: ${totalReset} widgets reset to 0 submissions`);
}
