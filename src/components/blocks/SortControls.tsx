"use client";
import { ArrowUpDown, Calendar, ArrowUpAZ, Star } from "lucide-react";
import type { SortBy } from "@/hooks/useToast";

interface SortControlsProps {
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

interface SortOption {
  value: SortBy;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const options: SortOption[] = [
  { value: "newest", label: "Más recientes", Icon: ArrowUpDown },
  { value: "oldest", label: "Más antiguas", Icon: Calendar },
  { value: "a-z", label: "A-Z", Icon: ArrowUpAZ },
  { value: "favorites-first", label: "Favoritos", Icon: Star },
];

export function SortControls({ sortBy, onSortChange }: SortControlsProps) {
  return (
    <div className="flex flex-row gap-1.5">
      {options.map(({ value, label, Icon }) => {
        const isActive = sortBy === value;
        return (
          <button
            key={value}
            onClick={() => onSortChange(value)}
            className={`
              inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full
              transition-colors duration-150
              ${
                isActive
                  ? "bg-[#171717] text-white dark:bg-white dark:text-black"
                  : "bg-transparent text-muted-foreground hover:bg-accent shadow-border"
              }
            `}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
