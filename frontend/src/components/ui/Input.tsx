"use client";
import { InputHTMLAttributes } from "react";

export default function Input({ label, error, className = "", id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-[13px] font-semibold" style={{ color: "var(--fg2)" }}>{label}</label>}
      <input id={id}
        className={`w-full px-4 py-2.5 text-[14px] rounded-[var(--r-sm)] border-2 outline-none transition-all placeholder:text-[var(--fg4)] ${className}`}
        style={{ background: "var(--white)", borderColor: error ? "var(--red)" : "var(--border)", color: "var(--fg)" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(79,110,247,0.1)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? "var(--red)" : "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
        {...props}
      />
      {error && <p className="text-[12px] font-medium" style={{ color: "var(--red)" }}>{error}</p>}
    </div>
  );
}
