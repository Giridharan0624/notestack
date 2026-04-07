"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base = `
    inline-flex items-center justify-center gap-2 font-medium
    transition-all duration-[var(--transition-fast)]
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
    disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.97] cursor-pointer
  `;

  const variants: Record<string, string> = {
    primary: `
      bg-[var(--text-primary)] text-[var(--text-inverse)]
      hover:bg-[var(--text-secondary)]
      shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
    `,
    secondary: `
      bg-[var(--bg-secondary)] text-[var(--text-primary)]
      border border-[var(--border)]
      hover:bg-[var(--border-light)] hover:border-[var(--text-tertiary)]
    `,
    danger: `
      bg-[var(--danger)] text-white
      hover:bg-[var(--danger-hover)]
      shadow-[var(--shadow-sm)]
    `,
    ghost: `
      bg-transparent text-[var(--text-secondary)]
      hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]
    `,
  };

  const sizes: Record<string, string> = {
    sm: "text-xs px-3 py-1.5 rounded-[var(--radius-sm)]",
    md: "text-sm px-4 py-2 rounded-[var(--radius-md)]",
    lg: "text-base px-6 py-2.5 rounded-[var(--radius-md)]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"
            style={{ animation: "spin 0.6s linear infinite" }}
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
