import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../api/query-keys';
import {
  associateEmail,
  createApplicationFromReviewEmail,
  dismissReviewEmail,
} from '../emails/emails.api';
import type { ApplicationCorrections } from '../emails/email.types';

export function useReviewActions() {
  const queryClient = useQueryClient();

  function refreshReviewAndApplications() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.review }),
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all }),
    ]);
  }

  const associate = useMutation({
    mutationFn: ({ emailId, applicationId }: { emailId: string; applicationId: string }) =>
      associateEmail(emailId, applicationId),
    onSuccess: refreshReviewAndApplications,
  });

  const create = useMutation({
    mutationFn: ({ emailId, corrections }: { emailId: string; corrections?: ApplicationCorrections }) =>
      createApplicationFromReviewEmail(emailId, corrections),
    onSuccess: refreshReviewAndApplications,
    onError: async (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.emails.review });
      }
    },
  });

  const dismiss = useMutation({
    mutationFn: dismissReviewEmail,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.emails.review }),
  });

  function reset() {
    associate.reset();
    create.reset();
    dismiss.reset();
  }

  return {
    associate,
    create,
    dismiss,
    reset,
    isPending: associate.isPending || create.isPending || dismiss.isPending,
  };
}
