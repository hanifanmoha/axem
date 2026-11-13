const KEY = "axem:last_source";

// Stores the Base64URL-encoded source, the same value used in the address.
export function saveLastSource(encoded: string) {
  try {
    localStorage.setItem(KEY, encoded);
  } catch {
    // Persistence is optional.
  }
}

export function loadLastSource(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
