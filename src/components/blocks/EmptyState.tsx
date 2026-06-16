"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
      <FileText className="size-16 md:size-20 text-muted-foreground/40 mb-6" />
      <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
        No hay notas aún
      </h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        Crea tu primera nota para empezar
      </p>
      <Button onClick={onCreateNew}>
        Crear nota
      </Button>
    </div>
  );
}
