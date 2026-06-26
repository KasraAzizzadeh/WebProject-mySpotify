"use client";

import { InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode;
};

export default function Checkbox({
  label,
  className = "",
  ...props
}: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        {...props}
        className={`
          h-4 w-4
          rounded
          border-neutral-600
          accent-green-500
          bg-neutral-800
          text-green-500
          focus:ring-green-500
          ${className}
        `}
      />

      <span className="text-sm text-neutral-300">
        {label}
      </span>
    </label>
  );
}