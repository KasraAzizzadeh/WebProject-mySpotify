import { Notifications, UserProfile } from "@/types";
import { getMediaUrl } from "@/services/api";

export const validateEmail = (email: string) => {
    let message : string = "";
    if (!email) {
        message = "Email is required!";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        message = "Please enter a valid email";
    }
    return message;
}

export const validatePassword = (password: string) => {
    let message : string = "";
    if (!password) {
        message = "Password is required!";
    } else if (password.length < 8) {
        message = "Password should be at least 8 characters";
    } else if (password.length > 32) {
        message = "Password should be at most 32 characters";
    } else if (!/[a-z]/.test(password)) {
        message = "Password must contain a lowercase letter";
    } else if (!/[A-Z]/.test(password)) {
        message = "Password must contain an uppercase letter";
    } else if (!/\d/.test(password)) {
        message = "Password must contain a number";
    } else if (!/[^A-Za-z\d]/.test(password)) {
        message = "Password must contain a special character";
    }
    return message;
}

export const validateOtp = (otp: string) => {
    let message = "";

    if (!otp.trim()) {
        message = "OTP is required!";
    } else if (!/^\d{6}$/.test(otp)) {
        message = "OTP must be a 6-digit number";
    }

    return message;
};



// service mappers //
export function mapAuthUser(data: Record<string, unknown> | null | undefined): UserProfile {
    const source = data ?? {};
    const settings = (source.settings ?? {}) as Record<string, unknown>;
    const listenerProfile = (source.listener_profile ?? {}) as Record<string, unknown>;
    const artistProfile = (source.artist_profile ?? {}) as Record<string, unknown>;

    return {
        id: String(source.id ?? ''),
        username: String(source.username ?? ''),
        displayName: String(source.display_name ?? ''),
        email: String(source.email ?? ''),

        profilePictureUrl:
            getMediaUrl(
                (source.profile_picture_url as string | null | undefined) ??
                (source.profile_picture as string | null | undefined)
            ) ?? undefined,

        role: String(source.role ?? 'listener') as UserProfile['role'],
        subscriptionType: String(source.subscription_type ?? 'basic') as UserProfile['subscriptionType'],

        subValidUntil: source.subscription_valid_until
            ? new Date(String(source.subscription_valid_until))
            : undefined,

        gender: typeof source.gender === 'string' ? source.gender : undefined,
        birthDate: source.birth_date
            ? new Date(String(source.birth_date))
            : undefined,

        createdAt: source.created_at
            ? new Date(String(source.created_at))
            : undefined,

        followers: Array.isArray(source.followers) ? source.followers.map(String) : [],
        following: Array.isArray(source.following) ? source.following.map(String) : [],

        settings: Object.keys(settings).length > 0
            ? {
                  notificationLimit: Number(settings.notification_limit ?? 10),
                  systemVoice: String(settings.system_voice ?? 'en-is'),
                  language: String(settings.language ?? 'en'),
              }
            : undefined,

        listenerProfile: Object.keys(listenerProfile).length > 0
            ? {
                  playlists: Array.isArray(listenerProfile.playlists) ? listenerProfile.playlists.map(String) : [],
                  likedTracks: Array.isArray(listenerProfile.liked_tracks) ? listenerProfile.liked_tracks.map(String) : [],
                  recentlyPlayed: Array.isArray(listenerProfile.recently_played) ? listenerProfile.recently_played.map(String) : [],
                  dailyStreams: Number(listenerProfile.daily_streams ?? 0),
                  lastStreamDate: listenerProfile.last_stream_date
                      ? new Date(String(listenerProfile.last_stream_date))
                      : null,
              }
            : undefined,

        artistProfile:
            artistProfile && Object.keys(artistProfile).length > 0
                ? {
                      bio: typeof artistProfile.bio === 'string' ? artistProfile.bio : undefined,
                      verificationStatus: String(artistProfile.verification_status ?? 'pending') as UserProfile['artistProfile'] extends undefined ? never : NonNullable<UserProfile['artistProfile']>['verificationStatus'],
                      singles: Array.isArray(artistProfile.singles)
                          ? artistProfile.singles.map(String)
                          : Array.isArray(artistProfile.songs)
                              ? artistProfile.songs.map(String)
                              : [],
                      albums: Array.isArray(artistProfile.albums) ? artistProfile.albums.map(String) : [],
                      totalStreams: Number(artistProfile.total_streams ?? 0),
                      uniqueListener: artistProfile.unique_listener !== undefined
                          ? Number(artistProfile.unique_listener)
                          : artistProfile.unique_listeners !== undefined
                              ? Number(artistProfile.unique_listeners)
                              : undefined,
                      estRevenue: artistProfile.est_revenue !== undefined
                          ? Number(artistProfile.est_revenue)
                          : artistProfile.estRevenue !== undefined
                              ? Number(artistProfile.estRevenue)
                              : undefined,
                  }
                : undefined,
    };
}
export function mapNotification(data: Record<string, unknown>): Notifications {
    const source = data ?? {};

    return {
        id: String(source.id ?? ''),
        userId: String(source.user_id ?? source.userId ?? ''),
        content: String(source.content ?? ''),
        status: source.is_read ? 'read' : 'unread',
        type: String(source.type ?? 'NA') as Notifications['type'],
        redirectId:
            source.redirect_id !== undefined
                ? String(source.redirect_id)
                : source.redirectId !== undefined
                    ? String(source.redirectId)
                    : undefined,
        createdAt: source.created_at ? new Date(String(source.created_at)) : new Date(),
    };
}
