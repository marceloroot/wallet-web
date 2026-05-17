import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Carregando carteira">
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-border/80 bg-card/90">
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90">
          <CardContent className="pt-6 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i} className="border-border/80 bg-card/90">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/80 bg-card/90">
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-3 w-36" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
