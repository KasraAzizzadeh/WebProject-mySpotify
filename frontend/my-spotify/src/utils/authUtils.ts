import { UserProfile } from "@/types";

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
export function mapAuthUser(data: any): UserProfile {
    return {
        id: String(data.id),
        username: data.username,
        displayName: data.display_name,
        email: data.email,

        profilePictureUrl: data.profile_picture ?? undefined,

        role: data.role,
        subscriptionType: data.subscription_type,

        subValidUntil: data.subscription_valid_until
            ? new Date(data.subscription_valid_until)
            : undefined,

        gender: data.gender,
        birthDate: data.birth_date
            ? new Date(data.birth_date)
            : undefined,

        createdAt: data.created_at
            ? new Date(data.created_at)
            : undefined,

        followers: data.followers ?? [],
        following: data.following ?? [],

        settings: data.settings
            ? {
                  notificationLimit: data.settings.notification_limit,
                  systemVoice: data.settings.system_voice,
                  language: data.settings.language,
              }
            : undefined,

        listenerProfile: data.listener_profile
            ? {
                  playlists: data.listener_profile.playlists ?? [],
                  likedTracks: data.listener_profile.liked_tracks ?? [],
                  recentlyPlayed:
                      data.listener_profile.recently_played ?? [],
                  dailyStreams:
                      data.listener_profile.daily_streams ?? 0,
                  lastStreamDate: data.listener_profile.last_stream_date
                      ? new Date(
                            data.listener_profile.last_stream_date
                        )
                      : null,
              }
            : undefined,

        artistProfile:
            data.artist_profile &&
            Object.keys(data.artist_profile).length > 0
                ? {
                      bio: data.artist_profile.bio,
                      verificationStatus:
                          data.artist_profile.verification_status,
                      singles: data.artist_profile.singles ?? [],
                      albums: data.artist_profile.albums ?? [],
                      totalStreams:
                          data.artist_profile.total_streams ?? 0,
                      uniqueListener:
                          data.artist_profile.unique_listener,
                  }
                : undefined,
    };
}