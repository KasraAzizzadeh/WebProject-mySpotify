import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSubscriptionSettings } from "@/services/supportService";
import { SubscriptionType } from "@/types";

export function useUpdateSubscriptions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
        updates: { id: SubscriptionType; price: string }[]
    ) => updateSubscriptionSettings(updates),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscriptionSettings"],
      });
    },
  });
}