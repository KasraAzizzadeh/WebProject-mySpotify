import { UserProfile } from "@/types";

export type RegisterRequest = {
    username: string;
    email: string;
    password: string;
    birth_date: string;
    gender: string;
};

export type AuthResponse = {
    user: UserProfile;
    access: string;
    refresh: string;
};