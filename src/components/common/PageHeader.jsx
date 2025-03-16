import { Button } from "@/components/ui/button";

export default function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center">
        {Icon && (
          <div className="mr-3 p-2 rounded-full bg-brand-neon/10">
            <Icon className="h-6 w-6 text-brand-neon" />
          </div>
        )}
        <div>
          <h1 className="heading-2 text-brand-black">{title}</h1>
          {subtitle && <p className="subtle-text mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <Button onClick={action.onClick} className="btn-primary animate-fade-in">
          {action.label}
        </Button>
      )}
    </div>
  );
}
