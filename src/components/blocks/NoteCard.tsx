"use client";
import { useState } from "react";
import { Pin, Star, Trash2, Clock, FileText, Hash, Tag, Eye, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Note } from "@/types";
import { formatRelativeDate } from "@/lib/formatRelativeDate";
import { extractHashtags } from "@/lib/extractHashtags";
import { countWords } from "@/lib/countWords";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/blocks/MarkdownRenderer";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin?: (id: string) => void;
  style?: React.CSSProperties;
}

export function NoteCard({ note, onEdit, onDelete, onToggleFavorite, onTogglePin, style }: NoteCardProps) {
  const [showMarkdown, setShowMarkdown] = useState(false);
  const hashtags = extractHashtags(note.content);
  const wordCount = countWords(note.content);
  const charCount = note.content.length;

  return (
    <Card
      data-pinned={note.pinned ? "true" : undefined}
      className={cn(
        "group cursor-pointer rounded-[8px] border border-border/50 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-4 transition-all duration-300 ease-out hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-[2px] active:scale-[0.99]",
        note.pinned && "border-l-[3px] shadow-[0_0_0_1px_rgba(94,106,210,0.15)]"
      )}
      style={style}
      onClick={() => onEdit(note)}
    >
      {/* Header: title + always-visible actions */}
      <div className="flex items-start justify-between gap-2">
        <h3
          className={cn(
            "flex-1 text-base font-semibold tracking-tight line-clamp-2",
            !note.title && "italic text-muted-foreground"
          )}
        >
          {note.title || "Sin título"}
        </h3>

        {/* Actions: Pin + Star + Trash (always visible) */}
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {onTogglePin && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Fijar nota"
              onClick={() => onTogglePin(note.id)}
            >
              <Pin
                className={cn(
                  "size-4 transition-all duration-200 hover:scale-110",
                  note.pinned
                    ? "fill-[var(--color-pinned-accent)] text-[var(--color-pinned-accent)] rotate-[-45deg]"
                    : "text-muted-foreground"
                )}
              />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Marcar como favorito"
            onClick={() => onToggleFavorite(note.id)}
          >
            <Star
              className={cn(
                "size-4 transition-all duration-200 hover:scale-110",
                note.favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive"
            aria-label="Eliminar nota"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content preview + hashtags */}
      {note.content ? (
        <div className="mt-2" data-raw-toggle>
          {showMarkdown ? (
            <div className="prose prose-sm max-w-none dark:prose-invert" data-md-visible>
              <MarkdownRenderer content={note.content} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground line-clamp-3" data-raw-visible>
              {note.content}
            </p>
          )}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border/30 text-xs font-medium text-muted-foreground bg-transparent"
                >
                  <Tag className="size-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic mt-2">Sin contenido</p>
      )}

      {/* Metadata bar: date, word count, char count, markdown toggle */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatRelativeDate(note.updatedAt)}
        </span>
        <span className="text-muted-foreground/30">·</span>
        <span className="inline-flex items-center gap-1">
          <FileText className="size-3.5" />
          {wordCount}
        </span>
        <span className="text-muted-foreground/30">·</span>
        <span className="inline-flex items-center gap-1">
          <Hash className="size-3.5" />
          {charCount}
        </span>
        <span className="text-muted-foreground/30">·</span>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMarkdown(!showMarkdown); }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showMarkdown ? "Ver texto" : "Vista previa"}
          data-raw-toggle
        >
          {showMarkdown ? <Edit className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </div>
    </Card>
  );
}
