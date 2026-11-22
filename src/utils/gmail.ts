export function getGmailUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.hostname === 'mail.google.com' && !url.port && !url.username && !url.password) {
      return url.href;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
