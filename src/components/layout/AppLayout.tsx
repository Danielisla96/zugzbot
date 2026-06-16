import { ThemeToggle } from "@/components/blocks/ThemeToggle";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4 border-b border-border/50">
        <h1 className="font-bold text-xl md:text-2xl tracking-tight text-foreground">
          NOTAS
        </h1>
        <ThemeToggle />
      </header>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
