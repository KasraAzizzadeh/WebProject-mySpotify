import { UserProfile } from "@/types";
import { getUsers, saveUsers, User } from "@/store/mockDb";
import { use } from "react";

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