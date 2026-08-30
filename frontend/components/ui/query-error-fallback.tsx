'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueryErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function QueryErrorFallback({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  isRetrying = false,
}: QueryErrorFallbackProps) {
  return (
    <div className="w-full p-6 rounded-xl border border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center text-center space-y-3">
      <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertCircle className="h-5 w-5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="text-xs h-8 gap-1.5 border-destructive/20 hover:bg-destructive/10 text-foreground"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          Retry Request
        </Button>
      )}
    </div>
  );
}
