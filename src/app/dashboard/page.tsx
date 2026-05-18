"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Alerts, getErrorMessage } from "@/components/alerts";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { Navbar } from "@/components/layout/navbar";
import { LoadingOverlay } from "@/components/loading";
import { TransactionBadge } from "@/components/transaction-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, ApiClientError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Recipient, Transaction } from "@/types/wallet";

type ActionKey = "deposit" | "transfer";

function isInsufficientBalanceError(message: string, err: unknown): boolean {
  if (message.toLowerCase().includes("saldo insuficiente")) {
    return true;
  }
  return err instanceof ApiClientError && err.code === "insufficient_balance";
}

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [balanceCents, setBalanceCents] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<ActionKey | null>(null);
  const [reversingId, setReversingId] = useState<number | null>(null);

  const [depositAmount, setDepositAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [toUserId, setToUserId] = useState("");

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();

  const isBusy = refreshing || actionLoading !== null || reversingId !== null;

  function recipientLabel(id: string) {
    const recipient = recipients.find((r) => String(r.id) === id);
    return recipient ? `${recipient.name} (${recipient.email})` : id;
  }

  const loadData = useCallback(async () => {
    const [balanceRes, txRes, recipientsRes] = await Promise.all([
      api.balance(),
      api.transactions(),
      api.recipients(),
    ]);
    setBalance(balanceRes.balance);
    setBalanceCents(balanceRes.balance_cents);
    setTransactions(txRes.data);
    setRecipients(recipientsRes.data);
  }, []);

  useEffect(() => {
    loadData()
      .catch((err) => {
        const parsed = getErrorMessage(err);
        setError(parsed.message);
      })
      .finally(() => setLoading(false));
  }, [loadData]);

  async function handleAction(
    action: () => Promise<unknown>,
    successMessage: string,
    options?: {
      actionKey?: ActionKey;
      reversingId?: number;
      onError?: (parsed: { message: string; fieldErrors?: Record<string, string[]> }, err: unknown) => void;
    },
  ) {
    setSuccess(null);
    setError(null);
    setFieldErrors(undefined);

    if (options?.actionKey) setActionLoading(options.actionKey);
    if (options?.reversingId != null) setReversingId(options.reversingId);

    try {
      await action();
      setRefreshing(true);
      await loadData();
      setSuccess(successMessage);
      return true;
    } catch (err) {
      const parsed = getErrorMessage(err);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
      options?.onError?.(parsed, err);
      return false;
    } finally {
      setActionLoading(null);
      setReversingId(null);
      setRefreshing(false);
    }
  }

  async function onDeposit(e: FormEvent) {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    await handleAction(
      () => api.deposit(amount),
      `Depósito de ${formatCurrency(amount)} realizado com sucesso.`,
      { actionKey: "deposit" },
    );
    setDepositAmount("");
  }

  async function onTransfer(e: FormEvent) {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    const amountForDeposit = transferAmount;
    const success = await handleAction(
      () => api.transfer(Number(toUserId), amount),
      `Transferência de ${formatCurrency(amount)} realizada com sucesso.`,
      {
        actionKey: "transfer",
        onError: (parsed, err) => {
          if (isInsufficientBalanceError(parsed.message, err)) {
            setDepositAmount(amountForDeposit);
          }
        },
      },
    );
    if (success) {
      setTransferAmount("");
      setToUserId("");
    }
  }

  async function onReverse(id: number) {
    if (!confirm("Confirmar estorno desta transação?")) return;
    await handleAction(
      () => api.reverseTransaction(id),
      "Transação estornada com sucesso.",
      { reversingId: id },
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen wallet-gradient">
        <div className="container max-w-5xl mx-auto px-6 py-6">
          <Navbar />
          <Alerts success={success} error={error} fieldErrors={fieldErrors} />

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              <div className="relative grid gap-5 md:grid-cols-2 mb-5">
                <LoadingOverlay visible={refreshing} />
                <Card className="border-border/80 bg-card/90">
                  <CardContent className="pt-6">
                    <CardDescription className="uppercase tracking-wider text-xs mb-3">
                      Saldo disponível
                    </CardDescription>
                    <p
                      className={`text-4xl font-bold tracking-tight ${
                        balanceCents < 0 ? "text-amber-400" : ""
                      }`}
                    >
                      {formatCurrency(balance)}
                    </p>
                    {balanceCents < 0 && (
                      <p className="text-amber-400/90 text-sm mt-2">
                        Saldo negativo — depósitos serão somados ao valor atual.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/80 bg-card/90">
                  <CardContent className="pt-6">
                    <CardDescription className="uppercase tracking-wider text-xs mb-3">
                      Resumo rápido
                    </CardDescription>
                    <p className="text-sm text-muted-foreground">
                      Use os formulários ao lado para depositar ou transferir.
                      Transações podem ser estornadas enquanto estiverem ativas.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-5 md:grid-cols-2 mb-5">
                <Card className="border-border/80 bg-card/90">
                  <CardContent className="pt-6">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
                      Depositar
                    </CardTitle>
                    <form onSubmit={onDeposit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit_amount">Valor (R$)</Label>
                        <Input
                          id="deposit_amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="100,00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          disabled={isBusy}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isBusy}
                      >
                        {actionLoading === "deposit" ? (
                          <>
                            <Spinner size="sm" className="text-primary-foreground" />
                            Depositando...
                          </>
                        ) : (
                          "Depositar"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-border/80 bg-card/90">
                  <CardContent className="pt-6">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
                      Transferir
                    </CardTitle>
                    <form onSubmit={onTransfer} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Destinatário</Label>
                        <Select
                          value={toUserId}
                          onValueChange={(v) => setToUserId(v ?? "")}
                          itemToStringLabel={recipientLabel}
                          disabled={isBusy}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {recipients.map((r) => (
                              <SelectItem key={r.id} value={String(r.id)}>
                                {r.name} ({r.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transfer_amount">Valor (R$)</Label>
                        <Input
                          id="transfer_amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="50,00"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          disabled={isBusy}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!toUserId || isBusy}
                      >
                        {actionLoading === "transfer" ? (
                          <>
                            <Spinner size="sm" className="text-primary-foreground" />
                            Transferindo...
                          </>
                        ) : (
                          "Transferir"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <Card className="relative border-border/80 bg-card/90">
                <LoadingOverlay visible={refreshing} />
                <CardContent className="pt-6">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">
                    Histórico de transações
                  </CardTitle>

                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma transação ainda. Faça um depósito para começar.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>{tx.id}</TableCell>
                              <TableCell>
                                <TransactionBadge type={tx.type} />
                              </TableCell>
                              <TableCell>{formatCurrency(tx.amount)}</TableCell>
                              <TableCell>
                                {tx.status === "reversed" ? (
                                  <Badge variant="secondary">estornada</Badge>
                                ) : (
                                  <span className="text-emerald-400 text-sm">concluída</span>
                                )}
                              </TableCell>
                              <TableCell>{formatDate(tx.created_at)}</TableCell>
                              <TableCell>
                                {tx.status !== "reversed" &&
                                  ["deposit", "transfer_out"].includes(tx.type) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-destructive border-destructive/50 hover:bg-destructive/10 min-w-[5.5rem]"
                                      onClick={() => onReverse(tx.id)}
                                      disabled={isBusy}
                                    >
                                      {reversingId === tx.id ? (
                                        <>
                                          <Spinner size="sm" />
                                          ...
                                        </>
                                      ) : (
                                        "Estornar"
                                      )}
                                    </Button>
                                  )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
