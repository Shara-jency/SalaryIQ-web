import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "@app/RepositoryProvider";
import type { CreateGrowthProjectionInput, Id } from "@domain/models";

function queryKey(profileId: Id | undefined) {
  return ["growthProjections", profileId] as const;
}

export function useLatestGrowthProjection(profileId: Id | undefined) {
  const { growthProjectionRepo } = useRepositories();

  return useQuery({
    queryKey: [...queryKey(profileId), "latest"],
    queryFn: () => growthProjectionRepo.getLatest(profileId!),
    enabled: Boolean(profileId),
  });
}

export function useSaveGrowthProjection(profileId: Id | undefined) {
  const { growthProjectionRepo } = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      existingId?: Id;
      yearsToStay: number;
      hikePercentages: number[];
      salaryEntryId?: Id;
    }) => {
      if (input.existingId) {
        return growthProjectionRepo.update(input.existingId, {
          yearsToStay: input.yearsToStay,
          hikePercentages: input.hikePercentages,
        });
      }
      const payload: CreateGrowthProjectionInput = {
        profileId: profileId!,
        salaryEntryId: input.salaryEntryId,
        yearsToStay: input.yearsToStay,
        hikePercentages: input.hikePercentages,
      };
      return growthProjectionRepo.create(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKey(profileId) }),
  });
}
