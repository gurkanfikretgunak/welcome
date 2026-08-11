/** Shared client validation for date / time / datetime-local fields (issue #19). */

export const MIN_VALID_YEAR = 1900
export const MAX_VALID_YEAR = 2100

export function isValidYear(year: number): boolean {
  return Number.isInteger(year) && year >= MIN_VALID_YEAR && year <= MAX_VALID_YEAR
}

/** `HH:MM` or `HH:MM:SS` — hours 0–23, minutes/seconds 0–59. */
export function isValidTimeString(value: string): boolean {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return false
  const h = Number(m[1])
  const min = Number(m[2])
  const sec = m[3] != null ? Number(m[3]) : 0
  return h >= 0 && h <= 23 && min >= 0 && min <= 59 && sec >= 0 && sec <= 59
}

/** `YYYY-MM-DD` with year in range and a real calendar day. */
export function isValidDateString(value: string): boolean {
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return false
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (!isValidYear(year) || month < 1 || month > 12 || day < 1 || day > 31) return false
  const d = new Date(Date.UTC(year, month - 1, day))
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day
}

/** `YYYY-MM-DDTHH:MM` or with seconds (datetime-local). */
export function isValidDateTimeLocal(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  const [datePart, timePart] = trimmed.split('T')
  if (!datePart || !timePart) return false
  return isValidDateString(datePart) && isValidTimeString(timePart)
}

export function datetimeLocalBounds() {
  return {
    min: `${MIN_VALID_YEAR}-01-01T00:00`,
    max: `${MAX_VALID_YEAR}-12-31T23:59`,
  }
}

export function dateInputBounds() {
  return {
    min: `${MIN_VALID_YEAR}-01-01`,
    max: `${MAX_VALID_YEAR}-12-31`,
  }
}

export function validateDateTimeLocal(value: string): string | null {
  if (!value.trim()) return 'Date and time are required.'
  if (!isValidDateTimeLocal(value)) {
    return `Enter a valid date/time (year ${MIN_VALID_YEAR}–${MAX_VALID_YEAR}, time HH:MM).`
  }
  return null
}

export function validateDateInput(value: string): string | null {
  if (!value.trim()) return null
  if (!isValidDateString(value)) {
    return `Enter a valid date (year ${MIN_VALID_YEAR}–${MAX_VALID_YEAR}).`
  }
  return null
}

export function validateTimeInput(value: string): string | null {
  if (!value.trim()) return null
  if (!isValidTimeString(value)) {
    return 'Enter a valid time (hours 00–23, minutes 00–59).'
  }
  return null
}
