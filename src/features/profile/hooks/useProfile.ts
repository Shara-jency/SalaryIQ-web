import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@app/RepositoryProvider";
import type { UpdateProfileInput } from "@domain/models";

const PROFILE_QUERY_KEY = ["profile"] as const;

export function useCurrentProfile() {
  const { profileRepo } = useRepositories();

  const query = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => profileRepo.getCurrentProfile(),
  });

  return { profile: query.data ?? null, isLoading: query.isLoading };
}

export function useUpdateProfile() {
  const { profileRepo } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateProfileInput }) =>
      profileRepo.updateProfile(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
  });
}

export function useClearProfile() {
  const { profileRepo } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => profileRepo.clearProfile(id),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
