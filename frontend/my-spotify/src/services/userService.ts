import api, { handleApiError } from '@/services/api';
import { UserProfile } from '@/types';
import { mapAuthUser } from '@/utils/authUtils';

function buildProfilePatchPayload(updates: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};

  if ('displayName' in updates && updates.displayName !== undefined) {
    payload.display_name = updates.displayName;
  }

  if ('email' in updates && updates.email !== undefined) {
    payload.email = updates.email;
  }

  if ('password' in updates && updates.password !== undefined) {
    payload.password = updates.password;
  }

  if ('artistProfile' in updates && updates.artistProfile && typeof updates.artistProfile === 'object') {
    const artistProfile = updates.artistProfile as { bio?: string };
    if (artistProfile.bio !== undefined) {
      payload.artist_bio = artistProfile.bio;
    }
  }

  if ('settings' in updates && updates.settings && typeof updates.settings === 'object') {
    payload.settings = updates.settings;
  }

  return payload;
}

export const userService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await api.get(`/accounts/${userId}/`);
      return mapAuthUser(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateUserProfile(userId: string, updates: Record<string, unknown>): Promise<UserProfile> {
    const payload = buildProfilePatchPayload(updates);
    const hasFile = updates.profilePicture instanceof File || updates.profilePicture === null;

    try {
      if (hasFile) {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
            return;
          }
          formData.append(key, String(value));
        });

        if (updates.profilePicture instanceof File) {
          formData.append('profile_picture', updates.profilePicture);
        } else if (updates.profilePicture === null) {
          formData.append('profile_picture', '');
        }

        const response = await api.patch(`/accounts/${userId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return mapAuthUser(response.data);
      }

      const response = await api.patch(`/accounts/${userId}/`, payload);
      return mapAuthUser(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateUserSettings(userId: string, settings: { language?: string; systemVoice?: string; notificationLimit?: number }): Promise<UserProfile> {
    try {
      const response = await api.patch(`/accounts/${userId}/`, {
        settings: {
          language: settings.language,
          system_voice: settings.systemVoice,
          notification_limit: settings.notificationLimit,
        },
      });
      return mapAuthUser(response.data);
    } catch (error) {
      handleApiError(error);
    }
  },

  async submitTicket(userId: string, question: string): Promise<void> {
    const response = await api.post('/support/tickets/', {
      userId,
      question,
    });
    return response.data;
  },
};