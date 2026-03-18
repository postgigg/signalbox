import Link from 'next/link';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

import { TicketDetail } from './TicketDetail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTicketDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = user?.email ?? '';
  const db = createAdminClient();

  const { data: ticket, error } = await db
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !ticket) {
    return (
      <div>
        <Link href="/admin/tickets" className="text-sm text-signal hover:underline">
          Back to Tickets
        </Link>
        <div className="card mt-4 text-center py-10">
          <p className="text-sm text-stone">Ticket not found.</p>
        </div>
      </div>
    );
  }

  const { data: messages } = await db
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  return (
    <div>
      <Link href="/admin/tickets" className="text-sm text-signal hover:underline">
        Back to Tickets
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <h1 className="page-heading">{ticket.subject}</h1>
        <span className="text-xs font-body font-medium px-1.5 py-0.5 bg-danger text-white rounded-sm">
          ADMIN
        </span>
      </div>
      <TicketDetail ticket={ticket} initialMessages={messages ?? []} adminEmail={adminEmail} />
    </div>
  );
}
