"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Button from "./ui/Button";
import Link from "next/link";

export default function Header() {
  const { isAuthenticated, userEmail, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => { logout(); router.replace("/login"); };

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className="text-sm font-medium px-3 py-1.5 rounded-[var(--radius-sm)] transition-all"
        style={{
          color: active ? "var(--text-primary)" : "var(--text-tertiary)",
          background: active ? "var(--bg-surface)" : "transparent",
        }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--bg-raised)"; } }}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; } }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 animate-slide-down" style={{ background: "rgba(12,12,15,0.8)", backdropFilter: "blur(16px) saturate(1.4)", borderBottom: "1px solid var(--border)" }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-2.5">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(isAuthenticated ? "/dashboard" : "/explore")}>
            <div className="h-7 w-7 rounded-[var(--radius-sm)] flex items-center justify-center text-xs font-bold" style={{ background: "var(--accent-gradient)", color: "white" }}>N</div>
            <span className="text-sm font-bold tracking-tight hidden sm:block" style={{ color: "var(--text-primary)" }}>NoteStack</span>
          </div>
          <nav className="flex items-center gap-1">
            {navLink("/explore", "Explore")}
            {isAuthenticated && navLink("/dashboard", "My Notes")}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="text-xs hidden sm:block mr-1" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{userEmail}</span>
              <Button variant="ghost" size="sm" onClick={() => router.push("/profile/edit")}>Profile</Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>Sign in</Button>
              <Button size="sm" onClick={() => router.push("/signup")}>Sign up</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
