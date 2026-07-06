import { useQuery } from "@tanstack/react-query";
import { getUserDistribution } from "@/services/supportService";

export function useUserDistribution() {
  return useQuery({
    queryKey: ["userDistribution"],
    queryFn: getUserDistribution,
    staleTime: 1000 * 60 * 5,
  });
}