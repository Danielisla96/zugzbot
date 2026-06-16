"use client";
import { useState, useEffect, useCallback } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "destructive";
  createdAt: number;
  action?: { label: string; onClick: () => void };
}

export type SortBy = "newest" | "oldest" | "a-z" | "favorites-first";

// Module-level shared state (singleton pattern)
let sharedToasts: Toast[] = [];
let sharedListeners: Array<() => void> = [];

function notifyListeners() {
  sharedListeners.forEach((fn) => fn());
}

export function useToast() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    sharedListeners.push(listener);
    return () => {
      sharedListeners = sharedListeners.filter((l) => l !== listener);
    };
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info", action?: { label: string; onClick: () => void }): string => {
      const id = crypto.randomUUID();
      sharedToasts = [...sharedToasts, { id, message, type, createdAt: Date.now(), action }];
      notifyListeners();
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    sharedToasts = sharedToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return { toasts: sharedToasts, addToast, removeToast };
}
