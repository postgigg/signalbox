import { Resend } from 'resend';

import { NO_REPLY_EMAIL, APP_NAME } from '../constants';

// ---------------------------------------------------------------------------
// Resend client singleton
// ---------------------------------------------------------------------------

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY environment variable');
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

// ---------------------------------------------------------------------------
// Send email
// ---------------------------------------------------------------------------

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  success: boolean;
  id: string | null;
  error: string | null;
}

/**
 * Send an email via Resend.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const resend = getResend();

  const from = options.from ?? `${APP_NAME} <${NO_REPLY_EMAIL}>`;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
      tags: options.tags,
    });

    if (error) {
      return { success: false, id: null, error: error.message };
    }

    return { success: true, id: data?.id ?? null, error: null };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown email error';
    return { success: false, id: null, error: message };
  }
}

/**
 * Send multiple emails in a batch. Uses Resend's batch API for efficiency.
 */
export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<SendEmailResult[]> {
  const resend = getResend();

  const from = `${APP_NAME} <${NO_REPLY_EMAIL}>`;

  try {
    const { data, error } = await resend.batch.send(
      emails.map((email) => ({
        from: email.from ?? from,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: email.replyTo,
        tags: email.tags,
      }))
    );

    if (error) {
      return emails.map(() => ({
        success: false,
        id: null,
        error: error.message,
      }));
    }

    return (data?.data ?? []).map((item) => ({
      success: true,
      id: item.id,
      error: null,
    }));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown email error';
    return emails.map(() => ({ success: false, id: null, error: message }));
  }
}
