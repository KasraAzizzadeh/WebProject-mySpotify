import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/services/supportService";

export function useSupportTickets(page: number, limit: number) {
  return useQuery({
    queryKey: ["supportTickets", page, limit],
    queryFn: () => getTickets(page, limit),
    staleTime: 1000 * 60,
  });
}