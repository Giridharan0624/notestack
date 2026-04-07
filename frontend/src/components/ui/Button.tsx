"use client";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export default function Button({ children, variant = "primary", size = "md", isLoading, className = "", disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none";
  const sizes: Record<string, string> = {
    sm: "text-[13px] px-3.5 py-1.5 rounded-[10px]",
    md: "text-[14px] px-5 py-2.5 rounded-[12px]",
    lg: "text-[15px] px-6 py-3 rounded-[14px]",
  };
  const vars: Record<string, string> = {
    primary: "bg-[var(--fg)] text-white hover:opacity-90 shadow-[var(--shadow-sm)]",
    secondary: "bg-white text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--hover)] shadow-[var(--shadow-sm)]",
    ghost: "bg-transparent text-[var(--fg3)] hover:text-[var(--fg)] hover:bg-[var(--hover)]",
    danger: "bg-[#fef2f2] text-[var(--red)] hover:bg-[#fee2e2]",
  };
  return (
    <button className={`${base} ${sizes[size]} ${vars[variant]} ${className}`} disabled={disabled || isLoading} {...props}>
      {isLoading ? <><span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" style={{ animation: "spin 0.5s linear infinite" }} />Loading...</> : children}
    </button>
  );
}
