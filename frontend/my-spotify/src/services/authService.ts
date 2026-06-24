import { UserProfile } from "@/types";
import { getUsers, saveUsers, User } from "@/store/mockDb";

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