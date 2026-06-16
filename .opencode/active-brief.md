# Active Brief: keyboard-shortcuts-quick-actions (Iteration 3/3)

## Project
- Zugzbot-v2: Notes app (Next.js 16 + Shadcn UI + Tailwind v4 + localStorage)
- Path: `/Users/wavesbyte/Documents/Repositorio Personal/zugzbot-v2`
- Design: Linear.app (tokens already applied)
- Current tests: 71 passing
- Verification mode: console

## What to build
**Hook `useKeyboardShortcuts`** at `src/hooks/useKeyboardShortcuts.ts`

### Interface
```typescript
interface KeyboardShortcutHandlers {
  onCreateNew: () => void;
  onCloseEditor: () => void;
  onDeleteNote: () => void;       // deletes active note (needs activeNoteId)
  onSearchFocus: () => void;
}

function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers, 
  isEditorOpen: boolean,
  activeNoteId: string | null
): void
```

### Shortcuts
- `n` (no input focus) → `handlers.onCreateNew()`
- `Escape` (editor open) → `handlers.onCloseEditor()`
- `Delete` (editor open, no input focus) → `handlers.onDeleteNote()`
- `Cmd+F`/`Ctrl+F` → `handlers.onSearchFocus()`, `event.preventDefault()`

### Edge cases
- Skip if `event.target` is `input`, `textarea`, or `[contenteditable]`
- Skip Escape/Delete if `isEditorOpen === false`
- For Delete: needs `activeNoteId` — if null, no-op
- Platform detection: `navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey`
- Cleanup: `useEffect` return removes `keydown` listener

### File to modify
- **Create**: `src/hooks/useKeyboardShortcuts.ts` (the hook)
- **Modify**: `src/app/page.tsx` (integrate hook in Home component)
- **Test file already exists**: `src/__tests__/useKeyboardShortcuts.test.ts` (6 tests, written by spec-writer)

### Shadcn components
- None needed (all already installed)

### Lucide icons
- None needed

## Contract path
`.openspec/specs/2026-06-16__00-35-00_keyboard-shortcuts-quick-actions/contract.json`
