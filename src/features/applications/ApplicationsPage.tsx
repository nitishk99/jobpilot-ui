import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { getApplications } from './applications.api';
import { queryKeys } from '../../api/query-keys';
import { ApplicationResults } from './ApplicationResults';
import { ApplicationStats } from './ApplicationStats';
import { ApplicationFilters } from './ApplicationFilters';
import { Pagination } from '../../components/common/Pagination';
import { APPLICATION_PAGE_SIZE } from './application.constants';
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import type { ApplicationListOptions } from './application.types';

export function ApplicationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'recent' | 'oldest' | 'company'>('recent');
  const debouncedSearch = useDebouncedValue(search.trim());
  const options = {
    search: debouncedSearch,
    sortBy: sort === 'company' ? 'companyName' : 'lastActivityAt',
    order: sort === 'recent' ? 'desc' : 'asc',
  } satisfies ApplicationListOptions;
  const applicationsQuery = useQuery({
    queryKey: queryKeys.applications.list(page, APPLICATION_PAGE_SIZE, options),
    queryFn: () => getApplications(page, APPLICATION_PAGE_SIZE, options),
  });
  const result = applicationsQuery.data;

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeSort(value: 'recent' | 'oldest' | 'company') {
    setSort(value);
    setPage(1);
  }

  return (
    <div className="page-stack">
      <header className="workspace-header">
        <div>
          <span className="eyebrow">JOB SEARCH WORKSPACE</span>
          <h1>Stay ahead of every opportunity.</h1>
          <p>One clear view of your active roles, interviews, and decisions.</p>
        </div>
        <div className="workspace-header-mark" aria-hidden="true">JP<span>01</span></div>
      </header>
      {applicationsQuery.isPending && <LoadingState label="Loading your applications…" />}
      {!applicationsQuery.isPending && applicationsQuery.error && (
        <ErrorState error={applicationsQuery.error} onRetry={() => void applicationsQuery.refetch()} />
      )}
      {!applicationsQuery.isPending && !applicationsQuery.error && result && (
        <>
          <ApplicationStats stats={result.stats} />
          <section className="opportunities-section">
            <div className="section-title-row">
              <div><span className="section-index">01</span><h2>Opportunities</h2></div>
              <p>{result.total} results</p>
            </div>
            <ApplicationFilters search={search} sort={sort} onSearchChange={changeSearch} onSortChange={changeSort} />
            <ApplicationResults applications={result.items} />
            <Pagination page={result.page} totalPages={result.totalPages} total={result.total} onChange={setPage} />
          </section>
        </>
      )}
    </div>
  );
}
