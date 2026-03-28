'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import type { FormEvent } from 'react';

interface MemberData {
  readonly id: string;
  readonly invited_email: string | null;
  readonly email: string | null;
  readonly full_name: string | null;
  readonly role: string;
  readonly user_id: string | null;
}

interface SkillTag {
  readonly id: string;
  readonly skill_tag: string;
}

interface Territory {
  readonly id: string;
  readonly country_code: string;
  readonly region_name: string | null;
}

interface AvailabilityData {
  readonly status: 'online' | 'offline' | 'busy';
  readonly max_active_leads: number | null;
  readonly auto_offline_minutes: number;
  readonly timezone: string;
}

interface MemberProfilePageProps {
  readonly params: Promise<{ id: string }>;
}

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

const STATUS_OPTIONS = ['online', 'offline', 'busy'] as const;

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'online':
      return 'bg-success-light text-success';
    case 'busy':
      return 'bg-warning-light text-warning';
    default:
      return 'bg-surface-alt text-stone';
  }
}

export default function MemberProfilePage({ params }: MemberProfilePageProps): React.ReactElement {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [member, setMember] = useState<MemberData | null>(null);
  const [skills, setSkills] = useState<SkillTag[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [availability, setAvailability] = useState<AvailabilityData>({
    status: 'offline',
    max_active_leads: null,
    auto_offline_minutes: 30,
    timezone: 'UTC',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingTerritories, setSavingTerritories] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Skill input state
  const [newSkill, setNewSkill] = useState('');

  // Territory input state
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newRegion, setNewRegion] = useState('');

  useEffect(() => {
    async function resolveParams(): Promise<void> {
      const resolved = await params;
      setMemberId(resolved.id);
    }
    void resolveParams();
  }, [params]);

  useEffect(() => {
    if (!memberId) return;

    async function load(): Promise<void> {
      try {
        // Fetch member info via API (includes resolved email)
        const memberResponse = await fetch('/api/v1/members');
        if (!memberResponse.ok) {
          setError('Failed to load members.');
          setLoading(false);
          return;
        }
        const memberResult = await memberResponse.json() as { data: MemberData[] };
        const memberData = (memberResult.data ?? []).find((m) => m.id === memberId) ?? null;

        if (!memberData) {
          setError('Member not found.');
          setLoading(false);
          return;
        }
        setMember(memberData);

        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        // Fetch skills
        const { data: skillsData } = await supabase
          .from('member_skills')
          .select('id, skill_tag')
          .eq('member_id', memberId)
          .order('created_at', { ascending: true });
        setSkills((skillsData as SkillTag[] | null) ?? []);

        // Fetch territories
        const { data: territoriesData } = await supabase
          .from('member_territories')
          .select('id, country_code, region_name')
          .eq('member_id', memberId)
          .order('created_at', { ascending: true });
        setTerritories((territoriesData as Territory[] | null) ?? []);

        // Fetch availability
        const { data: availData } = await supabase
          .from('member_availability')
          .select('status, max_active_leads, auto_offline_minutes, timezone')
          .eq('member_id', memberId)
          .single();
        if (availData) {
          setAvailability(availData as AvailabilityData);
        }
      } catch {
        setError('Failed to load member profile.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [memberId]);

  const showSuccess = useCallback((message: string): void => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  // Skills management
  const handleAddSkill = useCallback((): void => {
    const trimmed = newSkill.trim().toLowerCase();
    if (trimmed.length === 0) return;
    if (skills.some((s) => s.skill_tag === trimmed)) return;
    setSkills((prev) => [...prev, { id: `temp-${Date.now()}`, skill_tag: trimmed }]);
    setNewSkill('');
  }, [newSkill, skills]);

  const handleRemoveSkill = useCallback((skillId: string): void => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
  }, []);

  async function handleSaveSkills(): Promise<void> {
    if (!memberId) return;
    setSavingSkills(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/members/${memberId}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: skills.map((s) => s.skill_tag) }),
      });

      if (!response.ok) {
        const result = await response.json() as { error: string };
        setError(result.error);
        return;
      }

      const result = await response.json() as { skills: string[] };
      setSkills(result.skills.map((tag: string) => ({ id: `s-${tag}`, skill_tag: tag })));
      showSuccess('Skills saved.');
    } catch {
      setError('Failed to save skills.');
    } finally {
      setSavingSkills(false);
    }
  }

  // Territories management
  const handleAddTerritory = useCallback((): void => {
    const code = newCountryCode.trim().toUpperCase().slice(0, 2);
    if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return;
    if (territories.some((t) => t.country_code === code && t.region_name === (newRegion.trim() || null))) return;
    setTerritories((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        country_code: code,
        region_name: newRegion.trim() || null,
      },
    ]);
    setNewCountryCode('');
    setNewRegion('');
  }, [newCountryCode, newRegion, territories]);

  const handleRemoveTerritory = useCallback((territoryId: string): void => {
    setTerritories((prev) => prev.filter((t) => t.id !== territoryId));
  }, []);

  async function handleSaveTerritories(): Promise<void> {
    if (!memberId) return;
    setSavingTerritories(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/members/${memberId}/territories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          territories: territories.map((t) => ({
            countryCode: t.country_code.toUpperCase().slice(0, 2),
            regionName: t.region_name ?? undefined,
          })),
        }),
      });

      if (!response.ok) {
        const result = await response.json() as { error: string };
        setError(result.error);
        return;
      }

      const result = await response.json() as { territories: Array<{ countryCode: string; regionName: string | null }> };
      setTerritories(result.territories.map((t: { countryCode: string; regionName: string | null }, i: number) => ({
        id: `t-${String(i)}`,
        country_code: t.countryCode,
        region_name: t.regionName,
      })));
      showSuccess('Territories saved.');
    } catch {
      setError('Failed to save territories.');
    } finally {
      setSavingTerritories(false);
    }
  }

  // Availability management
  async function handleSaveAvailability(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!memberId) return;
    setSavingAvailability(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/members/${memberId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: availability.status,
          maxActiveLeads: availability.max_active_leads,
          autoOfflineMinutes: availability.auto_offline_minutes,
          timezone: availability.timezone,
        }),
      });

      if (!response.ok) {
        const result = await response.json() as { error: string };
        setError(result.error);
        return;
      }

      showSuccess('Availability saved.');
    } catch {
      setError('Failed to save availability.');
    } finally {
      setSavingAvailability(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard/team" className="text-sm text-stone hover:text-ink transition-colors duration-150">
            Team
          </Link>
          <span className="text-stone-light">/</span>
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="skeleton h-6 w-48 mb-2" />
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="skeleton h-5 w-24 mb-4" />
            <div className="skeleton h-8 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div>
        <Link href="/dashboard/team" className="text-sm text-signal hover:text-signal/80 transition-colors duration-150">
          Back to Team
        </Link>
        <p className="mt-4 text-sm text-stone">Member not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard/team" className="text-sm text-stone hover:text-ink transition-colors duration-150">
          Team
        </Link>
        <span className="text-stone-light">/</span>
        <span className="text-sm text-ink font-medium">
          {member.full_name ?? member.email ?? member.invited_email ?? member.id.slice(0, 8)}
        </span>
      </div>

      {error !== null && (
        <div className="mb-4 p-3 rounded-md bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      {successMessage !== null && (
        <div className="mb-4 p-3 rounded-md bg-success-light text-success text-sm border border-success/20">
          {successMessage}
        </div>
      )}

      <div className="space-y-6">
        {/* Member Info */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-surface-alt border border-border flex items-center justify-center">
              <span className="text-lg font-semibold text-stone">
                {(member.full_name ?? member.email ?? member.invited_email ?? 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-ink">
                {member.full_name ?? member.email ?? member.invited_email ?? member.id.slice(0, 8)}
              </h1>
              {member.full_name && member.email ? (
                <p className="text-sm text-stone">{member.email}</p>
              ) : null}
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                  member.role === 'owner' ? 'bg-ink text-white' :
                  member.role === 'admin' ? 'bg-signal-light text-signal' :
                  'bg-surface-alt text-stone'
                }`}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getStatusBadgeClass(availability.status)}`}>
                  {availability.status.charAt(0).toUpperCase() + availability.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="font-display text-base font-semibold text-ink mb-1">Skills</h2>
          <p className="text-sm text-stone font-body mb-1">
            Skill tags used for skill-based lead routing.
          </p>
          <p className="text-xs text-stone font-body mb-4">
            Add tags like "sales", "technical", or "spanish". When a routing rule uses skill-based matching, leads go to members whose tags overlap with the rule's required skills.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm bg-surface-alt border border-border rounded-md"
              >
                <span className="text-ink">{skill.skill_tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-stone hover:text-danger transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ink/30 rounded-sm"
                  aria-label={`Remove ${skill.skill_tag}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <p className="text-xs text-stone">No skills assigned.</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g. sales, technical, spanish"
              className="input-field flex-1"
            />
            <button type="button" onClick={handleAddSkill} className="btn-primary text-sm">
              Add
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => void handleSaveSkills()}
              disabled={savingSkills}
              className="btn-primary text-sm"
            >
              {savingSkills ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner w-4 h-4" />
                  Saving...
                </span>
              ) : 'Save Skills'}
            </button>
          </div>
        </div>

        {/* Territories */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="font-display text-base font-semibold text-ink mb-1">Territories</h2>
          <p className="text-sm text-stone font-body mb-1">
            Geographic territories for geographic lead routing.
          </p>
          <p className="text-xs text-stone font-body mb-4">
            Use 2-letter ISO country codes (e.g. US, GB, DE, FR, JP). When a lead's country matches a territory, routing sends the lead to this member.
          </p>

          {territories.length > 0 && (
            <div className="mb-3 space-y-2">
              {territories.map((territory) => (
                <div
                  key={territory.id}
                  className="flex items-center justify-between py-2 px-3 bg-surface-alt border border-border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-ink">{territory.country_code}</span>
                    {territory.region_name !== null && (
                      <span className="text-sm text-stone">{territory.region_name}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTerritory(territory.id)}
                    className="text-stone hover:text-danger transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ink/30 rounded-sm"
                    aria-label={`Remove ${territory.country_code}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {territories.length === 0 && (
            <p className="text-xs text-stone mb-3">No territories assigned.</p>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newCountryCode}
              onChange={(e) => setNewCountryCode(e.target.value)}
              placeholder="US, GB, DE..."
              className="input-field w-28"
              maxLength={2}
            />
            <input
              type="text"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
              placeholder="Region (optional)"
              className="input-field flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTerritory();
                }
              }}
            />
            <button type="button" onClick={handleAddTerritory} className="btn-primary text-sm">
              Add
            </button>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => void handleSaveTerritories()}
              disabled={savingTerritories}
              className="btn-primary text-sm"
            >
              {savingTerritories ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner w-4 h-4" />
                  Saving...
                </span>
              ) : 'Save Territories'}
            </button>
          </div>
        </div>

        {/* Availability */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="font-display text-base font-semibold text-ink mb-1">Availability</h2>
          <p className="text-sm text-stone font-body mb-1">
            Configure availability settings for this team member.
          </p>
          <p className="text-xs text-stone font-body mb-4">
            Availability routing assigns leads to the online member with the fewest active leads. Members are auto-set to offline after the configured inactivity timeout. Set max active leads to cap how many open leads this member can handle at once.
          </p>

          <form onSubmit={(e) => void handleSaveAvailability(e)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="avail-status" className="block text-sm font-medium text-ink mb-1">Status</label>
                <select
                  id="avail-status"
                  value={availability.status}
                  onChange={(e) => setAvailability((prev) => ({ ...prev, status: e.target.value as 'online' | 'offline' | 'busy' }))}
                  className="input-field w-full"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="avail-timezone" className="block text-sm font-medium text-ink mb-1">Timezone</label>
                <select
                  id="avail-timezone"
                  value={availability.timezone}
                  onChange={(e) => setAvailability((prev) => ({ ...prev, timezone: e.target.value }))}
                  className="input-field w-full"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="avail-max-leads" className="block text-sm font-medium text-ink mb-1">Max Active Leads</label>
                <input
                  id="avail-max-leads"
                  type="number"
                  min={0}
                  max={999}
                  value={availability.max_active_leads ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Math.max(0, Number(e.target.value));
                    setAvailability((prev) => ({ ...prev, max_active_leads: val }));
                  }}
                  placeholder="No limit"
                  className="input-field w-full"
                />
                <p className="mt-1 text-xs text-stone">Leave empty for no limit.</p>
              </div>
              <div>
                <label htmlFor="avail-auto-offline" className="block text-sm font-medium text-ink mb-1">Auto-offline (minutes)</label>
                <input
                  id="avail-auto-offline"
                  type="number"
                  min={5}
                  max={480}
                  value={availability.auto_offline_minutes}
                  onChange={(e) => {
                    const val = Math.max(5, Math.min(480, Number(e.target.value)));
                    setAvailability((prev) => ({ ...prev, auto_offline_minutes: val }));
                  }}
                  className="input-field w-full"
                />
                <p className="mt-1 text-xs text-stone">Set to offline after this many minutes of inactivity.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={savingAvailability} className="btn-primary text-sm">
                {savingAvailability ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="spinner w-4 h-4" />
                    Saving...
                  </span>
                ) : 'Save Availability'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
