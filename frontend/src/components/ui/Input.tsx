"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-3.5 py-2.5 text-sm
          rounded-[var(--radius-md)]
          border transition-all duration-[var(--transition-fast)]
          placeholder:text-[var(--text-tertiary)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 focus:border-transparent
          ${error
            ? "border-[var(--danger)] bg-[var(--danger-light)]"
            : "border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-tertiary)]"
          }
          ${className}
        `}
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
        }}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
