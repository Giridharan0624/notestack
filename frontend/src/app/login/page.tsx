"use client";
import { useAuth } from "@/context/AuthContext"; import { useRouter } from "next/navigation"; import { useEffect } from "react";
import AuthForm from "@/components/AuthForm"; import Link from "next/link";

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth(); const router = useRouter();
  useEffect(() => { if (!isLoading && isAuthenticated) router.replace("/dashboard"); }, [isAuthenticated, isLoading, router]);
  return (
    <div className="flex-1 flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative overflow-hidden flex-col justify-between p-10" style={{ background: "var(--g1)" }}>
        <div className="absolute top-[-120px] right-[-80px] w-[350px] h-[350px] rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="absolute top-[35%] left-[40%] w-[180px] h-[180px] rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-[14px] font-bold" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>N</div>
            <span className="text-[18px] font-bold text-white">NoteStack</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-[36px] font-extrabold text-white leading-[1.15] tracking-tight mb-4">
            Your notes,<br/>everywhere.
          </h2>
          <p className="text-[15px] text-white/60 leading-relaxed max-w-xs">
            Upload, share, and discover study materials with students around the world.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-[14px] font-bold text-white" style={{ background: "var(--g1)" }}>N</div>
            <span className="text-[18px] font-bold">NoteStack</span>
          </div>
          <AuthForm title="Welcome back" subtitle="Sign in to your account" submitLabel="Sign in"
            onSubmit={async (e, p) => { await login(e, p); router.replace("/dashboard"); }}
            footer={
              <div className="space-y-3 pt-1">
                <p className="text-[13px] text-center" style={{ color: "var(--fg3)" }}>
                  Don&apos;t have an account? <Link href="/signup" className="font-semibold" style={{ color: "var(--blue)" }}>Sign up free</Link>
                </p>
                <p className="text-[13px] text-center">
                  <Link href="/forgot-password" className="font-medium" style={{ color: "var(--fg4)" }}>Forgot password?</Link>
                </p>
              </div>
            } />
        </div>
      </div>
    </div>
  );
}
