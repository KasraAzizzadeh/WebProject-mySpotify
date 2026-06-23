"use client";

import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "w-full py-3 rounded-lg font-semibold transition-all cursor-pointer";

  const variants = {
    primary:
      "bg-green-500 hover:bg-green-400 text-black",
    secondary:
      "bg-neutral-800 hover:bg-neutral-700 text-white",
  };

  return (
    <button
      {...props}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    />
  );
}