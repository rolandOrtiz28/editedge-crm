import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardCard({ title, children, icon: Icon, className }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-lg text-brand-black">{title}</h3>
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div>{children}</div>
      </div>
    </Card>
  );
}
