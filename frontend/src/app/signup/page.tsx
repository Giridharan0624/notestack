"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  const { isAuthenticated, isLoading, signup, confirmSignup } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignup = async (email: string, password: string) => {
    await signup(email, password);
  };

  const handleConfirm = async (email: string, code: string) => {
    await confirmSignup(email, code);
    router.push("/login");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AuthForm
        title="Create your account"
        submitLabel="Sign Up"
        onSubmit={handleSignup}
        showConfirmation
        onConfirm={handleConfirm}
        footer={
          <p className="text-sm text-center text-gray-600 mt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        }
      />
    </div>
  );
}
