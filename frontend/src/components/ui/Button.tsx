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
  style,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none";

  const variants: Record<string, string> = {
    primary: "text-white",
    secondary: "text-[var(--text-primary)]",
    danger: "text-[var(--red)]",
    ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--accent-gradient)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    },
    secondary: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "var(--red-subtle)",
      border: "1px solid transparent",
    },
    ghost: {
      background: "transparent",
    },
  };

  const sizes: Record<string, string> = {
    sm: "text-xs px-2.5 py-1.5 rounded-[var(--radius-sm)]",
    md: "text-sm px-3.5 py-2 rounded-[var(--radius-md)]",
    lg: "text-sm px-5 py-2.5 rounded-[var(--radius-md)]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
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
