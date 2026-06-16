"use client";

import { useMemo } from "react";
import {
  FileText,
  AlignLeft,
  Type,
  Star,
  Pin,
  PieChart,
  Hash,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { computeStats } from "@/lib/stats";
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

const colorBarClass: Record<string, string> = {
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  gray: "bg-gray-500",
};

export function StatsDashboard({ notes }: StatsDashboardProps) {
  const stats = useMemo(() => computeStats(notes), [notes]);

  const simpleCards = [
    { icon: FileText, value: stats.totalNotes, label: "Total notas" },
    { icon: AlignLeft, value: stats.totalWords, label: "Total palabras" },
    { icon: Type, value: stats.totalChars, label: "Total caracteres" },
    {
      icon: Star,
      value: `${stats.favoritedCount} (${stats.favoritedPercent}%)`,
      label: "Favoritas",
    },
    { icon: Pin, value: stats.pinnedCount, label: "Fijadas" },
    { icon: Calendar, value: stats.createdToday, label: "Creadas hoy" },
    { icon: TrendingUp, value: stats.createdThisWeek, label: "Esta semana" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {simpleCards.map(({ icon: Icon, value, label }) => (
        <div
          key={label}
          className="rounded-lg border border-border/50 bg-muted/20 p-4"
        >
          <Icon className="h-4 w-4 text-muted-foreground mb-2" />
          <div className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      ))}

      {/* Color Distribution Card */}
      <div
        className="rounded-lg border border-border/50 bg-muted/20 p-4 col-span-2"
      >
        <PieChart className="h-4 w-4 text-muted-foreground mb-2" />
        <div className="text-xs text-muted-foreground mb-3">
          Distribución de colores
        </div>
        <div className="space-y-2">
          {Object.entries(stats.colorDistribution).map(([color, count]) => {
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
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      colorBarClass[color] || "bg-primary"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hashtags Card */}
      <div
        className="rounded-lg border p-4"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.02)",
        }}
      >
        <Hash className="h-4 w-4 text-[#8a8f98] mb-2" />
        <div className="text-xs text-[#8a8f98] mb-3">Top hashtags</div>
        <div className="flex flex-wrap gap-1">
          {stats.topHashtags.length > 0
            ? stats.topHashtags.map(({ tag, count }) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-[#2a2a2a] px-2 py-0.5 text-xs text-[#e4e4e7]"
                >
                  {tag}
                  <span className="text-[#8a8f98] tabular-nums">{count}</span>
                </span>
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
