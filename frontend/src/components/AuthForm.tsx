"use client";

import { FormEvent, useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

interface AuthFormProps {
  title: string;
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  footer?: React.ReactNode;
  showConfirmation?: boolean;
  onConfirm?: (email: string, code: string) => Promise<void>;
}

export default function AuthForm({
  title,
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
      <div className="w-full max-w-sm mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Verify Your Email
        </h2>
        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 text-center">
            We sent a verification code to {email}
          </p>
          <Input
            id="code"
            label="Verification Code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" isLoading={isLoading}>
            Verify
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
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
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
        {footer}
      </form>
    </div>
  );
}
