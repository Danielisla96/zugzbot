export type NoteColor = "indigo" | "orange" | "green" | "red" | "purple" | "gray" | "none";

export interface Note {
  id: string;
  title: string;
  content: string;
  favorite: boolean;
  pinned?: boolean;
  color?: NoteColor;
  createdAt: string;
  updatedAt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "destructive";
  createdAt: number;
}

export type SortBy = "newest" | "oldest" | "a-z" | "favorites-first";
