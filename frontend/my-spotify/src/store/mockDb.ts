import { UserProfile } from "@/types";

// USERS
const USERS_KEY = "app_users";

export type User = UserProfile & {
  password: string;
};

// SEED DATA

const SEED_USERS: User[] = [
  {
    id: "user-1",
    email: "alex@gmail.com",
    username: "alex99",
    displayName: "Alex Carter",
    profilePictureUrl: undefined,
    role: "artist",
    subscriptionType: "gold",
    createdAt: new Date().toISOString(),

    password: "Alex_1234",

    artistProfile: {
       bio: "Electronic music producer",
       isVerified: true,
       totalStreams: 120000,
       followersCount: 5400,
     },
  },
  {
    id: "user-2",
    email: "jane@gmail.com",
    username: "jane_doe",
    displayName: "Jane Doe",
    profilePictureUrl: undefined,
    role: "listener",
    subscriptionType: "basic",
    createdAt: new Date().toISOString(),

    password: "J123_abcd",
  },
];


export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);

  if (!data) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }

  return JSON.parse(data);
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}