import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@app/RepositoryProvider";
import type { CreateSalaryHistoryInput, Id, UpdateSalaryHistoryInput } from "@domain/models";

function queryKey(profileId: Id | undefined) {
  return ["salaryHistory", profileId] as const;
}

export function useSalaryHistoryList(profileId: Id | undefined) {
  const { salaryHistoryRepo } = useRepositories();

  return useQuery({
    queryKey: queryKey(profileId),
    queryFn: () => salaryHistoryRepo.list(profileId!),
    enabled: Boolean(profileId),
  });
}

export function useSalaryHistoryMutations(profileId: Id | undefined) {
  const { salaryHistoryRepo } = useRepositories();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKey(profileId) });

  const create = useMutation({
    mutationFn: (input: CreateSalaryHistoryInput) => salaryHistoryRepo.create(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: Id; patch: UpdateSalaryHistoryInput }) =>
      salaryHistoryRepo.update(id, patch),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: Id) => salaryHistoryRepo.delete(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
