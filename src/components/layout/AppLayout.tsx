import { ThemeToggle } from "@/components/blocks/ThemeToggle";
import { NoteStats } from "@/components/blocks/NoteStats";
import { StatsButton } from "@/components/ui/StatsButton";
import { ToastContainer } from "@/components/blocks/ToastContainer";
import type { Toast } from "@/types";
import type { Note } from "@/types";

interface AppLayoutProps {
  children: React.ReactNode;
  notes?: Note[];
  notesCount?: number;
  filteredNotesCount?: number;
  searchActive?: boolean;
  toasts?: Toast[];
  onRemoveToast?: (id: string) => void;
}

export function AppLayout({
  children,
  notes = [],
  notesCount = 0,
  filteredNotesCount = 0,
  searchActive = false,
  toasts,
  onRemoveToast,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-xl md:text-2xl tracking-tight text-foreground">
            NOTAS
          </h1>
          <NoteStats
            totalCount={notesCount}
            filteredCount={filteredNotesCount}
            searchActive={searchActive}
          />
        </div>
        <div className="flex items-center gap-1">
          <StatsButton notes={notes} />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
      {toasts !== undefined && onRemoveToast && (
        <ToastContainer toasts={toasts} onRemove={onRemoveToast} />
      )}
    </div>
  );
}
