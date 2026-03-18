import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database } from '../../lib/supabase/types';

type AccountRow = Database['public']['Tables']['accounts']['Row'];

const BATCH_SIZE = 25;
const RETENTION_DAYS = 90;

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

function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  return new Stripe(secretKey, {
    apiVersion: '2024-04-10',
    typescript: true,
  });
}

/**
 * Cancel an active Stripe subscription for an account.
 * Silently handles cases where the subscription is already canceled or missing.
 */
async function cancelStripeSubscription(
  stripe: Stripe,
  account: AccountRow,
): Promise<void> {
  if (!account.stripe_subscription_id) {
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(account.stripe_subscription_id);

    if (subscription.status !== 'canceled') {
      await stripe.subscriptions.cancel(account.stripe_subscription_id, {
        prorate: false,
      });
      console.log(`[cleanup-deleted-accounts] Canceled Stripe subscription ${account.stripe_subscription_id} for account ${account.id}`);
    }
  } catch (err) {
    // Stripe may return a resource_missing error if the subscription was already deleted
    if (err instanceof Stripe.errors.StripeError && err.code === 'resource_missing') {
      console.log(`[cleanup-deleted-accounts] Subscription ${account.stripe_subscription_id} already deleted in Stripe`);
    } else {
      console.error(
        `[cleanup-deleted-accounts] Failed to cancel Stripe subscription for account ${account.id}:`,
        err instanceof Error ? err.message : String(err),
      );
      throw err;
    }
  }
}

/**
 * Delete all data associated with an account.
 * Deletion order respects foreign key constraints:
 * 1. submissions (references widgets and accounts)
 * 2. widget_analytics (references widgets and accounts)
 * 3. flows (references widgets)
 * 4. widgets (references accounts)
 * 5. webhook_endpoints (references accounts)
 * 6. api_keys (references accounts)
 * 7. members (references accounts)
 * 8. notification_preferences (references accounts)
 * 9. accounts
 */
async function deleteAccountData(
  supabase: SupabaseClient<Database>,
  accountId: string,
): Promise<void> {
  // Delete submissions
  const { error: submissionsError } = await supabase
    .from('submissions')
    .delete()
    .eq('account_id', accountId);

  if (submissionsError) {
    throw new Error(`Failed to delete submissions: ${submissionsError.message}`);
  }

  // Delete widget analytics
  const { error: analyticsError } = await supabase
    .from('widget_analytics')
    .delete()
    .eq('account_id', accountId);

  if (analyticsError) {
    throw new Error(`Failed to delete widget_analytics: ${analyticsError.message}`);
  }

  // Get widget IDs to delete flows
  const { data: widgets, error: widgetQueryError } = await supabase
    .from('widgets')
    .select('id')
    .eq('account_id', accountId);

  if (widgetQueryError) {
    throw new Error(`Failed to query widgets: ${widgetQueryError.message}`);
  }

  if (widgets && widgets.length > 0) {
    const widgetIds = widgets.map((w) => w.id);

    // Delete flows for these widgets
    const { error: flowsError } = await supabase
      .from('flows')
      .delete()
      .in('widget_id', widgetIds);

    if (flowsError) {
      throw new Error(`Failed to delete flows: ${flowsError.message}`);
    }
  }

  // Delete widgets
  const { error: widgetsError } = await supabase
    .from('widgets')
    .delete()
    .eq('account_id', accountId);

  if (widgetsError) {
    throw new Error(`Failed to delete widgets: ${widgetsError.message}`);
  }

  // Delete webhook endpoints
  const { error: webhooksError } = await supabase
    .from('webhook_endpoints')
    .delete()
    .eq('account_id', accountId);

  if (webhooksError) {
    throw new Error(`Failed to delete webhook_endpoints: ${webhooksError.message}`);
  }

  // Delete API keys
  const { error: apiKeysError } = await supabase
    .from('api_keys')
    .delete()
    .eq('account_id', accountId);

  if (apiKeysError) {
    throw new Error(`Failed to delete api_keys: ${apiKeysError.message}`);
  }

  // Delete members
  const { error: membersError } = await supabase
    .from('members')
    .delete()
    .eq('account_id', accountId);

  if (membersError) {
    throw new Error(`Failed to delete members: ${membersError.message}`);
  }

  // Delete notification preferences
  const { error: notifPrefsError } = await supabase
    .from('notification_preferences')
    .delete()
    .eq('account_id', accountId);

  if (notifPrefsError) {
    throw new Error(`Failed to delete notification_preferences: ${notifPrefsError.message}`);
  }

  // Finally, delete the account itself
  const { error: accountError } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId);

  if (accountError) {
    throw new Error(`Failed to delete account: ${accountError.message}`);
  }
}

export default async function handler(): Promise<void> {
  const supabase = createAdminClient();
  const stripe = createStripeClient();

  const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  console.log(`[cleanup-deleted-accounts] Finding accounts soft-deleted before ${cutoffDate}`);

  let totalDeleted = 0;
  let totalFailed = 0;
  let hasMore = true;

  while (hasMore) {
    // Always query from the beginning since we're deleting as we go
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .not('deleted_at', 'is', null)
      .lt('deleted_at', cutoffDate)
      .limit(BATCH_SIZE);

    if (error) {
      console.error('[cleanup-deleted-accounts] Failed to query deleted accounts:', error.message);
      return;
    }

    if (!accounts || accounts.length === 0) {
      hasMore = false;
      break;
    }

    for (const account of accounts) {
      try {
        // Cancel any active Stripe subscription first
        await cancelStripeSubscription(stripe, account);

        // Delete all account data from the database
        await deleteAccountData(supabase, account.id);

        console.log(`[cleanup-deleted-accounts] Permanently deleted account ${account.id} (${account.name})`);
        totalDeleted++;
      } catch (err) {
        console.error(
          `[cleanup-deleted-accounts] Failed to delete account ${account.id}:`,
          err instanceof Error ? err.message : String(err),
        );
        totalFailed++;
      }
    }

    // If we processed fewer than BATCH_SIZE, there might still be more
    // since some could have failed. But if all succeeded and batch was full,
    // continue. If all failed, stop to avoid infinite loop.
    if (totalFailed >= accounts.length) {
      console.error('[cleanup-deleted-accounts] All accounts in batch failed, stopping');
      hasMore = false;
    } else if (accounts.length < BATCH_SIZE) {
      hasMore = false;
    }
  }

  console.log(`[cleanup-deleted-accounts] Complete: ${totalDeleted} permanently deleted, ${totalFailed} failed`);
}
