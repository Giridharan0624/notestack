"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";

export default function Header() {
  const { isAuthenticated, userEmail, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1
          className="text-xl font-bold text-blue-600 cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          NoteStack
        </h1>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
