import type { LeadTier } from '@/lib/supabase/types';
import { TIER_CONFIG } from '@/lib/constants';

const SLACK_WEBHOOK_PREFIX = 'https://hooks.slack.com/';
const SLACK_TIMEOUT_MS = 5000;

interface SlackNotificationParams {
  readonly leadName: string;
  readonly leadEmail: string;
  readonly leadTier: LeadTier;
  readonly leadScore: number;
  readonly widgetName: string;
}

function getTierEmoji(tier: LeadTier): string {
  if (tier === 'hot') return ':fire:';
  if (tier === 'warm') return ':sunny:';
  return ':snowflake:';
}

export async function sendSlackNotification(
  webhookUrl: string,
  params: SlackNotificationParams,
): Promise<void> {
  if (!webhookUrl.startsWith(SLACK_WEBHOOK_PREFIX)) {
    throw new Error('Invalid Slack webhook URL');
  }

  const tierLabel = TIER_CONFIG[params.leadTier].label;
  const emoji = getTierEmoji(params.leadTier);

  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${tierLabel} Lead ${emoji}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${params.leadName}` },
          { type: 'mrkdwn', text: `*Email:*\n${params.leadEmail}` },
          { type: 'mrkdwn', text: `*Score:*\n${String(params.leadScore)}` },
          { type: 'mrkdwn', text: `*Widget:*\n${params.widgetName}` },
        ],
      },
    ],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SLACK_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Slack webhook returned ${String(response.status)}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendSlackTestMessage(webhookUrl: string): Promise<void> {
  if (!webhookUrl.startsWith(SLACK_WEBHOOK_PREFIX)) {
    throw new Error('Invalid Slack webhook URL');
  }

  const payload = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':white_check_mark: *SignalBox Slack integration is working.* You will receive lead notifications in this channel.',
        },
      },
    ],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SLACK_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Slack webhook returned ${String(response.status)}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
