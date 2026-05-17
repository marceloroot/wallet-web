import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApiClientError } from "@/lib/api";

type AlertsProps = {
  success?: string | null;
  error?: string | null;
  fieldErrors?: Record<string, string[]>;
};

export function Alerts({ success, error, fieldErrors }: AlertsProps) {
  const fieldMessages = fieldErrors
    ? Object.values(fieldErrors).flat()
    : [];

  if (!success && !error && fieldMessages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-5">
      {success && (
        <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {(error || fieldMessages.length > 0) && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          {error && <AlertDescription>{error}</AlertDescription>}
          {fieldMessages.length > 0 && (
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1">
                {fieldMessages.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}
    </div>
  );
}

export function getErrorMessage(err: unknown): {
  message: string;
  fieldErrors?: Record<string, string[]>;
} {
  if (err instanceof ApiClientError) {
    return { message: err.message, fieldErrors: err.errors };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: "Ocorreu um erro inesperado." };
}
