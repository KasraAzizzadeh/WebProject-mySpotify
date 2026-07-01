// src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types";

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean; //  Track if storage is loading
  loginUser: (user: UserProfile, token: string) => void;
  updateUser: (user: UserProfile) => void;
  logoutUser: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start out as true
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedToken = localStorage.getItem("token");
      if (storedToken) setToken(JSON.parse(storedToken));
    } catch (e) {
      console.error("Auth initialization error:", e);
    } finally {
      setIsLoading(false); // Initialization is complete
    }
  }, []);

  const loginUser = (user: UserProfile, token: string) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", JSON.stringify(token));
  };

  const updateUser = (user: UserProfile) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, loginUser, updateUser, logoutUser }}>
      {/* Block rendering children until user has been verified from localStorage */}
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