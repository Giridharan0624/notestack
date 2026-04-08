"use client";
import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Button from "./ui/Button";
import NotificationBell from "./NotificationBell";
import Link from "next/link";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const p = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const nav = (href: string, label: string) => (
    <Link href={href} onClick={() => setMobileOpen(false)}
      className="text-[14px] font-semibold px-3 py-1.5 rounded-[var(--r-sm)] transition-all whitespace-nowrap"
      style={{ color: p === href ? "var(--blue)" : "var(--fg3)", background: p === href ? "rgba(79,110,247,0.08)" : "transparent" }}>
      {label}
    </Link>
  );

  const navLinks = (
    <>
      {nav("/explore", "Explore")}
      {isAuthenticated && nav("/dashboard", "My Notes")}
      {isAuthenticated && nav("/shared", "Shared")}
      {isAuthenticated && nav("/groups", "Groups")}
      {isAuthenticated && nav("/saved", "Saved")}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[56px] gap-3">
          <div className="flex items-center gap-4 sm:gap-5 shrink-0">
            <Link href={isAuthenticated ? "/dashboard" : "/explore"} className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-[8px] flex items-center justify-center text-[12px] font-extrabold text-white" style={{ background: "var(--g1)" }}>N</div>
              <span className="text-[16px] font-extrabold tracking-tight hidden lg:block">NoteStack</span>
            </Link>
            <nav className="hidden md:flex items-center gap-0.5">{navLinks}</nav>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-[280px]">
            <div className="relative w-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg4)" }}>
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students or notes..."
                className="w-full pl-9 pr-3 py-1.5 text-[13px] rounded-[var(--r-full)] border outline-none transition-all placeholder:text-[var(--fg4)]"
                style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--fg)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,110,247,0.08)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
          </form>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => router.push("/profile")}>Profile</Button>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => { logout(); router.replace("/login"); }}>Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>Sign in</Button>
                <Button variant="primary" size="sm" onClick={() => router.push("/signup")}>Get started</Button>
              </>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 rounded-[8px] hover:bg-[var(--hover)] cursor-pointer" style={{ color: "var(--fg3)" }}>
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-[56px] z-30 bg-white border-b border-[var(--border)] shadow-[var(--shadow-md)] pop">
          <div className="p-3 space-y-2">
            {/* Mobile search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg4)" }}>
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students or notes..."
                  className="w-full pl-9 pr-3 py-2 text-[14px] rounded-[var(--r)] border outline-none placeholder:text-[var(--fg4)]"
                  style={{ background: "var(--bg)", borderColor: "var(--border)", color: "var(--fg)" }}
                />
              </div>
            </form>
            <nav className="flex flex-col gap-1">{navLinks}</nav>
            {isAuthenticated && (
              <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => { router.push("/profile"); setMobileOpen(false); }}>Profile</Button>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => { logout(); router.replace("/login"); setMobileOpen(false); }}>Sign out</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
