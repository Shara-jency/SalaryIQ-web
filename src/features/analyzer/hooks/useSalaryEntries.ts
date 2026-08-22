import { useQuery } from "@tanstack/react-query";
import { useRepositories } from "@app/RepositoryProvider";
import type { Id } from "@domain/models";

export function salaryEntriesQueryKey(profileId: Id | undefined) {
  return ["salaryEntries", profileId] as const;
}

export function useSalaryEntries(profileId: Id | undefined) {
  const { salaryEntryRepo } = useRepositories();

  return useQuery({
    queryKey: salaryEntriesQueryKey(profileId),
    queryFn: () => salaryEntryRepo.list(profileId!),
    enabled: Boolean(profileId),
  });
}

export function useLatestSalaryEntry(profileId: Id | undefined) {
  const { salaryEntryRepo } = useRepositories();

  return useQuery({
    queryKey: [...salaryEntriesQueryKey(profileId), "latest"],
    queryFn: () => salaryEntryRepo.getLatest(profileId!),
    enabled: Boolean(profileId),
  });
}
