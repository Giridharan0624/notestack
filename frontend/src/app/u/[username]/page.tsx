"use client";
import { useEffect, useState } from "react"; import { useParams, useRouter } from "next/navigation";
import { usernameApi } from "@/lib/api"; import { UserProfile } from "@/lib/types";
import Spinner from "@/components/ui/Spinner";

export default function UsernamePage() {
  const { username } = useParams() as { username: string }; const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usernameApi.getProfile(username)
      .then((p) => { router.replace(`/profile/${p.userId}`); })
      .catch(() => { setLoading(false); });
  }, [username, router]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Spinner /></div>;
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="text-3xl mb-3">🔍</div>
      <p className="text-[16px] font-bold">User not found</p>
      <p className="text-[14px]" style={{ color: "var(--fg3)" }}>No user with username &ldquo;{username}&rdquo;</p>
    </div>
  );
}
