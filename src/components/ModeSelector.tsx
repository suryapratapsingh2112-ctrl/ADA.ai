import { Code, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIMode } from '@/types/search';

interface ModeSelectorProps {
  mode: AIMode;
  onModeChange: (mode: AIMode) => void;
  className?: string;
}

const modes = [
  {
    id: 'research' as AIMode,
    label: 'Research',
    icon: Zap,
  },
  {
    id: 'code' as AIMode,
    label: 'code',
    icon: Code,
  },
];

export function ModeSelector({ mode, onModeChange, className }: ModeSelectorProps) {
  return (
    <div className={cn('flex items-center gap-0.5 p-0.5 rounded-lg bg-secondary/60', className)}>
      {modes.map((m) => {
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <m.icon className="w-3.5 h-3.5" />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
