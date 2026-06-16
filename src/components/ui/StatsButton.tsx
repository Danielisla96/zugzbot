"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Estadísticas" />
        }
      >
        <BarChart3 className="h-[18px] w-[18px]" />
      </DialogTrigger>
      <DialogContent className="max-w-[800px] sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Estadísticas
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <StatsDashboard notes={notes} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
