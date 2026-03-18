'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import type { FormEvent } from 'react';

interface TeamMember {
  readonly id: string;
  readonly user_id: string;
  readonly role: 'owner' | 'admin' | 'viewer';
  readonly invited_email: string | null;
  readonly accepted_at: string | null;
  readonly created_at: string;
}

const SETTINGS_NAV = [
  { href: '/dashboard/settings', label: 'Account' },
  { href: '/dashboard/settings/team', label: 'Team' },
  { href: '/dashboard/settings/billing', label: 'Billing' },
  { href: '/dashboard/settings/notifications', label: 'Notifications' },
  { href: '/dashboard/settings/api', label: 'API' },
] as const;

const ROLES = ['admin', 'viewer'] as const;

export default function TeamSettingsPage(): React.ReactElement {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'viewer'>('viewer');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeam(): Promise<void> {
      try {
        const { createBrowserClient } = await import('@supabase/ssr');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: memberData } = await supabase
          .from('members')
          .select('account_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!memberData) return;

        const { data } = await supabase
          .from('members')
          .select('id, user_id, role, invited_email, accepted_at, created_at')
          .eq('account_id', memberData.account_id)
          .order('created_at', { ascending: true });

        setMembers((data as TeamMember[]) ?? []);
      } catch {
        // Failed to load team
      } finally {
        setLoading(false);
      }
    }
    void loadTeam();
  }, []);

  const [inviteSuccess, setInviteSuccess] = useState(false);

  async function handleInvite(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setInviting(true);

    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in.');
        return;
      }

      const { data: memberData } = await supabase
        .from('members')
        .select('account_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!memberData) {
        setError('Account not found.');
        return;
      }

      const { error: insertError } = await supabase
        .from('members')
        .insert({
          account_id: memberData.account_id,
          user_id: crypto.randomUUID(),
          role: inviteRole,
          invited_email: inviteEmail.trim().toLowerCase(),
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setInviteEmail('');
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);

      // Reload members
      const { data } = await supabase
        .from('members')
        .select('id, user_id, role, invited_email, accepted_at, created_at')
        .eq('account_id', memberData.account_id)
        .order('created_at', { ascending: true });

      setMembers((data as TeamMember[]) ?? []);
    } catch {
      setError('Failed to send invitation.');
    } finally {
      setInviting(false);
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
      <h1 className="page-heading">Settings</h1>

      <nav className="mt-4 flex gap-1 border-b border-border mb-6">
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2.5 text-sm font-body transition-colors duration-fast -mb-px ${
              item.href === '/dashboard/settings/team'
                ? 'text-ink font-medium border-b-2 border-ink'
                : 'text-stone hover:text-ink border-b-2 border-transparent'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <h2 className="font-display text-lg font-semibold text-ink">Team Members</h2>

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
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="table-row">
                    <td className="py-3 px-4 font-medium text-ink">
                      {member.invited_email ?? member.user_id.slice(0, 8)}
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
                    <td className="py-3 px-4 text-stone">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {member.role !== 'owner' && (
                        <button type="button" className="text-xs text-danger hover:text-danger/80 transition-colors duration-fast">
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
