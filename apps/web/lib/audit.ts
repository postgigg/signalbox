import { createAdminClient } from '@/lib/supabase/admin';

import type { Json } from '@/lib/supabase/types';

interface AuditLogEntry {
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: Json;
  ip_address?: string | null;
}

/**
 * Log an admin action to the audit trail.
 * Fire-and-forget: errors are silently caught to avoid blocking the request.
 */
export function logAdminAction(entry: AuditLogEntry): void {
  const db = createAdminClient();
  db.from('admin_audit_log')
    .insert({
      admin_email: entry.admin_email,
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id,
      details: entry.details ?? null,
      ip_address: entry.ip_address ?? null,
    })
    .then(() => { /* logged */ })
    .catch(() => { /* audit log failure is non-blocking */ });
}
