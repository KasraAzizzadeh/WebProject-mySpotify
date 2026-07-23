import { UserProfile, ArtistApplicationTicket, OtpEntry } from "@/types";
import { getUsers, saveUsers, User } from "@/store/mockDb";
import { getApplicaitonTickets, saveApplicationTickets } from "@/store/mockDb";
import { getNotifications, saveNotifications } from "@/store/mockDb";
import { getOtps, saveOtps } from "@/store/mockDb";
import { isSameDay } from "@/utils/mediaUtils";

type LoginResponse = {
  token: string;
  user: UserProfile;
};

function delay(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  // replace with actual api
  await delay(100);

  const users = getUsers();

  const index = users.findIndex(
    (u) => u.email === email && u.password === password
  );

  if (index === -1) {
    throw new Error("Invalid credentials");
  }

  const today = new Date();
  let user = users[index];
  let userUpdated = false;

  // Reset daily streams if it's a new day
  if (user.listenerProfile) {
    const listenedToday =
      user.listenerProfile.lastStreamDate &&
      isSameDay(new Date(user.listenerProfile.lastStreamDate), today);

    if (!listenedToday) {
      users[index] = {
        ...user,
        listenerProfile: {
          ...user.listenerProfile,
          dailyStreams: 0,
        },
      };

      user = users[index];
      userUpdated = true;
    }
  }

  if (userUpdated) {
    saveUsers(users);
  }

  // Check if subscription is about to expire
  if (user.subValidUntil) {
    const notifications = getNotifications();

    const expiryDate = new Date(user.subValidUntil);
    const msPerDay = 1000 * 60 * 60 * 24;

    const remainingDays = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / msPerDay
    );

    if (remainingDays > 0 && remainingDays <= 2) {
      const alreadyNotified = notifications.some(
        (n) =>
          n.userId === user.id &&
          n.type === "ES" &&
          isSameDay(new Date(n.createdAt), today)
      );

      if (!alreadyNotified) {
        notifications.push({
          id: crypto.randomUUID(),
          userId: user.id,
          content: `Your ${user.subscriptionType} subscription will expire in ${remainingDays} day${remainingDays === 1 ? "" : "s"}. Please renew to continue enjoying premium features.`,
          status: "unread",
          type: "ES",
          createdAt: today,
        });

        saveNotifications(notifications);
      }
    }
  }

  return {
    token: `token-${user.username}`,
    user,
  };
}

export async function register(
    displayName: string,
    email: string,
    password: string,
    birthDate: string,
    gender: string
): Promise<LoginResponse> {
    
    // replace with actual API
    await delay(100);

    const users = getUsers();
    const exists = users.find(u =>
        u.email === email
    )
    if (exists) {
        throw new Error("A user with this email already exists");
    }

    const newUserProfile : UserProfile = {
        id: crypto.randomUUID(),
        username: displayName.replace(/\s+/g, "") + crypto.randomUUID(),
        displayName: displayName,
        email: email,
        role: "listener",
        subscriptionType: "basic",
        gender: gender,
        birthDate: new Date(birthDate),
        followers: [],
        following: [],
        createdAt: new Date(),
        listenerProfile: {
            playlists: [],
            recentlyPlayed: [],
            likedTracks: [],
            dailyStreams: 0,
            lastStreamDate: new Date()
        }
    }

    const newUser = {...newUserProfile, password};
    const newUsers = [...users, newUser];
    saveUsers(newUsers);

    return {
        token: `token-${newUserProfile.username}`,
        user: newUserProfile
    }
}

export async function applyArtist(
    user: UserProfile,
    artisticName: string,
    samples: File[]
): Promise<UserProfile> {
    
    // replace with actual API
    await delay(100);

    const allUsers = getUsers();
    const index = allUsers.findIndex((u) => u.id === user.id);

    const updatedUser: User = {
        ...allUsers[index],
        artistProfile: {
            verificationStatus: "pending",
            bio: "",
            singles: [],
            albums: [],
            totalStreams: 0,
        }
    };

    allUsers[index] = updatedUser;
    saveUsers(allUsers);

    const tickets = getApplicaitonTickets();
    const samplePaths : string[] = samples.map(
        (file) => `/mockUploads/${user.id}/${file.name}`
    );
    const newApplication : ArtistApplicationTicket = {
        id: crypto.randomUUID(),
        userId: user.id,
        email: user.email,
        artisticName,
        samples: samplePaths,
        verificationStatus: "pending",
        submittedAt: new Date(),
    }
    saveApplicationTickets([...tickets, newApplication]);

    const notifications = getNotifications();

    const supportNotifications = allUsers
    .filter(
        u => u.role === "admin" || u.role === "supporter"
    )
    .map(user => ({
        id: crypto.randomUUID(),
        userId: user.id,
        content: `New artist verification request from ${updatedUser.displayName}.`,
        status: "unread" as const,
        type: "SA" as const,
        createdAt: new Date()
    }));

    saveNotifications([
    ...notifications,
    ...supportNotifications,
    ]);

    const { password, ...updatedProfile } = updatedUser;
    return updatedProfile;
};

function genOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function generateOtp (email : string) : Promise<string> {
    await delay(100);

    const allUsers = getUsers();
    const user = allUsers.find(u => u.email === email);
    if (!user)
        throw new Error("No user with this email exists");

    const allOtps = getOtps();
    const generatedOtp = genOtp();
    console.log(generatedOtp);
    const newOtpEntry : OtpEntry = {
        id: crypto.randomUUID(),
        userId: user.id,
        userEmail: email,
        otpCode: generatedOtp,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    }
    const remainingOtps = allOtps.filter(o => o.userId !== user.id);
    saveOtps([...remainingOtps, newOtpEntry]);
    return newOtpEntry.id;
}

export async function verifyOtp(otpId: string, otp: string) : Promise<void> {
    await delay(100);

    const allOtps = getOtps();
    const otpEntry = allOtps.find(o => o.id === otpId);
    if (!otpEntry)
        throw new Error("No otp with this email exists");
    if (otpEntry.expiresAt < new Date())
        throw new Error("This otp is invaalid, please generate a new onw");
    if (otpEntry.otpCode !== otp)
        throw new Error("Please enter the correct code");

    const remainingOtps = allOtps.filter(o => o.id !== otpId);
    saveOtps(remainingOtps);

}

export async function changePassword(
    email: string, password: string
): Promise<void> {

    await delay(100);

    const users = getUsers();
    const index = users.findIndex(u => u.email === email);

    if (index === -1) {
        throw new Error("No user with this email exists");
    }

    users[index] = {
        ...users[index],
        password,
    };

    saveUsers(users);

    const remainingOtps = getOtps().filter(
        o => o.userId !== users[index].id
    );
    saveOtps(remainingOtps);
}