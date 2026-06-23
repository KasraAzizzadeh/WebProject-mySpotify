"use client";

import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-neutral-400 mb-1">
          {label}
        </label>
      )}

      <input
        {...props}
        className={`
          w-full p-3
          bg-neutral-800/60
          border border-neutral-700/40
          rounded-lg
          text-white placeholder:text-neutral-500
          focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20
          transition-all
          ${className}
        `}
      />

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}