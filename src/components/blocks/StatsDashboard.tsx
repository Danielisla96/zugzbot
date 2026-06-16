"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  AlignLeft,
  Type,
  Star,
  Pin,
  Calendar,
  TrendingUp,
  Sparkles,
  PieChart,
  BarChart3,
  Activity,
  Hash,
  Clock,
} from "lucide-react";
import { computeStats } from "@/lib/stats";
import { NOTE_COLORS } from "@/lib/colors";
import { formatRelativeDate } from "@/lib/formatRelativeDate";
import { DonutChart } from "@/components/blocks/DonutChart";
import type { Note, NoteColor } from "@/types";

interface StatsDashboardProps {
  notes: Note[];
}

const colorLabels: Record<string, string> = {
  none: "Sin color",
  indigo: "Índigo",
  orange: "Naranja",
  green: "Verde",
  red: "Rojo",
  purple: "Púrpura",
  gray: "Gris",
};

const MAX_BAR_HEIGHT = 80;

export function StatsDashboard({ notes }: StatsDashboardProps) {
  const stats = useMemo(() => computeStats(notes), [notes]);

  const maxDayCount = Math.max(
    ...stats.notesLast7Days.map((d) => d.count),
    1
  );

  // View mode state: donut chart or bar chart for color distribution
  const [viewMode, setViewMode] = useState<"donut" | "bars">("bars");

  // Hover states for tooltips
  const [hoveredColorIndex, setHoveredColorIndex] = useState<number | null>(null);
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [hoveredTimelineIndex, setHoveredTimelineIndex] = useState<number | null>(null);

  // Progressive section loading
  const [visibleSections, setVisibleSections] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setVisibleSections(1), 50);
    const t2 = setTimeout(() => setVisibleSections(2), 350);
    const t3 = setTimeout(() => setVisibleSections(3), 650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Build color entries array for mapping with indices
  const colorEntries = Object.entries(stats.colorDistribution).filter(
    ([, count]) => count > 0
  );

  // Format date for weekly tooltip
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        style={{
          animation: visibleSections >= 1
            ? "none"
            : "fadeSlideUp 0.4s ease-out forwards",
        }}
      >
        <MetricCard
          icon={FileText}
          value={stats.totalNotes}
          label="Total Notas"
          index={0}
        />
        <MetricCard
          icon={AlignLeft}
          value={stats.totalWords}
          label="Palabras"
          index={1}
        />
        <MetricCard
          icon={Type}
          value={stats.totalChars}
          label="Caracteres"
          index={2}
        />
        <MetricCard
          icon={Star}
          value={stats.favoritedCount}
          label="Favoritas"
          index={3}
        />
        <MetricCard
          icon={Pin}
          value={stats.pinnedCount}
          label="Fijadas"
          index={4}
        />
        <MetricCard
          icon={Calendar}
          value={stats.createdToday}
          label="Hoy"
          index={5}
        />
        <MetricCard
          icon={TrendingUp}
          value={stats.createdThisWeek}
          label="Esta Semana"
          index={6}
        />
        <MetricCard
          icon={Sparkles}
          value={`${stats.favoritedPercent}%`}
          label="% Favoritos"
          index={7}
        />
      </div>

      {/* Charts Row: Color + Weekly */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        style={{
          animation:
            visibleSections >= 2
              ? "fadeSlideUp 0.4s ease-out forwards"
              : "none",
          opacity: visibleSections >= 2 ? 1 : 0,
        }}
      >
        {/* Color Distribution */}
        <div className="rounded-lg border border-border/50 bg-muted/20 p-5 transition-all duration-200 ease-out hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Colores
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setViewMode(viewMode === "donut" ? "bars" : "donut")
              }
              className="inline-flex items-center justify-center rounded-md border border-border/50 bg-transparent px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors duration-150"
              aria-label={
                viewMode === "donut"
                  ? "Cambiar a vista de barras"
                  : "Cambiar a vista de donut"
              }
            >
              {viewMode === "donut" ? (
                <BarChart3 className="h-3.5 w-3.5" />
              ) : (
                <PieChart className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {viewMode === "donut" ? (
            <DonutChart
              colorDistribution={stats.colorDistribution}
              totalNotes={stats.totalNotes}
              onToggle={() => setViewMode("bars")}
              showDonut={true}
            />
          ) : (
            <div className="space-y-2.5">
              {colorEntries.map(([color, count], idx) => {
                const percent =
                  stats.totalNotes > 0
                    ? Math.round((count / stats.totalNotes) * 100)
                    : 0;
                return (
                  <div
                    key={color}
                    className="flex items-center gap-2 relative"
                    onMouseEnter={() => setHoveredColorIndex(idx)}
                    onMouseLeave={() => setHoveredColorIndex(null)}
                  >
                    <span className="text-xs text-muted-foreground w-16 truncate">
                      {colorLabels[color] || color}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                          width: `${percent}%`,
                          backgroundColor:
                            NOTE_COLORS[color as keyof typeof NOTE_COLORS]
                              ?.hex || "var(--color-pinned-accent)",
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                      {count}
                    </span>

                    {/* Tooltip for color bar */}
                    {hoveredColorIndex === idx && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border rounded-md shadow-md px-2.5 py-1.5 text-xs z-50 pointer-events-none whitespace-nowrap">
                        {colorLabels[color] || color}: {count} (
                        {percent}%)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly Activity */}
        <div className="rounded-lg border border-border/50 bg-muted/20 p-5 transition-all duration-200 ease-out hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actividad Semanal
            </span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {stats.notesLast7Days.map((day, idx) => {
              const barHeight =
                day.count > 0
                  ? Math.max(
                      4,
                      (day.count / maxDayCount) * MAX_BAR_HEIGHT
                    )
                  : 4;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1 relative"
                  onMouseEnter={() => setHoveredDayIndex(idx)}
                  onMouseLeave={() => setHoveredDayIndex(null)}
                >
                  <span className="text-[10px] text-muted-foreground tabular-nums leading-none">
                    {day.count}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-200"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: "var(--color-pinned-accent)",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground leading-none mt-auto pt-1">
                    {day.dayLabel}
                  </span>

                  {/* Tooltip for weekly bar */}
                  {hoveredDayIndex === idx && day.count > 0 && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground border border-border rounded-md shadow-md px-2.5 py-1.5 text-xs z-50 pointer-events-none whitespace-nowrap">
                      {day.dayLabel} {formatDate(day.date)} — {day.count}{" "}
                      nota{day.count !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Hashtags + Recent Notes */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        style={{
          animation:
            visibleSections >= 3
              ? "fadeSlideUp 0.4s ease-out forwards"
              : "none",
          opacity: visibleSections >= 3 ? 1 : 0,
        }}
      >
        {/* Top Hashtags */}
        <div className="rounded-lg border border-border/50 bg-muted/20 p-5 transition-all duration-200 ease-out hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Top Hashtags
            </span>
          </div>
          {stats.topHashtags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {stats.topHashtags.map(({ tag, count }) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-foreground"
                >
                  {tag}
                  <span className="text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Ningún hashtag encontrado
            </p>
          )}
        </div>

        {/* Recent Notes Timeline */}
        <div className="lg:col-span-2 rounded-lg border border-border/50 bg-muted/20 p-5 transition-all duration-200 ease-out hover:shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Notas Recientes
            </span>
          </div>
          {stats.recentNotes.length > 0 ? (
            <div className="space-y-2">
              {stats.recentNotes.map((note, idx) => (
                <div
                  key={note.id}
                  className="flex items-center gap-3 py-1.5 hover:bg-muted/30 rounded transition-colors duration-150 p-2 relative"
                  onMouseEnter={() => setHoveredTimelineIndex(idx)}
                  onMouseLeave={() => setHoveredTimelineIndex(null)}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        NOTE_COLORS[note.color || "none"]?.hex ||
                        "transparent",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate text-foreground">
                      {note.title || "Sin título"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(note.updatedAt)}
                    </p>
                  </div>
                  {note.favorite && (
                    <Star className="h-3 w-3 text-amber-500 shrink-0 fill-amber-500" />
                  )}

                  {/* Tooltip for timeline item */}
                  {hoveredTimelineIndex === idx && (
                    <div className="absolute -top-10 left-4 bg-popover text-popover-foreground border border-border rounded-md shadow-md px-2.5 py-1.5 text-xs z-50 pointer-events-none whitespace-normal max-w-[200px]">
                      {note.content.length > 80
                        ? note.content.substring(0, 80) + "…"
                        : note.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Ninguna nota reciente
            </p>
          )}
        </div>
      </div>

      {/* Extra stats summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Promedio palabras" value={stats.averageWordsPerNote} />
        <MiniStat
          label="Tasa completitud"
          value={`${stats.completionRate}%`}
        />
        <MiniStat label="Total favoritas" value={stats.favoritedCount} />
        <MiniStat label="Total fijadas" value={stats.pinnedCount} />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
  index = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  index?: number;
}) {
  return (
    <div
      className="rounded-lg border border-border/50 bg-muted/20 p-4 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[1px]"
      style={{
        animation: "fadeSlideUp 0.3s ease-out forwards",
        animationDelay: `${index * 50}ms`,
      }}
    >
      <Icon className="h-4 w-4 text-muted-foreground mb-2" />
      <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1 transition-all">
        {label}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3 transition-all duration-200 ease-out">
      <div className="text-sm font-medium text-foreground tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
