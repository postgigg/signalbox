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
  attachments?: Array<{ filename: string; content: Buffer }>;
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

  const from = options.from ?? process.env.EMAIL_FROM ?? `${APP_NAME} <${NO_REPLY_EMAIL}>`;

  try {
    const emailPayload: Parameters<typeof resend.emails.send>[0] = {
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    };
    if (options.text) emailPayload.text = options.text;
    if (options.replyTo) emailPayload.reply_to = options.replyTo;
    if (options.tags) emailPayload.tags = options.tags;
    if (options.attachments) emailPayload.attachments = options.attachments;

    const { data, error } = await resend.emails.send(emailPayload);

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
    const batch = emails.map((email) => {
      const item: Parameters<typeof resend.emails.send>[0] = {
        from: email.from ?? from,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
      };
      if (email.text) item.text = email.text;
      if (email.replyTo) item.reply_to = email.replyTo;
      if (email.tags) item.tags = email.tags;
      return item;
    });

    const { data, error } = await resend.batch.send(batch);

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
