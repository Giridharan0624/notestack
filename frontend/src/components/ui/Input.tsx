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
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border transition-all focus:outline-none placeholder:text-[var(--text-tertiary)] ${className}`}
        style={{
          background: "var(--bg-surface)",
          borderColor: error ? "var(--red)" : "var(--border)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-subtle)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "var(--red)" : "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>
      )}
    </div>
  );
}
