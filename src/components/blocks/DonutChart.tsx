"use client";

import { useMemo } from "react";
import { NOTE_COLORS } from "@/lib/colors";
import type { NoteColor } from "@/types";

interface DonutChartProps {
  colorDistribution: Record<NoteColor, number>;
  totalNotes: number;
  onToggle: () => void;
  showDonut: boolean;
}

export function DonutChart({
  colorDistribution,
  totalNotes,
  onToggle,
  showDonut,
}: DonutChartProps) {
  const { segments, totalWithColor } = useMemo(() => {
    const colorKeys = Object.keys(colorDistribution) as NoteColor[];
    const segs: { color: string; degrees: number }[] = [];
    let totalColored = 0;

    // Sum notes that have a color assigned (exclude "none")
    for (const key of colorKeys) {
      const count = colorDistribution[key];
      if (key !== "none" && count > 0) {
        totalColored += count;
      }
    }

    // Build segments with their angular proportions
    for (const key of colorKeys) {
      const count = colorDistribution[key];
      if (key !== "none" && count > 0) {
        const degrees = totalColored > 0 ? (count / totalColored) * 360 : 0;
        segs.push({
          color: NOTE_COLORS[key]?.hex || "#888",
          degrees,
        });
      }
    }

    return { segments: segs, totalWithColor: totalColored };
  }, [colorDistribution]);

  if (!showDonut) return null;

  // Build conic-gradient string
  const gradientParts: string[] = [];
  let currentAngle = 0;

  for (const seg of segments) {
    if (seg.degrees <= 0) continue;
    const startAngle = currentAngle;
    const endAngle = currentAngle + seg.degrees;
    gradientParts.push(`${seg.color} ${startAngle}deg ${endAngle}deg`);
    currentAngle = endAngle;
  }

  if (gradientParts.length === 0) {
    gradientParts.push("transparent 0deg 360deg");
  }

  const gradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="flex items-center justify-center py-2">
      <div className="relative w-32 h-32">
        <div
          data-donut-chart
          className="w-full h-full rounded-full"
          style={{ background: gradient }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center">
            <span className="text-lg font-semibold tabular-nums text-foreground">
              {totalWithColor}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
