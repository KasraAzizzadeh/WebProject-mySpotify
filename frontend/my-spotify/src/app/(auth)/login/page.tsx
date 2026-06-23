"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/services/authService";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login(email, password);
      loginUser(result.user, result.token);
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-6 tracking-wide">
        Welcome back!
      </h1>

      <form onSubmit={handleLogin} className="w-full space-y-4">
        <h2 className="text-xl font-semibold text-white mb-2">
          Login
        </h2>

        <Input
          label="Email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="text-left -mt-2">
          <Link
            href="/password-reset"
            className="text-xs text-neutral-400 hover:text-green-400"
          >
            Forgot your password?
          </Link>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button type="submit">Login</Button>
      </form>

      <p className="mt-6 text-sm text-neutral-400">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="text-green-400 hover:text-green-300 transition font-medium"
        >
          Register here
        </Link>
      </p>
    </>
  );
}