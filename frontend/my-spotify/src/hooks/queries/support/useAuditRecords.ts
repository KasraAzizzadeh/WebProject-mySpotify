import { useQuery } from "@tanstack/react-query";
import { getAudits } from "@/services/supportService";

export function useAuditRecords(page: number, limit: number) {
  return useQuery({
    queryKey: ["auditRecords", page, limit],
    queryFn: () => getAudits(page, limit),
    staleTime: 1000 * 60 * 5,
  });
}