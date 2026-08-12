import { useQuery } from "@tanstack/react-query";
import api, { handleApiError } from "@/services/api";
import { mapNotification } from "@/utils/authUtils";
import { Notifications, UserRole } from "@/types";

export function useUserNotifications(userId?: string, role?: UserRole) {
  return useQuery<Notifications[]>({
    queryKey: ["userNotifications", userId, role],
    queryFn: async () => {
      try {
        const response = await api.get("/accounts/notifications/");
        return Array.isArray(response.data)
          ? response.data.map((item) => mapNotification(item as Record<string, unknown>))
          : [];
      } catch (error) {
        handleApiError(error);
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await api.patch(`/accounts/notifications/${notificationId}/`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await api.delete(`/accounts/notifications/${notificationId}/`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function markAllNotificationsAsRead(notificationIds: string[]) {
  try {
    await Promise.all(
      notificationIds.map((notificationId) =>
        api.patch(`/accounts/notifications/${notificationId}/`).catch((error) => {
          handleApiError(error);
        })
      )
    );
  } catch (error) {
    handleApiError(error);
  }
}
