import { useQuery } from "@tanstack/react-query";
import api from '@/services/api';
import { handleApiError } from '@/services/api';
import { mapAuthUser } from '@/utils/authUtils';

export function useUserProfile(userId?: string | null) {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      try {
        const response = await api.get(`/accounts/${userId}/`);
        return mapAuthUser(response.data);
      } catch (error) {
        handleApiError(error);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    retry: false,
  });
}
