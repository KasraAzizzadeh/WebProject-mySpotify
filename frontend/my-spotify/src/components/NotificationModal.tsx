'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellOff, Loader2, Circle, Check, X, ArrowLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useUserNotifications,
} from '@/hooks/queries/user/useUserNotifications';
import { Notifications, UserProfile } from '@/types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export default function NotificationModal({ isOpen, onClose, user }: NotificationModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const { data: notifications = [], isLoading, isError } = useUserNotifications(user.id, user.role);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.status === b.status) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.status === 'unread' ? -1 : 1;
    });
  }, [notifications]);

  const handleRead = (notificationId: string) => {
    setBusyId(notificationId);
    markNotificationAsRead(notificationId);
    queryClient.invalidateQueries({ queryKey: ['userNotifications', user.id, user.role] });
    setBusyId(null);
  };

  const handleDelete = (notificationId: string) => {
    setBusyId(notificationId);
    deleteNotification(notificationId);
    queryClient.invalidateQueries({ queryKey: ['userNotifications', user.id, user.role] });
    setBusyId(null);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(user.id);
    queryClient.invalidateQueries({ queryKey: ['userNotifications', user.id, user.role] });
  };

  const selectedNotification = sortedNotifications.find((notification) => notification.id === selectedNotificationId) ?? null;

  const renderNotificationText = (notification: Notifications) => {
    if (notification.type === 'NA' && notification.redirectId) {
      const match = notification.content.match(/^(.*)"([^"]+)"(.*)$/);

      if (match) {
        const [, prefix, releaseName, suffix] = match;

        return (
          <span className="whitespace-pre-line">
            {prefix}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // Prevents opening the notification when navigating
                router.push(`/album/${notification.redirectId}`);
                onClose();
              }}
              className="font-semibold text-green-400 underline decoration-green-500/40 underline-offset-2 transition hover:text-green-300"
            >
              {releaseName}
            </button>
            {suffix}
          </span>
        );
      }
    }

    return <span className="whitespace-pre-line">{notification.content}</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-end bg-black/40 p-4 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-[#111111] shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <p className="text-xs text-neutral-500">Your recent updates</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedNotification ? (
              <button
                type="button"
                onClick={() => setSelectedNotificationId(null)}
                className="flex items-center gap-1 text-xs font-medium text-neutral-300 transition hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
            ) : sortedNotifications.some((notification) => notification.status === 'unread') ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-green-400 transition hover:text-green-300"
              >
                Mark All as Read
              </button>
            ) : null}
            <button
              onClick={onClose}
              className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              aria-label="Close notifications"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-2">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-sm text-neutral-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          )}

          {isError && (
            <div className="py-10 text-center text-sm text-red-400">
              Could not load notifications.
            </div>
          )}

          {!isLoading && !isError && sortedNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-500">
              <BellOff className="mb-3 h-8 w-8" />
              <p className="text-sm">No notifications yet.</p>
            </div>
          )}

          {!isLoading && !isError && selectedNotification && (
            <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/70 p-3">
              <div className="space-y-2">
                <p className="text-sm leading-6 text-white">{renderNotificationText(selectedNotification)}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                {selectedNotification.status === 'unread' && (
                  <button
                    type="button"
                    onClick={() => handleRead(selectedNotification.id)}
                    disabled={busyId === selectedNotification.id}
                    className="flex items-center gap-1 rounded-lg border border-neutral-700 px-2.5 py-1.5 text-[11px] font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {busyId === selectedNotification.id ? 'Working...' : 'Mark as Read'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(selectedNotification.id)}
                  disabled={busyId === selectedNotification.id}
                  className="flex items-center gap-1 rounded-lg border border-red-700/40 px-2.5 py-1.5 text-[11px] font-medium text-red-300 transition hover:border-red-500 hover:bg-red-500/10"
                >
                  <X className="h-3.5 w-3.5" />
                  {busyId === selectedNotification.id ? 'Working...' : 'Delete Notification'}
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && !selectedNotification && sortedNotifications.length > 0 && (
            <ul className="space-y-2">
              {sortedNotifications.map((notification) => {
                return (
                  <li
                    key={notification.id}
                    onClick={() => setSelectedNotificationId(notification.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedNotificationId(notification.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className={`cursor-pointer rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-400/40 hover:bg-neutral-800/80 focus-within:border-green-400/40 focus-within:bg-neutral-800/80 ${notification.status === 'unread' ? 'border-green-500/30 bg-green-500/10' : 'border-neutral-800 bg-neutral-950/70'}`}
                  >
                    <div className="flex items-start gap-2">
                      {notification.status === 'unread' && <Circle className="mt-0.5 h-2.5 w-2.5 fill-green-400 text-green-400" />}
                      <div className="flex-1">
                        <p className="text-sm text-white">{renderNotificationText(notification)}</p>
                        <p className="mt-2 text-xs text-neutral-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      {notification.status === 'unread' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Stops event from bubbling to parent <li>
                            handleRead(notification.id);
                          }}
                          disabled={busyId === notification.id}
                          className="rounded-lg border border-neutral-700 p-1.5 text-neutral-300 transition hover:border-neutral-500 hover:text-white"
                          aria-label="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Stops event from bubbling to parent <li>
                          handleDelete(notification.id);
                        }}
                        disabled={busyId === notification.id}
                        className="rounded-lg border border-red-700/40 p-1.5 text-red-300 transition hover:border-red-500 hover:bg-red-500/10"
                        aria-label="Delete notification"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}