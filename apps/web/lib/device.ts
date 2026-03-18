import type { DeviceType } from '@/lib/supabase/types';

/** Parse device type from user-agent string */
export function parseDeviceType(ua: string | null): DeviceType | null {
  if (!ua) return null;

  const lower = ua.toLowerCase();

  if (/tablet|ipad|playbook|silk/i.test(lower)) return 'tablet';
  if (
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|opera mobi/i.test(
      lower,
    )
  ) {
    return 'mobile';
  }

  return 'desktop';
}
