import type { NoteColor } from "@/types";

export const NOTE_COLORS: Record<
  NoteColor,
  { label: string; dot: string; lightBg: string; hex: string }
> = {
  indigo: {
    label: "Indigo",
    dot: "bg-[#5e6ad2]",
    lightBg: "bg-[#5e6ad2]/5",
    hex: "#5e6ad2",
  },
  orange: {
    label: "Orange",
    dot: "bg-[#f59e0b]",
    lightBg: "bg-[#f59e0b]/5",
    hex: "#f59e0b",
  },
  green: {
    label: "Green",
    dot: "bg-[#22c55e]",
    lightBg: "bg-[#22c55e]/5",
    hex: "#22c55e",
  },
  red: {
    label: "Red",
    dot: "bg-[#ef4444]",
    lightBg: "bg-[#ef4444]/5",
    hex: "#ef4444",
  },
  purple: {
    label: "Purple",
    dot: "bg-[#a855f7]",
    lightBg: "bg-[#a855f7]/5",
    hex: "#a855f7",
  },
  gray: {
    label: "Gray",
    dot: "bg-[#6b7280]",
    lightBg: "bg-[#6b7280]/5",
    hex: "#6b7280",
  },
  none: {
    label: "Sin color",
    dot: "",
    lightBg: "",
    hex: "",
  },
};
