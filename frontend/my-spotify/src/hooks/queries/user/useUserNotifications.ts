import { useQuery } from "@tanstack/react-query";
import { getNotifications, saveNotifications } from "@/store/mockDb";
import { Notifications, UserRole } from "@/types";

export function useUserNotifications(userId?: string, role?: UserRole) {
  return useQuery<Notifications[]>({
    queryKey: ["userNotifications", userId, role],
    queryFn: () => {
      const allNotifications = getNotifications();
      const filteredByUser = allNotifications.filter((notification) => notification.userId === userId);

      if (!role) {
        return filteredByUser;
      }

      const allowedTypesByRole: Record<UserRole, Array<Notifications["type"]>> = {
        listener: ["ES", "AA", "AQ", "NA"],
        artist: ["AA", "AT"],
        supporter: ["ST", "SA"],
        admin: ["ST", "SA"],
      };

      const allowedTypes = allowedTypesByRole[role] ?? [];
      return filteredByUser.filter((notification) => allowedTypes.includes(notification.type));
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
}

export function markNotificationAsRead(notificationId: string) {
  const notifications = getNotifications();
  const updated = notifications.map((notification) =>
    notification.id === notificationId ? { ...notification, status: "read" as const } : notification
  );
  saveNotifications(updated);
}

export function deleteNotification(notificationId: string) {
  const notifications = getNotifications();
  const updated = notifications.filter((notification) => notification.id !== notificationId);
  saveNotifications(updated);
}

export function markAllNotificationsAsRead(userId: string) {
  const notifications = getNotifications();
  const updated = notifications.map((notification) =>
    notification.userId === userId ? { ...notification, status: "read" as const } : notification
  );
  saveNotifications(updated);
}
