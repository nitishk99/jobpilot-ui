import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from './auth.api';
import { queryKeys } from '../../api/query-keys';

export function useAuth() {
  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
  return {
    user: query.data ?? null,
    isAuthenticated: Boolean(query.data),
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
