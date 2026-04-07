"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Button from "./ui/Button";
import NotificationBell from "./NotificationBell";
import Link from "next/link";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const p = usePathname();

  const nav = (href: string, label: string) => (
    <Link href={href} className="text-[14px] font-semibold px-3 py-1.5 rounded-[var(--r-sm)] transition-all"
      style={{ color: p === href ? "var(--blue)" : "var(--fg3)", background: p === href ? "rgba(79,110,247,0.08)" : "transparent" }}>
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-[56px]">
        <div className="flex items-center gap-6">
          <Link href={isAuthenticated ? "/dashboard" : "/explore"} className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[10px] flex items-center justify-center text-[13px] font-extrabold text-white" style={{ background: "var(--g1)" }}>N</div>
            <span className="text-[17px] font-extrabold tracking-tight hidden sm:block">NoteStack</span>
          </Link>
          <nav className="flex items-center gap-1">{nav("/explore", "Explore")}{isAuthenticated && nav("/dashboard", "My Notes")}{isAuthenticated && nav("/groups", "Groups")}{isAuthenticated && nav("/saved", "Saved")}</nav>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Button variant="ghost" size="sm" onClick={() => router.push("/profile/edit")}>Profile</Button>
              <Button variant="ghost" size="sm" onClick={() => { logout(); router.replace("/login"); }}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>Sign in</Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/signup")}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
