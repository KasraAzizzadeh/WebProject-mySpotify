import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";

export function useSubmitTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, message }: { uid: string, message: string }) =>
      userService.submitTicket(uid, message),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['supportTickets'],
      });
    },
  });
}