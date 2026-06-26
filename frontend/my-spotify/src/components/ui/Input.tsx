"use client";

import { InputHTMLAttributes, useState } from "react";
import {Eye, EyeOff} from "lucide-react"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  label,
  error,
  className = "",
  type,
  ...props
}: InputProps) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-neutral-400 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...props}
          type={isPassword && showPassword ? "text" : type}
          className={`
            w-full p-3
            ${isPassword ? "pr-16" : ""}
            bg-neutral-800/60
            border border-neutral-700/40
            rounded-lg
            text-white placeholder:text-neutral-500
            focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20
            transition-all
            ${className}
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-400 hover:text-green-400 transition"
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}