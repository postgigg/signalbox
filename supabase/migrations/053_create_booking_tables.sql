-- 053: Create booking_settings and bookings tables for native booking calendar
-- ============================================================================

-- booking_settings: per-widget booking configuration
CREATE TABLE booking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL UNIQUE REFERENCES widgets(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  tiers TEXT[] NOT NULL DEFAULT '{hot}',
  slot_duration_minutes INT NOT NULL DEFAULT 30 CHECK (slot_duration_minutes IN (15, 30, 45, 60)),
  buffer_minutes INT NOT NULL DEFAULT 15 CHECK (buffer_minutes >= 0 AND buffer_minutes <= 60),
  min_notice_hours INT NOT NULL DEFAULT 2 CHECK (min_notice_hours >= 1 AND min_notice_hours <= 72),
  max_advance_days INT NOT NULL DEFAULT 14 CHECK (max_advance_days >= 1 AND max_advance_days <= 60),
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  schedule JSONB NOT NULL DEFAULT '{"mon":{"start":"09:00","end":"17:00"},"tue":{"start":"09:00","end":"17:00"},"wed":{"start":"09:00","end":"17:00"},"thu":{"start":"09:00","end":"17:00"},"fri":{"start":"09:00","end":"17:00"},"sat":null,"sun":null}',
  heading_text TEXT NOT NULL DEFAULT 'Book a call with our team',
  confirm_text TEXT NOT NULL DEFAULT 'Your call is booked.',
  booking_mode TEXT NOT NULL DEFAULT 'widget' CHECK (booking_mode IN ('widget', 'member')),
  reschedule_deadline_hours INT NOT NULL DEFAULT 2,
  reminder_hours_before INT NOT NULL DEFAULT 24,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_settings_widget_id ON booking_settings(widget_id);
CREATE INDEX idx_booking_settings_account_id ON booking_settings(account_id);

-- bookings: actual appointments
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  visitor_phone TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  cancelled_at TIMESTAMPTZ,
  confirmation_sent BOOLEAN NOT NULL DEFAULT false,
  owner_notified BOOLEAN NOT NULL DEFAULT false,
  reschedule_token TEXT UNIQUE,
  reschedule_token_expires_at TIMESTAMPTZ,
  rescheduled_from TIMESTAMPTZ,
  reschedule_count INT NOT NULL DEFAULT 0,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  google_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_widget_starts ON bookings(widget_id, starts_at) WHERE status = 'confirmed';
CREATE INDEX idx_bookings_account_id ON bookings(account_id);
CREATE INDEX idx_bookings_submission_id ON bookings(submission_id);
CREATE INDEX idx_bookings_reschedule_token ON bookings(reschedule_token) WHERE reschedule_token IS NOT NULL;
CREATE INDEX idx_bookings_reminder ON bookings(starts_at) WHERE status = 'confirmed' AND reminder_sent = false;

-- Overlap prevention trigger
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE widget_id = NEW.widget_id
      AND status = 'confirmed'
      AND id != NEW.id
      AND starts_at < NEW.ends_at
      AND ends_at > NEW.starts_at
  ) THEN
    RAISE EXCEPTION 'Booking time slot overlaps with an existing confirmed booking';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_booking_overlap
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION check_booking_overlap();

-- updated_at triggers
CREATE OR REPLACE FUNCTION update_booking_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_settings_updated_at
  BEFORE UPDATE ON booking_settings
  FOR EACH ROW EXECUTE FUNCTION update_booking_settings_updated_at();

CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_bookings_updated_at();

-- RLS
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on booking_settings" ON booking_settings FOR ALL USING (true);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on bookings" ON bookings FOR ALL USING (true);

-- Booking analytics columns on widget_analytics
ALTER TABLE widget_analytics
  ADD COLUMN IF NOT EXISTS bookings_created INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bookings_completed INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bookings_cancelled INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bookings_no_show INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bookings_rescheduled INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hot_leads_with_booking INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_booking_delay_seconds BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS booking_delay_count INT NOT NULL DEFAULT 0;
