"use client";
import { useAuth } from "@/context/AuthContext"; import { useRouter } from "next/navigation"; import { useEffect } from "react";
import AuthForm from "@/components/AuthForm"; import Link from "next/link";

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth(); const router = useRouter();
  useEffect(() => { if (!isLoading && isAuthenticated) router.replace("/dashboard"); }, [isAuthenticated, isLoading, router]);
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="h-9 w-9 rounded-[10px] flex items-center justify-center text-[14px] font-extrabold text-white" style={{ background: "var(--g1)" }}>N</div>
          <span className="text-[18px] font-extrabold tracking-tight">NoteStack</span>
        </div>
        <AuthForm title="Welcome back" subtitle="Sign in to continue sharing notes" submitLabel="Sign in"
          onSubmit={async (e, p) => { await login(e, p); router.push("/dashboard"); }}
          footer={<div className="space-y-2"><p className="text-[13px] text-center" style={{ color: "var(--fg3)" }}>No account? <Link href="/signup" className="font-semibold" style={{ color: "var(--blue)" }}>Sign up free</Link></p><p className="text-[13px] text-center"><Link href="/forgot-password" className="font-medium" style={{ color: "var(--fg4)" }}>Forgot password?</Link></p></div>} />
      </div>
    </div>
  );
}
