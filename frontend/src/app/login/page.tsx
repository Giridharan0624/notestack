"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    router.push("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--accent-glow)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--accent-light)" }}
      />

      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 animate-fade-in-up">
        <div
          className="h-10 w-10 rounded-[var(--radius-md)] flex items-center justify-center text-base font-bold"
          style={{
            background: "var(--text-primary)",
            color: "var(--text-inverse)",
            fontFamily: "var(--font-display)",
          }}
        >
          N
        </div>
        <span
          className="text-xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          NoteStack
        </span>
      </div>

      <div
        className="w-full max-w-md p-8 relative"
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--border-light)",
        }}
      >
        <AuthForm
          title="Welcome back"
          subtitle="Sign in to continue to your notes"
          submitLabel="Sign in"
          onSubmit={handleLogin}
          footer={
            <p className="text-sm text-center" style={{ color: "var(--text-tertiary)" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium transition-colors"
                style={{ color: "var(--accent)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--accent)")}
              >
                Create one
              </Link>
            </p>
          }
        />
      </div>
    </div>
  );
}
