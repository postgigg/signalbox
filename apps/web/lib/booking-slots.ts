// ---------------------------------------------------------------------------
// Booking slot generation algorithm
// ---------------------------------------------------------------------------

export interface BookingScheduleDay {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface BookingSchedule {
  mon: BookingScheduleDay | null;
  tue: BookingScheduleDay | null;
  wed: BookingScheduleDay | null;
  thu: BookingScheduleDay | null;
  fri: BookingScheduleDay | null;
  sat: BookingScheduleDay | null;
  sun: BookingScheduleDay | null;
}

export interface SlotConfig {
  slotDurationMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  timezone: string;
  schedule: BookingSchedule;
}

export interface ExistingBooking {
  starts_at: string;
  ends_at: string;
}

export interface TimeSlot {
  start: string;    // "9:00 AM"
  end: string;      // "9:30 AM"
  startsAt: string;  // ISO 8601 UTC
  endsAt: string;    // ISO 8601 UTC
}

export interface DaySlots {
  date: string;      // "2026-04-07"
  dayLabel: string;  // "Mon, Apr 7"
  slots: TimeSlot[];
}

const DAY_KEYS: ReadonlyArray<keyof BookingSchedule> = [
  'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
];

/**
 * Parse "HH:MM" into total minutes from midnight.
 */
function parseTimeToMinutes(time: string): number {
  const parts = time.split(':');
  const hours = parseInt(parts[0] ?? '0', 10);
  const minutes = parseInt(parts[1] ?? '0', 10);
  return hours * 60 + minutes;
}

/**
 * Format a Date in the given timezone as a localized time string (e.g., "9:00 AM").
 */
function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(date);
}

/**
 * Format a Date in the given timezone as a day label (e.g., "Mon, Apr 7").
 */
function formatDayLabel(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(date);
}

/**
 * Format a Date in the given timezone as YYYY-MM-DD.
 */
function formatDateString(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  }).format(date);
  return parts;
}

/**
 * Create a Date representing a specific local time in a timezone.
 * E.g., "2026-04-07" at "09:00" in "America/New_York" => UTC Date.
 */
function localTimeToUtc(
  dateStr: string,
  timeMinutes: number,
  timezone: string
): Date {
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  const localStr = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  // Use Intl to figure out the UTC offset for this specific local time
  const tempDate = new Date(localStr + 'Z');
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Binary search approach: start with an estimate, refine
  // Simpler: use the target local time string and work backwards
  // We construct a date in the target tz, then find what UTC time that corresponds to
  const parts = formatter.formatToParts(tempDate);
  const getPart = (type: string): string =>
    parts.find((p) => p.type === type)?.value ?? '00';

  const tzHours = parseInt(getPart('hour'), 10);
  const tzMinutes = parseInt(getPart('minute'), 10);
  const utcMinutesOfTemp = tempDate.getUTCHours() * 60 + tempDate.getUTCMinutes();
  const tzMinutesOfTemp = tzHours * 60 + tzMinutes;
  const offsetMinutes = utcMinutesOfTemp - tzMinutesOfTemp;

  // Now apply offset to get the desired UTC time
  const targetUtcMinutes = timeMinutes + offsetMinutes;
  const result = new Date(`${dateStr}T00:00:00Z`);
  result.setUTCMinutes(targetUtcMinutes);

  return result;
}

/**
 * Check whether two time ranges overlap.
 */
function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Generate available booking slots for a given config and date range.
 */
export function generateAvailableSlots(
  config: SlotConfig,
  existingBookings: ExistingBooking[],
  fromDate: Date,
  days: number
): DaySlots[] {
  const now = new Date();
  const minNoticeMs = config.minNoticeHours * 60 * 60 * 1000;
  const maxAdvanceMs = config.maxAdvanceDays * 24 * 60 * 60 * 1000;
  const maxDate = new Date(now.getTime() + maxAdvanceMs);

  const parsedBookings = existingBookings.map((b) => ({
    start: new Date(b.starts_at),
    end: new Date(b.ends_at),
  }));

  const result: DaySlots[] = [];

  for (let d = 0; d < days; d++) {
    const dayDate = new Date(fromDate.getTime() + d * 24 * 60 * 60 * 1000);
    const dateStr = formatDateString(dayDate, config.timezone);
    const dayLabel = formatDayLabel(dayDate, config.timezone);

    // Determine the day of week in the target timezone
    const dayOfWeek = new Date(dateStr + 'T12:00:00Z').getDay();
    const dayKey = DAY_KEYS[dayOfWeek];
    if (!dayKey) continue;

    const scheduleDay = config.schedule[dayKey];
    if (!scheduleDay) {
      result.push({ date: dateStr, dayLabel, slots: [] });
      continue;
    }

    const startMinutes = parseTimeToMinutes(scheduleDay.start);
    const endMinutes = parseTimeToMinutes(scheduleDay.end);
    const step = config.slotDurationMinutes + config.bufferMinutes;
    const daySlots: TimeSlot[] = [];

    for (let m = startMinutes; m + config.slotDurationMinutes <= endMinutes; m += step) {
      const slotStart = localTimeToUtc(dateStr, m, config.timezone);
      const slotEnd = localTimeToUtc(dateStr, m + config.slotDurationMinutes, config.timezone);

      // Filter: must be after min notice
      if (slotStart.getTime() < now.getTime() + minNoticeMs) continue;

      // Filter: must be before max advance
      if (slotStart > maxDate) continue;

      // Filter: must not overlap with existing confirmed bookings
      const hasOverlap = parsedBookings.some((b) =>
        rangesOverlap(slotStart, slotEnd, b.start, b.end)
      );
      if (hasOverlap) continue;

      daySlots.push({
        start: formatTime(slotStart, config.timezone),
        end: formatTime(slotEnd, config.timezone),
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
      });
    }

    result.push({ date: dateStr, dayLabel, slots: daySlots });
  }

  return result;
}
