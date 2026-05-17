"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Alerts, getErrorMessage } from "@/components/alerts";
import { GuestGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors(undefined);
    setSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
    } catch (err) {
      const parsed = getErrorMessage(err);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GuestGuard>
      <div className="min-h-screen flex items-center justify-center p-6 wallet-gradient">
        <Card className="w-full max-w-md border-border/80 bg-card/95 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Criar conta</CardTitle>
            <CardDescription>
              Cadastre-se e receba sua carteira automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alerts error={error} fieldErrors={fieldErrors} />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirmar senha</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="text-primary-foreground" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar"
                )}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </GuestGuard>
  );
}
