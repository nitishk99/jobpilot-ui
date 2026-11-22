import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, total, onChange, disabled = false }: { page: number; totalPages: number; total: number; onChange: (page: number) => void; disabled?: boolean }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <span>{total} results · Page {page} of {totalPages}</span>
      <div className="pagination-actions">
        <button className="icon-button" aria-label="Previous page" disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={17} /></button>
        <button className="icon-button" aria-label="Next page" disabled={disabled || page >= totalPages} onClick={() => onChange(page + 1)}><ChevronRight size={17} /></button>
      </div>
    </div>
  );
}
