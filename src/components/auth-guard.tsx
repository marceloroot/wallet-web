"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/loading";
import { getToken } from "@/lib/auth-storage";
import { useAuth } from "@/contexts/auth-context";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && getToken()) {
      router.replace("/dashboard");
    }
  }, [isLoading, router]);

  if (isLoading || getToken()) {
    return <PageLoader className="min-h-screen wallet-gradient" />;
  }

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !getToken()) {
      router.replace("/login");
    }
  }, [isLoading, router]);

  if (isLoading || !getToken()) {
    return <PageLoader className="min-h-screen wallet-gradient" />;
  }

  return <>{children}</>;
}
