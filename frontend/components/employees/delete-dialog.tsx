'use client';

import { useDeleteEmployee } from '@/hooks/use-employees';
import type { Employee } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
}

export function DeleteDialog({ isOpen, onClose, employee }: DeleteDialogProps) {
  const deleteMutation = useDeleteEmployee();

  if (!employee) return null;

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(employee.id);
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden bg-surface-container border border-border shadow-2xl rounded-xl sm:max-w-md">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-surface-container-high flex flex-row items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <DialogTitle className="text-base font-bold tracking-tight text-foreground m-0">
            Delete Employee
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 space-y-4 bg-card">
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong className="text-primary font-semibold">{employee.name}</strong>?
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This action will permanently remove their profile, revoke all system access, and archive their associated compensation records. This action cannot be undone.
          </p>

          {/* Summary Card */}
          <div className="p-3.5 rounded-lg bg-surface-container-low border border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
              {getInitials(employee.name)}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-foreground truncate">{employee.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {employee.job_title} • {employee.department} Dept
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-surface-container-high flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-xs h-9 bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 gap-1.5"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete Employee
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
