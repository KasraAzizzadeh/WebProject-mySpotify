"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";
import api, { handleApiError } from '@/services/api';

type AuthContextType = {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  loginUser: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  updateUser: (user: UserProfile) => void;
  logoutUser: () => void;
  deleteUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedAccessToken = localStorage.getItem("accessToken");
      if (storedAccessToken) {
          setAccessToken(JSON.parse(storedAccessToken));
      }

      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (storedRefreshToken) {
          setRefreshToken(JSON.parse(storedRefreshToken));
      }
    } catch (e) {
      console.error("Auth initialization error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginUser = (user: UserProfile, accessToken: string, refreshToken: string) => {
    setUser(user);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", JSON.stringify(accessToken));
    localStorage.setItem("refreshToken", JSON.stringify(refreshToken));
};

  const updateUser = (user: UserProfile) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logoutUser = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    router.push("/login");
};

  const deleteUser = async () => {
    try {
      // attempt server-side delete if we have an authenticated user id
      if (user?.id) {
        await api.delete(`/accounts/${user.id}/`);
      }
    } catch (error) {
      // surface server errors to caller
      handleApiError(error);
    }

    // Clear local session state
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("setting_notification_limit");
    localStorage.removeItem("setting_system_voice");
    localStorage.removeItem("setting_interface_language");

    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, isLoading, loginUser, updateUser, logoutUser, deleteUser }}>
      {!isLoading ? children : (
        <div className="h-screen bg-black flex items-center justify-center text-neutral-500 text-sm">
          Resuming secure session...
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}