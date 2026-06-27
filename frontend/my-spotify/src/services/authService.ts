import { UserProfile, ArtistApplicationTicket, OtpEntry } from "@/types";
import { getUsers, saveUsers, User } from "@/store/mockDb";
import { getApplicaitonTickets, saveApplicationTickets } from "@/store/mockDb";
import { getOtps, saveOtps } from "@/store/mockDb";

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
    const user = users.find(u =>
        u.email === email && u.password === password
    )

    if(!user) {
        throw new Error("Invalid credentials");
    }

    return {
        token: `token-${user.username}`,
        user: user
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
        createdAt: new Date()
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
            followersCount: 0,
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
    const remainingOtps = getOtps().filter(o => o.userId !== user.id);
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