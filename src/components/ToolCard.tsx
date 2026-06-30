import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
}

export function ToolCard({ title, description, icon: Icon, path }: ToolCardProps) {
  return (
    <Link 
      to={path}
      className="group relative flex flex-col items-start gap-4 rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
    >
      <div className="rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="font-semibold text-lg font-sans mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}
