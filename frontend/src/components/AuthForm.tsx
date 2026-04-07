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

export default function AuthForm({
  title,
  subtitle,
  submitLabel,
  onSubmit,
  footer,
  showConfirmation,
  onConfirm,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await onSubmit(email, password);
      if (showConfirmation) {
        setNeedsConfirmation(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await onConfirm?.(email, code);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="w-full max-w-sm mx-auto animate-fade-in-up">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-4"
            style={{ background: "var(--success-light)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--success)" }}>
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Check your email
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
            We sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleConfirm} className="flex flex-col gap-5">
          <Input
            id="code"
            label="Verification code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            autoFocus
            required
          />
          {error && (
            <div
              className="text-sm px-3 py-2 rounded-[var(--radius-sm)]"
              style={{ background: "var(--danger-light)", color: "var(--danger)" }}
            >
              {error}
            </div>
          )}
          <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
            Verify email
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          minLength={8}
          autoComplete="current-password"
          required
        />
        {error && (
          <div
            className="text-sm px-3 py-2 rounded-[var(--radius-sm)]"
            style={{ background: "var(--danger-light)", color: "var(--danger)" }}
          >
            {error}
          </div>
        )}
        <Button type="submit" isLoading={isLoading} size="lg" className="w-full mt-1">
          {submitLabel}
        </Button>
        {footer && <div className="mt-1">{footer}</div>}
      </form>
    </div>
  );
}
