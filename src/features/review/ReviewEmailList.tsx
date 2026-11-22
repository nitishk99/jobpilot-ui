import { ArrowUpRight, Mail } from 'lucide-react';
import { Pagination } from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/format';
import type { ReviewEmail } from '../emails/email.types';

interface ReviewEmailListProps {
  items: ReviewEmail[];
  selectedId?: string;
  page: number;
  totalPages: number;
  total: number;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function ReviewEmailList({
  items,
  selectedId,
  page,
  totalPages,
  total,
  disabled = false,
  onSelect,
  onPageChange,
}: ReviewEmailListProps) {
  return (
    <section className="panel review-list-panel">
      <div className="panel-heading">
        <div>
          <h2>Needs your attention</h2>
          <p>Choose an email to inspect and associate.</p>
        </div>
      </div>
      <div className="review-list">
        {items.map((item) => (
          <button
            key={item.id}
            className={`review-list-item ${selectedId === item.id ? 'selected' : ''}`}
            disabled={disabled}
            onClick={() => onSelect(item.id)}
          >
            <span className="review-mail-icon"><Mail size={17} /></span>
            <span className="review-item-content">
              <strong>{item.subject || '(No subject)'}</strong>
              <span>{item.senderName || item.senderOrganization || item.fromEmail || 'Unknown sender'}</span>
              <span className="review-item-meta">
                {item.companyName || 'Company unknown'} {item.jobTitle ? `· ${item.jobTitle}` : ''}
              </span>
              <small>{formatDateTime(item.receivedAt)}</small>
            </span>
            <ArrowUpRight size={15} className="review-open-icon" />
          </button>
        ))}
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        disabled={disabled}
        onChange={onPageChange}
      />
    </section>
  );
}
