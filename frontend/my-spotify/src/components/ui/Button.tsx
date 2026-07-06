"use client";

import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "w-full py-3 rounded-lg font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-green-500 hover:bg-green-400 text-black disabled:bg-green-700 disabled:hover:bg-green-700",
    secondary:
      "bg-neutral-800 hover:bg-neutral-700 text-white disabled:bg-neutral-900 disabled:text-neutral-500 disabled:hover:bg-neutral-900",
    danger:
      "bg-red-600 hover:bg-red-500 text-white disabled:bg-red-900 disabled:text-red-300 disabled:hover:bg-red-900",
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    />
  );
}