"use client";
import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatsDashboard } from "@/components/blocks/StatsDashboard";
import type { Note } from "@/types";

interface StatsButtonProps {
  notes: Note[];
}

export function StatsButton({ notes }: StatsButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Estadísticas"
          />
        }
      >
        <BarChart3 className="h-[18px] w-[18px]" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl lg:max-w-6xl max-h-[85vh] overflow-y-auto p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Estadísticas
          </DialogTitle>
          <DialogDescription>
            Resumen de tu actividad
          </DialogDescription>
        </DialogHeader>
        <StatsDashboard notes={notes} />
      </DialogContent>
    </Dialog>
  );
}
