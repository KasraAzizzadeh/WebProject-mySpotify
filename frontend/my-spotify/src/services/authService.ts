import { UserProfile } from "@/types";

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

    if (email !== "alex@gmail.com" || password !== "1234") {
        throw new Error("Invalid credentials");
    }

    return {
        token: "mock-access-token-abc123",
        user: {
            id: "user-123",
            username: "jam_session99",
            displayName: "Alex Carter",
            profilePictureUrl: undefined,
            role: "listener",
            subscriptionType: "gold",
        },
    };
}