'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import type { FormEvent } from 'react';

interface TeamMember {
  readonly id: string;
  readonly user_id: string | null;
  readonly role: 'owner' | 'admin' | 'viewer';
  readonly invited_email: string | null;
  readonly email: string | null;
  readonly full_name: string | null;
  readonly accepted_at: string | null;
  readonly created_at: string;
}

interface MemberSummary {
  readonly skillsCount: number;
  readonly territoriesCount: number;
}

const ROLES = ['admin', 'viewer'] as const;

export default function TeamPage(): React.ReactElement {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberSummaries, setMemberSummaries] = useState<Record<string, MemberSummary>>({});
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'viewer'>('viewer');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    async function loadTeam(): Promise<void> {
      try {
        const response = await fetch('/api/v1/members');
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const result = await response.json() as { data: TeamMember[] };
        const teamMembers = result.data ?? [];
        setMembers(teamMembers);

        // Fetch skills and territories counts for each member
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const summaries: Record<string, MemberSummary> = {};
        for (const m of teamMembers) {
          const [skillsResult, territoriesResult] = await Promise.all([
            supabase
              .from('member_skills')
              .select('id', { count: 'exact', head: true })
              .eq('member_id', m.id),
            supabase
              .from('member_territories')
              .select('id', { count: 'exact', head: true })
              .eq('member_id', m.id),
          ]);
          summaries[m.id] = {
            skillsCount: skillsResult.count ?? 0,
            territoriesCount: territoriesResult.count ?? 0,
          };
        }
        setMemberSummaries(summaries);
      } catch {
        // Failed to load team
      } finally {
        setLoading(false);
      }
    }
    void loadTeam();
  }, []);

  async function handleInvite(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setInviting(true);

    try {
      const response = await fetch('/api/v1/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const result = await response.json() as { error: string };
        setError(result.error);
        return;
      }

      setInviteEmail('');
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);

      // Reload members
      const listResponse = await fetch('/api/v1/members');
      if (listResponse.ok) {
        const listResult = await listResponse.json() as { data: TeamMember[] };
        setMembers(listResult.data ?? []);
      }
    } catch {
      setError('Failed to send invitation.');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string): Promise<void> {
    if (!confirm('Remove this team member?')) return;
    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );
      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      setError('Failed to remove member.');
    }
  }

  function getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'owner':
        return 'bg-ink text-white';
      case 'admin':
        return 'bg-signal-light text-signal';
      default:
        return 'bg-surface-alt text-stone';
    }
  }

  return (
    <div>
      <h1 className="page-heading">Team</h1>

      <p className="mt-1 text-sm text-stone font-body mb-6">
        Manage your team members, roles, and invitations.
      </p>

      {error !== null && (
        <div className="mt-4 p-3 rounded-sm bg-danger-light text-danger text-sm border border-danger/20">
          {error}
        </div>
      )}

      {inviteSuccess && (
        <div className="mt-4 p-3 rounded-sm bg-success-light text-success text-sm border border-success/20">
          Invitation sent. The team member will appear as pending until they accept.
        </div>
      )}

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="mt-4 flex gap-2">
        <input
          type="email"
          placeholder="colleague@example.com"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          required
          className="input-field h-10 flex-1"
        />
        <select
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value as 'admin' | 'viewer')}
          className="input-field h-10 w-28"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
        <button type="submit" disabled={inviting} className="btn-primary h-10">
          {inviting ? (
            <span className="inline-flex items-center gap-2">
              <span className="spinner w-4 h-4" />
              Inviting...
            </span>
          ) : 'Invite'}
        </button>
      </form>

      {/* Help Guide */}
      <div className="mt-6 border border-border rounded-md p-4 bg-surface-alt">
        <h3 className="text-sm font-medium text-ink mb-2">How team profiles work with lead routing</h3>
        <ul className="text-xs text-stone space-y-1.5 font-body list-none">
          <li className="flex items-start gap-2">
            <span className="text-signal font-medium shrink-0">Skills</span>
            <span>Assign skill tags (e.g. "sales", "technical") to members. Skill-based routing matches incoming leads to members whose tags overlap with the rule.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-signal font-medium shrink-0">Territories</span>
            <span>Assign 2-letter ISO country codes (e.g. US, GB, DE) to members. Geographic routing sends leads to the member whose territory matches the visitor's country.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-signal font-medium shrink-0">Availability</span>
            <span>Set each member's status (online/offline/busy), max active leads, and auto-offline timeout. Availability routing picks the online member with the fewest active leads.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-signal font-medium shrink-0">Round-Robin</span>
            <span>Add members to a pool in your routing rule. Leads are distributed evenly, respecting each member's capacity limits.</span>
          </li>
        </ul>
        <p className="text-xs text-stone mt-2 font-body">
          Click a member's name to configure their skills, territories, and availability. Then create routing rules in Settings &gt; Routing.
        </p>
      </div>

      {/* Member List */}
      <div className="mt-6">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-3 px-4"><div className="skeleton h-3 w-16" /></th>
                  <th className="text-left py-3 px-4"><div className="skeleton h-3 w-10" /></th>
                  <th className="text-left py-3 px-4"><div className="skeleton h-3 w-12" /></th>
                  <th className="text-left py-3 px-4"><div className="skeleton h-3 w-14" /></th>
                  <th className="text-right py-3 px-4"><div className="skeleton h-3 w-14 ml-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="table-row">
                    <td className="py-3 px-4"><div className="skeleton h-4 w-32" /></td>
                    <td className="py-3 px-4"><div className="skeleton h-5 w-14 rounded-pill" /></td>
                    <td className="py-3 px-4"><div className="skeleton h-4 w-12" /></td>
                    <td className="py-3 px-4"><div className="skeleton h-4 w-20" /></td>
                    <td className="py-3 px-4 text-right"><div className="skeleton h-4 w-14 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : members.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-sm text-stone">No team members found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-3 px-4 font-medium">Member</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Summary</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const summary = memberSummaries[member.id];
                  return (
                    <tr key={member.id} className="table-row">
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/team/${member.id}`}
                          className="text-ink hover:text-signal transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ink/30 rounded-sm"
                        >
                          <div className="font-medium">
                            {member.full_name ?? member.email ?? member.invited_email ?? member.id.slice(0, 8)}
                          </div>
                          {member.full_name && member.email ? (
                            <div className="text-xs text-stone font-normal">{member.email}</div>
                          ) : null}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${getRoleBadgeClass(member.role)}`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {member.accepted_at ? (
                          <span className="text-xs text-success">Active</span>
                        ) : (
                          <span className="text-xs text-warning">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {summary ? (
                          <span className="text-xs text-stone">
                            {summary.skillsCount} {summary.skillsCount === 1 ? 'skill' : 'skills'},
                            {' '}{summary.territoriesCount} {summary.territoriesCount === 1 ? 'territory' : 'territories'}
                          </span>
                        ) : (
                          <div className="skeleton h-3 w-20" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone">
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {member.role !== 'owner' && (
                          <button
                            type="button"
                            onClick={() => void handleRemoveMember(member.id)}
                            className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
