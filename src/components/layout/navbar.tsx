"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <nav className="flex items-center justify-between pb-8 mb-8 border-b border-border">
      <Link href="/dashboard" className="text-xl font-bold text-foreground no-underline hover:no-underline">
        Carteira<span className="text-primary">Pay</span>
      </Link>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <>
                <Spinner size="sm" />
                Saindo...
              </>
            ) : (
              "Sair"
            )}
          </Button>
        </div>
      )}
    </nav>
  );
}
