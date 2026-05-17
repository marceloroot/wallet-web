import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  label?: string;
  className?: string;
};

export function PageLoader({ label = "Carregando...", className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="lg" className="text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

type LoadingOverlayProps = {
  visible: boolean;
  className?: string;
};

export function LoadingOverlay({ visible, className }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/60 backdrop-blur-[1px]",
        className,
      )}
      aria-hidden
    >
      <Spinner className="text-primary" />
    </div>
  );
}
