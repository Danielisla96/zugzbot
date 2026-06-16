"use client";

import { useMemo } from "react";
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
  Activity,
  Hash,
  Clock,
} from "lucide-react";
import { computeStats } from "@/lib/stats";
import { NOTE_COLORS } from "@/lib/colors";
import { formatRelativeDate } from "@/lib/formatRelativeDate";
import type { Note } from "@/types";

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

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={FileText}
          value={stats.totalNotes}
          label="Total Notas"
        />
        <MetricCard
          icon={AlignLeft}
          value={stats.totalWords}
          label="Palabras"
        />
        <MetricCard
          icon={Type}
          value={stats.totalChars}
          label="Caracteres"
        />
        <MetricCard
          icon={Star}
          value={stats.favoritedCount}
          label="Favoritas"
        />
        <MetricCard
          icon={Pin}
          value={stats.pinnedCount}
          label="Fijadas"
        />
        <MetricCard
          icon={Calendar}
          value={stats.createdToday}
          label="Hoy"
        />
        <MetricCard
          icon={TrendingUp}
          value={stats.createdThisWeek}
          label="Esta Semana"
        />
        <MetricCard
          icon={Sparkles}
          value={`${stats.favoritedPercent}%`}
          label="% Favoritos"
        />
      </div>

      {/* Charts Row: Color + Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Distribution */}
        <div className="rounded-lg border border-border/50 bg-muted/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Colores
            </span>
          </div>
          <div className="space-y-2.5">
            {Object.entries(stats.colorDistribution).map(
              ([color, count]) => {
                const percent =
                  stats.totalNotes > 0
                    ? Math.round((count / stats.totalNotes) * 100)
                    : 0;
                if (count === 0) return null;
                return (
                  <div key={color} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16 truncate">
                      {colorLabels[color] || color}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
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
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="rounded-lg border border-border/50 bg-muted/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actividad Semanal
            </span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {stats.notesLast7Days.map((day) => {
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
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] text-muted-foreground tabular-nums leading-none">
                    {day.count}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${barHeight}px`,
                      backgroundColor: "var(--color-pinned-accent)",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground leading-none mt-auto pt-1">
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Hashtags + Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Hashtags */}
        <div className="rounded-lg border border-border/50 bg-muted/20 p-5">
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
        <div className="lg:col-span-2 rounded-lg border border-border/50 bg-muted/20 p-5">
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
                  className="flex items-center gap-3 py-1.5"
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
      <Icon className="h-4 w-4 text-muted-foreground mb-2" />
      <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
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
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
      <div className="text-sm font-medium text-foreground tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}
