"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Toast } from "@/hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const iconMap = {
  success: CheckCircle2,
  info: Info,
  destructive: XCircle,
} as const;

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 150);
    }, 3000);
    return () => clearTimeout(dismissTimer);
  }, [toast.id, onRemove]);

  const Icon = iconMap[toast.type];

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 150);
  };

  return (
    <div
      className={`
        flex items-center gap-2 p-3 rounded-[6px] shadow-card text-white
        bg-[#171717] dark:bg-[#2a2a2a]
        transition-all duration-150 ease-in
        ${
          exiting
            ? "opacity-0 translate-y-0 -translate-y-2"
            : "opacity-100 translate-y-0"
        }
      `}
      style={{
        animation: !exiting
          ? "toast-enter 200ms cubic-bezier(0.2, 0.6, 0.25, 1) both"
          : undefined,
      }}
    >
      <Icon className="size-4 shrink-0" />
      <span className="text-sm flex-1">{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => { toast.action!.onClick(); handleDismiss(); }}
          className="text-xs font-medium underline underline-offset-2 hover:text-white/80 shrink-0 ml-auto"
        >
          {toast.action.label}
        </button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-5 text-white/70 hover:text-white hover:bg-white/10"
        onClick={handleDismiss}
      >
        <X className="size-3" />
      </Button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
