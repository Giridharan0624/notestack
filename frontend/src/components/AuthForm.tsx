"use client";

import { FormEvent, useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

interface AuthFormProps {
  title: string;
  subtitle?: string;
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  footer?: React.ReactNode;
  showConfirmation?: boolean;
  onConfirm?: (email: string, code: string) => Promise<void>;
}

export default function AuthForm({ title, subtitle, submitLabel, onSubmit, footer, showConfirmation, onConfirm }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setIsLoading(true);
    try { await onSubmit(email, password); if (showConfirmation) setNeedsConfirmation(true); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "An error occurred"); }
    finally { setIsLoading(false); }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setIsLoading(true);
    try { await onConfirm?.(email, code); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Confirmation failed"); }
    finally { setIsLoading(false); }
  };

  if (needsConfirmation) {
    return (
      <div className="w-full max-w-sm mx-auto animate-fade-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full mb-3" style={{ background: "var(--green-subtle)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--green)" }}><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 className="text-xl font-bold">{`Check your email`}</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Code sent to <span style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{email}</span></p>
        </div>
        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          <Input id="code" label="Verification Code" type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" autoFocus required />
          {error && <div className="text-xs px-3 py-2 rounded-[var(--radius-sm)]" style={{ background: "var(--red-subtle)", color: "var(--red)" }}>{error}</div>}
          <Button type="submit" isLoading={isLoading} size="lg" className="w-full">Verify</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" autoComplete="email" required />
        <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} autoComplete="current-password" required />
        {error && <div className="text-xs px-3 py-2 rounded-[var(--radius-sm)]" style={{ background: "var(--red-subtle)", color: "var(--red)" }}>{error}</div>}
        <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-1">{submitLabel}</Button>
        {footer && <div className="mt-1">{footer}</div>}
      </form>
    </div>
  );
}
