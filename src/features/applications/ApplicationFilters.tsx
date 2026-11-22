import { ArrowUpDown, Search, X } from 'lucide-react';

interface ApplicationFiltersProps {
  search: string;
  sort: 'recent' | 'oldest' | 'company';
  onSearchChange: (value: string) => void;
  onSortChange: (value: 'recent' | 'oldest' | 'company') => void;
}

export function ApplicationFilters({ search, sort, onSearchChange, onSortChange }: ApplicationFiltersProps) {
  return (
    <div className="application-controls">
      <label className="search-field">
        <Search size={17} />
        <input maxLength={200} value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search company or role" aria-label="Search applications" />
        {search && <button className="input-clear" type="button" onClick={() => onSearchChange('')} aria-label="Clear search"><X size={14} /></button>}
      </label>
      <label className="filter-select">
        <ArrowUpDown size={14} />
        <select value={sort} onChange={(event) => onSortChange(event.target.value as ApplicationFiltersProps['sort'])} aria-label="Sort applications">
          <option value="recent">Recently updated</option>
          <option value="oldest">Oldest update</option>
          <option value="company">Company A–Z</option>
        </select>
      </label>
    </div>
  );
}
