"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/services/authService";

export default function LoginPage() {
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault(); // IMPORTANT

      try {
          const result = await login(email, password);
          loginUser(result.user, result.token);
      } catch (err) {
          setError("Invalid email or password");
          console.error(err);
      }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="w-80 p-6 border rounded">
        <h1 className="text-xl mb-4">Login</h1>

        <input
          className="w-full p-2 mb-3 border"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 border"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button className="w-full bg-blue-500 p-2 text-white">
          Login
        </button>
      </form>
    </div>
  );
}