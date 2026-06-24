"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/services/authService";
import { validateEmail, validatePassword } from "@/utils/authUtils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type LoginErrors = {
  emailError: string;
  passwordError: string;
}

export default function LoginPage() {
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({
    emailError: "",
    passwordError: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      emailError: validateEmail(email),
      passwordError: validatePassword(password)
    }
    setLoginErrors(errors)

    if (!errors.emailError && !errors.passwordError) {
      try {
        const result = await login(email, password);
        loginUser(result.user, result.token);
      } catch {
        setError("Invalid email or password");
      }
    }
  };

  const clearBackendError = () => {
    if (error) setError(null);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-green-500 text-center mb-6 tracking-wide">
        MySpotify
      </h1>

      <form onSubmit={handleLogin} className="w-full space-y-4">
        <h2 className="text-xl text-center font-semibold text-white mb-2">
          Welcome back!
        </h2>

        <Input
          label="Email"
          placeholder="Email"
          value={email}
          error={loginErrors.emailError}
          onChange={(e) => {setEmail(e.target.value); clearBackendError();}}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Password"
          value={password}
          error={loginErrors.passwordError}
          onChange={(e) => {setPassword(e.target.value); clearBackendError();}}
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