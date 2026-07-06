import { useQuery } from "@tanstack/react-query";
import { getSubscriptionSettings } from "@/services/supportService";

export function useSubscriptionSettings() {
  return useQuery({
    queryKey: ["subscriptionSettings"],
    queryFn: getSubscriptionSettings,
    staleTime: 1000 * 60 & 5,
  });
}