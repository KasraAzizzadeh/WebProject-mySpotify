import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { updateTicket } from "@/services/supportService";

interface UpdateTicketMutation {
  ticketId: string;
  reply: {
    senderId: string;
    senderName: string;
    content: string;
  };
}

export function useUpdateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      reply,
    }: UpdateTicketMutation) => updateTicket(ticketId, reply),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["supportTickets"],
      });
    },
  });
}