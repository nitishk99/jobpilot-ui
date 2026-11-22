import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FileSearch } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { getOriginalEmail, getReviewEmails } from '../emails/emails.api';
import { queryKeys } from '../../api/query-keys';
import { getAllApplications } from '../applications/applications.api';
import { useReviewActions } from './use-review-actions';
import { APPLICATION_PAGE_SIZE } from '../applications/application.constants';
import { ReviewEmailList } from './ReviewEmailList';
import { ReviewEmailDetail } from './ReviewEmailDetail';
import { routes } from '../../config/routes';
import { getGmailUrl } from '../../utils/gmail';

export function ReviewPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedEmailId, setSelectedEmailId] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [notice, setNotice] = useState('');
  const reviewQuery = useQuery({
    queryKey: queryKeys.emails.reviewList(page, APPLICATION_PAGE_SIZE),
    queryFn: () => getReviewEmails(page, APPLICATION_PAGE_SIZE),
  });
  const applicationsQuery = useQuery({
    queryKey: queryKeys.applications.all,
    queryFn: () => getAllApplications(),
  });
  const items = reviewQuery.data?.items ?? [];
  const returnedTotalPages = Math.max(1, reviewQuery.data?.totalPages ?? 1);
  const selected = items.find((item) => item.id === selectedEmailId) ?? items[0];
  const hasGmailLink = Boolean(getGmailUrl(selected?.gmailUrl));
  const emailId = hasGmailLink ? undefined : selected?.id;
  const emailQuery = useQuery({
    queryKey: queryKeys.emails.original(emailId ?? ''),
    queryFn: () => getOriginalEmail(emailId ?? ''),
    enabled: Boolean(emailId),
  });

  useEffect(() => {
    if (reviewQuery.data && !reviewQuery.error && page > returnedTotalPages) {
      setPage(returnedTotalPages);
    }
  }, [page, returnedTotalPages, reviewQuery.data, reviewQuery.error]);

  const actions = useReviewActions();

  function selectEmail(id: string) {
    actions.reset();
    setSelectedEmailId(id);
    setApplicationId('');
    setNotice('');
  }

  function changePage(nextPage: number) {
    actions.reset();
    setPage(nextPage);
    setSelectedEmailId('');
    setApplicationId('');
  }

  function handleAssociationSuccess() {
    setNotice('Email associated successfully. It will now appear in the application timeline.');
    setSelectedEmailId('');
    setApplicationId('');
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="INBOX TRIAGE" title="Review unmatched emails" description="Match each message to the right opportunity, or create a new one." actions={<span className="review-count"><FileSearch size={15} /> {reviewQuery.data?.total ?? items.length} waiting</span>} />
      {notice && <div className="success-banner"><CheckCircle2 size={16} /> {notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
      {reviewQuery.isPending && <LoadingState label="Loading emails for review…" />}
      {!reviewQuery.isPending && reviewQuery.error && (
        <ErrorState error={reviewQuery.error} onRetry={() => void reviewQuery.refetch()} />
      )}
      {!reviewQuery.isPending && !reviewQuery.error && items.length === 0 && (
        <section className="panel review-empty">
          <EmptyState title="You’re all caught up" description="There are no processed, job-related emails waiting for review. New uncertain matches will appear here." />
        </section>
      )}
      {!reviewQuery.isPending && !reviewQuery.error && items.length > 0 && (
        <div className="review-workspace">
          <ReviewEmailList
            items={items}
            selectedId={selected?.id}
            page={reviewQuery.data?.page ?? page}
            totalPages={reviewQuery.data?.totalPages ?? 1}
            total={reviewQuery.data?.total ?? items.length}
            disabled={actions.isPending}
            onSelect={selectEmail}
            onPageChange={changePage}
          />
          {selected ? (
            <ReviewEmailDetail
              key={selected.id}
              email={selected}
              originalEmail={hasGmailLink ? selected : emailQuery.data}
              originalEmailLoading={!hasGmailLink && emailQuery.isPending}
              originalEmailError={hasGmailLink ? null : emailQuery.error}
              onRetryOriginalEmail={() => void emailQuery.refetch()}
              applications={applicationsQuery.data ?? []}
              applicationsLoading={applicationsQuery.isPending}
              applicationsError={applicationsQuery.error}
              onRetryApplications={() => void applicationsQuery.refetch()}
              applicationId={applicationId}
              associationPending={actions.associate.isPending}
              associationError={actions.associate.error}
              onApplicationChange={setApplicationId}
              onAssociate={() => { if (selected.id) actions.associate.mutate({ emailId: selected.id, applicationId }, { onSuccess: handleAssociationSuccess }); }}
              createApplicationPending={actions.create.isPending}
              createApplicationError={actions.create.error}
              onCreateApplication={(corrections) => actions.create.mutate(
                { emailId: selected.id, corrections },
                { onSuccess: (created) => navigate(routes.application(created.application.id)) },
              )}
              dismissPending={actions.dismiss.isPending}
              dismissError={actions.dismiss.error}
              onDismiss={() => {
                if (selected.id) {
                  actions.dismiss.mutate(selected.id, {
                    onSuccess: () => {
                      setNotice('Email dismissed from the review queue.');
                      setSelectedEmailId('');
                      setApplicationId('');
                    },
                  });
                }
              }}
            />
          ) : (
            <section className="panel review-detail-empty">
              <EmptyState title="Select an email" description="Choose an item from the review list to see its extracted details and original message." />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
