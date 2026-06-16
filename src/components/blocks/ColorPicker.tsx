"use client";
import { Slash } from "lucide-react";
import type { NoteColor } from "@/types";
import { NOTE_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";

const COLOR_OPTIONS: NoteColor[] = [
  "indigo",
  "orange",
  "green",
  "red",
  "purple",
  "gray",
  "none",
];

interface ColorPickerProps {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Selector de color">
      {COLOR_OPTIONS.map((color) => {
        const isSelected = value === color;
        const isNone = color === "none";

        return (
          <button
            key={color}
            type="button"
            data-color={isNone ? "none" : color}
            aria-label={NOTE_COLORS[color].label}
            onClick={() => onChange(color)}
            className={cn(
              "size-6 rounded-full flex items-center justify-center transition-all duration-200",
              isNone
                ? "border border-dashed border-border/50 hover:border-border"
                : "border border-white/10",
              isSelected && !isNone && "ring-2 ring-[#5e6ad2] ring-offset-2 ring-offset-background",
              isSelected && isNone && "ring-2 ring-[#5e6ad2] ring-offset-2 ring-offset-background"
            )}
            title={NOTE_COLORS[color].label}
          >
            {isNone ? (
              <Slash className="size-3.5 text-muted-foreground" />
            ) : (
              <span
                className={cn(
                  "size-4 rounded-full",
                  NOTE_COLORS[color].dot
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
