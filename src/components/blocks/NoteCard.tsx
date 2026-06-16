"use client";
import { Star, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "@/types";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete, onToggleFavorite }: NoteCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <Card
      className="group cursor-pointer transition-shadow p-4 border border-border/50 rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_2px_rgba(0,0,0,0.04)]"
      onClick={() => onEdit(note)}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-lg tracking-tight line-clamp-2 flex-1">{note.title || "Sin título"}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => onToggleFavorite(note.id)}>
            <Star className={`size-4 ${note.favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => onDelete(note.id)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
        {note.content || "Sin contenido"}
      </p>
      <p className="text-xs text-muted-foreground/60 mt-3">{formatDate(note.updatedAt)}</p>
    </Card>
  );
}
