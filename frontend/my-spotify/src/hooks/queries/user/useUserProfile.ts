import { useQuery } from "@tanstack/react-query";
import { userService } from '@/services/userService';

export function useUserProfile(userId?: string | null) {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => userService.getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
}
