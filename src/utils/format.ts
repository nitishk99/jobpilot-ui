export function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function formatDateTime(value?: string | null) {
  return formatDate(value, {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function initials(value?: string | null) {
  if (!value?.trim()) return 'JP';
  return value.trim().split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'JP';
}

export function titleCase(value?: string | null) {
  if (!value) return 'Unknown';
  return value.toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
