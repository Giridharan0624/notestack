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
    <div className="flex-1 flex items-center justify-center p-4">
      <AuthForm
        title="Sign in to NoteStack"
        submitLabel="Sign In"
        onSubmit={handleLogin}
        footer={
          <p className="text-sm text-center text-gray-600 mt-2">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        }
      />
    </div>
  );
}
