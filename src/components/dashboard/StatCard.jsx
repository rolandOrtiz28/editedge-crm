import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, change, className }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-2xl sm:text-3xl font-semibold">{value}</h3>

            {change && (
              <div className="mt-2 flex items-center">
                {change.isPositive ? (
                  <ArrowUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium ml-1",
                    change.isPositive ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {Math.abs(change.value)}%
                </span>
                <span className="text-sm text-muted-foreground ml-1">from last month</span>
              </div>
            )}
          </div>

          <div className="p-2 rounded-full bg-brand-neon/10">
            <Icon className="h-6 w-6 text-brand-neon" />
          </div>
        </div>
      </div>
    </Card>
  );
}