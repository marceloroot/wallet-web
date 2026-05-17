"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/loading";
import { getToken } from "@/lib/auth-storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? "/dashboard" : "/login");
  }, [router]);

  return <PageLoader label="Redirecionando..." className="wallet-gradient" />;
}
