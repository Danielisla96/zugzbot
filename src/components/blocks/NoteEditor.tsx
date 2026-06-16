"use client";
import { useState, useEffect } from "react";
import { Eye, Edit } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note } from "@/types";
import { TemplateSelector } from "@/components/blocks/TemplateSelector";
import { MarkdownRenderer } from "@/components/blocks/MarkdownRenderer";
import type { NoteTemplate } from "@/lib/templates";

interface NoteEditorProps {
  note?: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { id?: string; title: string; content: string }) => void;
}

export function NoteEditor({ note, isOpen, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setShowTemplateSelector(false);
      setShowPreview(false);
    } else {
      setTitle("");
      setContent("");
      setShowTemplateSelector(true);
      setShowPreview(false);
    }
  }, [note, isOpen]);

  const handleSelectTemplate = (template: NoteTemplate) => {
    setTitle(template.title);
    setContent(template.content);
    setShowTemplateSelector(false);
  };

  const handleBlankNote = () => {
    setShowTemplateSelector(false);
  };

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

        {/* Template Selector — above the form, for new notes */}
        {isOpen && note === null && showTemplateSelector && (
          <div className="py-2">
            <TemplateSelector
              onSelectTemplate={handleSelectTemplate}
              onBlankNote={handleBlankNote}
            />
          </div>
        )}

        {/* Editor — always visible */}
        <div className="space-y-4 py-2">
          <Input
            placeholder="Título de la nota"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold tracking-tight bg-transparent border-none outline-none w-full"
            autoFocus
          />
          {showPreview ? (
            <ScrollArea className="h-[200px] w-full rounded-md border p-4" data-preview-active>
              <MarkdownRenderer content={content} />
            </ScrollArea>
          ) : (
            <Textarea
              placeholder="Escribe tu nota aquí..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="text-base bg-transparent border-none outline-none resize-none w-full min-h-[200px]"
            />
          )}
        </div>

        {/* Footer — always visible */}
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)} data-preview-toggle>
            {showPreview ? <Edit className="size-4 mr-2" /> : <Eye className="size-4 mr-2" />}
            {showPreview ? "Editar" : "Preview"}
          </Button>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!title.trim()} className="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-active)] text-white">
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
