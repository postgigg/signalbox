import type { ContactInfo, ValidationErrors, WidgetConfig } from './types';

// ── Email Regex ────────────────────────────────────────────────────────────
// Pragmatic email pattern: local@domain.tld
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Phone: digits, spaces, +, -, (, ), .
const PHONE_RE = /^[+\d\s().-]+$/;

// ── Limits ─────────────────────────────────────────────────────────────────
const NAME_MAX = 200;
const PHONE_MAX = 30;
const MESSAGE_MAX = 2000;

// ── Validate Contact Form ──────────────────────────────────────────────────
export function validateContact(
  contact: ContactInfo,
  config: WidgetConfig
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Name: required, 1-200 chars
  const name = (contact.name ?? '').trim();
  if (!name) {
    errors.name = 'Name is required.';
  } else if (name.length > NAME_MAX) {
    errors.name = `Name must be ${NAME_MAX} characters or fewer.`;
  }

  // Email: required, valid format
  const email = (contact.email ?? '').trim();
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  // Phone: optional (or required based on config), max 30 chars
  if (config.contactShowPhone) {
    const phone = (contact.phone ?? '').trim();
    if (config.contactPhoneRequired && !phone) {
      errors.phone = 'Phone number is required.';
    } else if (phone && !PHONE_RE.test(phone)) {
      errors.phone = 'Please enter a valid phone number.';
    } else if (phone && phone.length > PHONE_MAX) {
      errors.phone = `Phone must be ${PHONE_MAX} characters or fewer.`;
    }
  }

  // Message: optional (or required based on config), max 2000 chars
  if (config.contactShowMessage) {
    const message = (contact.message ?? '').trim();
    if (config.contactMessageRequired && !message) {
      errors.message = 'Message is required.';
    } else if (message && message.length > MESSAGE_MAX) {
      errors.message = `Message must be ${MESSAGE_MAX} characters or fewer.`;
    }
  }

  return errors;
}

// ── Check if errors object is empty ────────────────────────────────────────
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
