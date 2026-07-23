import { useQuery } from "@tanstack/react-query";
import { getArtistDashboard } from "@/services/manageService";

export function useArtistDashboard(userId?: string) {
  return useQuery({
    enabled: !!userId,

    queryKey: ["artistDashboard", userId],

    queryFn: () => getArtistDashboard(userId!),
  });
}