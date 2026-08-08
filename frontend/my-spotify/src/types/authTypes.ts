import { UserProfile } from "@/types";

type RegisterRequest = {
    username: string;
    email: string;
    password: string;
    birth_date: string;
    gender: string;
};

type RegisterResponse = {
    user: UserProfile;
    access: string;
    refresh: string;
};