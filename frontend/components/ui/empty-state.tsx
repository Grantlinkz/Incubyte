'use client';

import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  actionLabel?: string;
}

export function EmptyState({
  title = 'No records found',
  description = 'No matching employees found for the currently selected filters. Try modifying your search criteria or resetting filters.',
  onReset,
  actionLabel = 'Reset All Filters',
}: EmptyStateProps) {
  return (
    <div className="py-16 px-6 flex flex-col items-center justify-center text-center space-y-4">
      <div className="h-14 w-14 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center border border-border">
        <SearchX className="h-7 w-7" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-xs h-8 shadow-xs hover:bg-muted/60"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
