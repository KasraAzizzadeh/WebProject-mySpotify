import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/services/homeService";
import { SubscriptionType } from "@/types";

export function useHomeDashboard(subscriptionType?: SubscriptionType, userId?: string) {
  return useQuery({
    queryKey: ["homeDashboard", subscriptionType, userId],
    queryFn: () => getDashboardData(subscriptionType, userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
