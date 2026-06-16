interface NoteStatsProps {
  totalCount: number;
  filteredCount: number;
  searchActive: boolean;
}

export function NoteStats({
  totalCount,
  filteredCount,
  searchActive,
}: NoteStatsProps) {
  const notaLabel = totalCount === 1 ? "nota" : "notas";

  const text = searchActive
    ? `${filteredCount} de ${totalCount} ${notaLabel}`
    : `${totalCount} ${notaLabel}`;

  return (
    <span
      className="
        text-xs rounded-full px-2 py-0.5
        bg-[#f5f5f5] text-[#666666]
        dark:bg-[#2a2a2a] dark:text-[#888888]
      "
    >
      {text}
    </span>
  );
}
