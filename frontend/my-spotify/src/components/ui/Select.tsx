"use client";

import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export default function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-neutral-400 mb-1">
          {label}
        </label>
      )}

      <select
        {...props}
        className={`
          w-full p-3
          bg-neutral-800/60
          border border-neutral-700/40
          rounded-lg
          text-white
          focus:outline-none
          focus:border-green-500
          focus:ring-2
          focus:ring-green-500/20
          transition-all
          ${className}
        `}
      >
        {children}
      </select>

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}