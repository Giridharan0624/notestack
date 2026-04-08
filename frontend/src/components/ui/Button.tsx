"use client";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { background: "#4f46e5", color: "white", boxShadow: "0 1px 2px rgba(79,70,229,0.3), 0 1px 3px rgba(0,0,0,0.08)" },
  secondary: { background: "white", color: "var(--fg)", border: "1px solid var(--border)" },
  ghost: { background: "transparent", color: "var(--fg3)" },
  danger: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
};

const variantHover: Record<string, React.CSSProperties> = {
  primary: { background: "#4338ca" },
  secondary: { background: "var(--hover)", borderColor: "var(--border-hover)" },
  ghost: { background: "var(--hover)", color: "var(--fg)" },
  danger: { background: "#fee2e2" },
};

export default function Button({ children, variant = "primary", size = "md", isLoading, className = "", disabled, style, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none select-none";
  const sizes: Record<string, string> = {
    sm: "text-[13px] h-8 px-3.5 rounded-[10px]",
    md: "text-[14px] h-10 px-5 rounded-[10px]",
    lg: "text-[15px] h-11 px-6 rounded-[10px]",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
      disabled={disabled || isLoading}
      onMouseEnter={(e) => { const h = variantHover[variant]; if (h) Object.assign(e.currentTarget.style, h); }}
      onMouseLeave={(e) => { const s = variantStyles[variant]; if (s) Object.assign(e.currentTarget.style, { ...s, ...style }); }}
      {...props}
    >
      {isLoading ? <><span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" style={{ animation: "spin 0.5s linear infinite" }} />Loading...</> : children}
    </button>
  );
}
