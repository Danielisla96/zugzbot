"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Note } from "@/types";

interface NoteEditorProps {
  note?: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { id?: string; title: string; content: string }) => void;
}

export function NoteEditor({ note, isOpen, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: note?.id,
      title: title.trim(),
      content: content.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="tracking-tight">{note ? "Editar nota" : "Nueva nota"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input
            placeholder="Título de la nota"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold tracking-tight bg-transparent border-none outline-none w-full"
            autoFocus
          />
          <Textarea
            placeholder="Escribe tu nota aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="text-base bg-transparent border-none outline-none resize-none w-full min-h-[200px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!title.trim()} className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-active)] text-white">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
