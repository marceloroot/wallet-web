import { Badge } from "@/components/ui/badge";
import { transactionTypeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const typeStyles: Record<string, string> = {
  deposit: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  transfer_out: "bg-red-500/20 text-red-300 border-red-500/30",
  transfer_in: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  reversal: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

export function TransactionBadge({ type }: { type: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-semibold", typeStyles[type] ?? "")}
    >
      {transactionTypeLabel(type)}
    </Badge>
  );
}
