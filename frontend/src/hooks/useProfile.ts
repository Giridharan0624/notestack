"use client";

import { useState, useEffect, useCallback } from "react";
import { profileApi } from "@/lib/api";
import { UserProfile } from "@/lib/types";

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = userId
        ? await profileApi.get(userId)
        : await profileApi.getOwn();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data: {
    username?: string;
    displayName?: string;
    university?: string;
    bio?: string;
    yearOfStudy?: string;
    major?: string;
    socialLinks?: Record<string, string>;
  }) => {
    const updated = await profileApi.update(data);
    setProfile(updated);
    return updated;
  };

  return { profile, isLoading, error, updateProfile, refresh: fetchProfile };
}
