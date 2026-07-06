import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { updateAuditRecord } from "@/services/supportService";

export function useUpdateAuditRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => updateAuditRecord(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["auditRecords"],
      });
    },
  });
}