import { useQuery } from "@tanstack/react-query";
import { getTicketById } from "@/services/supportService";

export function useSupportTicket(ticketId: string | null) {
  return useQuery({
    queryKey: ["supportTicket", ticketId],
    queryFn: () => getTicketById(ticketId!),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 60,
  });
}
