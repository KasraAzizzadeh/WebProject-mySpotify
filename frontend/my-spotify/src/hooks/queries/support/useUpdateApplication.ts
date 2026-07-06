import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { updateApplication } from "@/services/supportService";

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id, status, message
    }: {
      id: string; status: "approved" | "rejected"; message: string;
    }) =>
      updateApplication(id, status, message),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["artistApplications"],
      });

      // TODO may need to invalidate user cache later
    },
  });
}