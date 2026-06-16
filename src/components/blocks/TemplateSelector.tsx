"use client";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TEMPLATES } from "@/lib/templates";
import type { NoteTemplate } from "@/lib/templates";

interface TemplateSelectorProps {
  onSelectTemplate: (template: NoteTemplate) => void;
  onBlankNote?: () => void;
}

export function TemplateSelector({ onSelectTemplate, onBlankNote }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer rounded-[8px] border border-border/50 bg-white dark:bg-white/[0.02] p-4 transition-all duration-300 ease-out hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:scale-[0.99]"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="text-2xl mb-2">{template.emoji}</div>
            <div className="font-semibold tracking-tight text-sm">{template.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{template.description}</div>
          </Card>
        ))}
      </div>
      <Button
        variant="ghost"
        className="w-full text-sm text-muted-foreground hover:text-foreground"
        onClick={onBlankNote}
      >
        <FileText className="size-4 mr-2" />
        Nota en blanco
      </Button>
    </div>
  );
}
