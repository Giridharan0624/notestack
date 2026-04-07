"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  const { isAuthenticated, isLoading, signup, confirmSignup } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!isLoading && isAuthenticated) router.replace("/dashboard"); }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: "var(--accent)" }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]" style={{ background: "var(--pink)" }} />

      <div className="mb-8 flex items-center gap-2.5 animate-fade-up">
        <div className="h-9 w-9 rounded-[var(--radius-md)] flex items-center justify-center text-sm font-bold" style={{ background: "var(--accent-gradient)", color: "white" }}>N</div>
        <span className="text-lg font-bold tracking-tight">NoteStack</span>
      </div>

      <div className="w-full max-w-md glass p-7" style={{ boxShadow: "var(--shadow-lg)" }}>
        <AuthForm
          title="Join NoteStack"
          subtitle="Start sharing notes with classmates"
          submitLabel="Create account"
          onSubmit={async (email, password) => { await signup(email, password); }}
          showConfirmation
          onConfirm={async (email, code) => { await confirmSignup(email, code); router.push("/login"); }}
          footer={
            <p className="text-sm text-center" style={{ color: "var(--text-tertiary)" }}>
              Already have an account?{" "}
              <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>Sign in</Link>
            </p>
          }
        />
      </div>
    </div>
  );
}
