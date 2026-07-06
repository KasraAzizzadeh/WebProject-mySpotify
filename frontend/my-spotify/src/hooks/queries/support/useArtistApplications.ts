import { useQuery } from "@tanstack/react-query";
import { getApplications } from "@/services/supportService";

export function useArtistApplications(page: number, limit: number) {
  return useQuery({
    queryKey: ["artistApplications", page, limit],
    queryFn: () => getApplications(page, limit),
    staleTime: 1000 * 60,
  });
}