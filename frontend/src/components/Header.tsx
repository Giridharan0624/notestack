"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Button from "./ui/Button";
import Link from "next/link";

export default function Header() {
  const { isAuthenticated, userEmail, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className="text-sm font-medium transition-colors px-1 py-0.5"
        style={{
          color: active ? "var(--accent)" : "var(--text-secondary)",
          borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
        }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      className="sticky top-0 z-40 animate-slide-down"
      style={{
        background: "rgba(250, 248, 245, 0.85)",
        backdropFilter: "blur(12px) saturate(1.2)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/explore")}
          >
            <div
              className="h-8 w-8 rounded-[var(--radius-sm)] flex items-center justify-center text-sm font-bold transition-transform duration-[var(--transition-fast)] group-hover:scale-105"
              style={{
                background: "var(--text-primary)",
                color: "var(--text-inverse)",
                fontFamily: "var(--font-display)",
              }}
            >
              N
            </div>
            <span
              className="text-lg font-semibold tracking-tight hidden sm:block"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              NoteStack
            </span>
          </div>

          <nav className="flex items-center gap-4">
            {navLink("/explore", "Explore")}
            {isAuthenticated && navLink("/dashboard", "My Notes")}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/profile/edit")}
              >
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => router.push("/signup")}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
