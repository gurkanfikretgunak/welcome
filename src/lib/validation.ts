// Turkish character validation and sanitization helpers

// Allowed characters: Latin (A-Z, a-z), Turkish letters, digits, spaces and common punctuation
// Adjust the character class if you want to be stricter/looser per field.
const TURKISH_ALLOWED_REGEX = /[^A-Za-zÇĞİÖŞÜçğıöşü0-9 \-_'`.(),:;!?/\\]/g

// For names, be stricter: only letters (including Turkish) and spaces/hyphen/apostrophe
const TURKISH_NAME_DISALLOWED_REGEX = /[^A-Za-zÇĞİÖŞÜçğıöşü \-']/g

export function sanitizeTurkishText(input: string): string {
  if (!input) return ''
  return input.replace(TURKISH_ALLOWED_REGEX, '')
}

export function sanitizeTurkishName(input: string): string {
  if (!input) return ''
  return input.replace(TURKISH_NAME_DISALLOWED_REGEX, '')
}

export function isValidTurkishText(input: string): boolean {
  // Valid if no disallowed characters would be removed
  return input === sanitizeTurkishText(input)
}

export function isValidTurkishName(input: string): boolean {
  return input === sanitizeTurkishName(input)
}


