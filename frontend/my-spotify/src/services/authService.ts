import api from "@/services/api"
import { handleApiError } from "@/services/api";
import { UserProfile, ArtistApplicationTicket, OtpEntry } from "@/types";
import { AuthResponse} from "@/types/authTypes"
import { getUsers, saveUsers, User } from "@/store/mockDb";
import { getApplicaitonTickets, saveApplicationTickets } from "@/store/mockDb";
import { getNotifications, saveNotifications } from "@/store/mockDb";
import { getOtps, saveOtps } from "@/store/mockDb";
import { mapAuthUser } from "@/utils/authUtils";
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
): Promise<AuthResponse> {

    try {
        const response = await api.post("/accounts/login/", {
            email,
            password,
        })

        return {
            user: mapAuthUser(response.data.user),
            access: response.data.access,
            refresh: response.data.refresh,
        };
    } catch (error) {
        handleApiError(error)
    }
}

export async function register(
    username: string,
    email: string,
    password: string,
    birthDate: string,
    gender: string
): Promise<AuthResponse> {
    
    try {
        const response = await api.post("/accounts/register/", {
            username,
            email,
            password,
            birth_date: birthDate,
            gender: gender.toUpperCase(),
        })

        return {
            user: mapAuthUser(response.data.user),
            access: response.data.access,
            refresh: response.data.refresh,
        };
    } catch (error) {
        handleApiError(error);
    }
}

export async function applyArtist(
    artisticName: string,
    samples: File[]
): Promise<UserProfile> {
    
    try {
        const formData = new FormData()
        formData.append("artistic_name", artisticName)
        samples.forEach(sample => {
            formData.append("samples", sample)
        })

        const response = await api.post("/accounts/apply-as-artist/", formData)
        return mapAuthUser(response.data)
    } catch (error) {
        handleApiError(error)
    }
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