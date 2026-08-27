const PREFIX = "noces:checkin:";

export function extractCheckInToken(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith(PREFIX)) return trimmed.slice(PREFIX.length);
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("token") ?? trimmed;
  } catch {
    return trimmed;
  }
}

export function checkInPayload(token: string) {
  return `${PREFIX}${token}`;
}
