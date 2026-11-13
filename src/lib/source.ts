export function encodeSource(sourceUrl: string) {
  const bytes = new TextEncoder().encode(sourceUrl);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeSource(encoded: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error("Invalid Base64URL.");
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
