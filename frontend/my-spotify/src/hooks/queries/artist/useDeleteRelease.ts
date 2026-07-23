import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRelease } from "@/services/manageService";

export function useDeleteRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      releaseId,
    }: {
      userId: string;
      releaseId: string;
    }) => deleteRelease(userId, releaseId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["artistDashboard", variables.userId],
      });
    },
  });
}