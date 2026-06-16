import type { Note, NoteColor } from "@/types";
import { countWords } from "@/lib/countWords";
import { extractHashtags } from "@/lib/extractHashtags";

export interface NoteStats {
  totalNotes: number;
  totalWords: number;
  totalChars: number;
  favoritedCount: number;
  favoritedPercent: number;
  pinnedCount: number;
  colorDistribution: Record<NoteColor, number>;
  topHashtags: Array<{ tag: string; count: number }>;
  createdToday: number;
  createdThisWeek: number;
  notesLast7Days: Array<{ date: string; dayLabel: string; count: number }>;
  averageWordsPerNote: number;
  completionRate: number;
  recentNotes: Note[];
}

export { extractHashtags };

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return d >= startOfWeek;
}

function getLast7Days(
  notes: Note[]
): Array<{ date: string; dayLabel: string; count: number }> {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("es-ES", { weekday: "short" });
    const count = notes.filter((n) => n.createdAt.startsWith(dateStr)).length;
    result.push({
      date: dateStr,
      dayLabel:
        dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
      count,
    });
  }
  return result;
}

export function computeStats(notes: Note[]): NoteStats {
  const totalNotes = notes.length;
  const totalWords = notes.reduce((sum, n) => sum + countWords(n.content), 0);
  const totalChars = notes.reduce((sum, n) => sum + n.content.length, 0);
  const favoritedCount = notes.filter((n) => n.favorite).length;
  const pinnedCount = notes.filter((n) => n.pinned).length;

  const colorKeys: NoteColor[] = [
    "none",
    "indigo",
    "orange",
    "green",
    "red",
    "purple",
    "gray",
  ];
  const colorDistribution = Object.fromEntries(
    colorKeys.map((c) => [
      c,
      notes.filter((n) => (n.color || "none") === c).length,
    ])
  ) as Record<NoteColor, number>;

  const hashtagCounts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of extractHashtags(note.content)) {
      hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
    }
  }
  const topHashtags = [...hashtagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag: `#${tag}`, count }));

  const days = getLast7Days(notes);
  const avgWords =
    totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;
  const completion =
    totalNotes > 0
      ? Math.round(
          (notes.filter((n) => n.content.length > 50).length / totalNotes) * 100
        )
      : 0;
  const recent = [...notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return {
    totalNotes,
    totalWords,
    totalChars,
    favoritedCount,
    favoritedPercent:
      totalNotes > 0 ? Math.round((favoritedCount / totalNotes) * 100) : 0,
    pinnedCount,
    colorDistribution,
    topHashtags,
    createdToday: notes.filter((n) => isToday(n.createdAt)).length,
    createdThisWeek: notes.filter((n) => isThisWeek(n.createdAt)).length,
    notesLast7Days: days,
    averageWordsPerNote: avgWords,
    completionRate: completion,
    recentNotes: recent,
  };
}

export { isToday, isThisWeek };
