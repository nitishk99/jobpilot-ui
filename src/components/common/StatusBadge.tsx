import { titleCase } from '../../utils/format';

export function StatusBadge({ status }: { status?: string | null }) {
  const normalized = (status ?? 'UNKNOWN').toLowerCase().replaceAll('_', '-');
  return <span className={`status-badge status-${normalized}`}><i aria-hidden="true" />{titleCase(status)}</span>;
}
