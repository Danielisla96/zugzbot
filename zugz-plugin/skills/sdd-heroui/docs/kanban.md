# Kanban

Copy MarkdownA drag-and-drop kanban board with columns, cards, and keyboard navigation for organizing tasks and workflows.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Kanban component and access all parts using dot notation.



```tsx
import {Kanban} from "@heroui-pro/react";

<Kanban>
  <Kanban.Column>
    <Kanban.ColumnHeader>
      <Kanban.ColumnIndicator />
      <Kanban.ColumnTitle />
      <Kanban.ColumnCount />
      <Kanban.ColumnActions />
    </Kanban.ColumnHeader>
    <Kanban.ColumnBody>
      <Kanban.ScrollShadow>
        <Kanban.CardList>
          <Kanban.Card />
        </Kanban.CardList>
      </Kanban.ScrollShadow>
    </Kanban.ColumnBody>
  </Kanban.Column>
  <Kanban.DropIndicator />
</Kanban>
```


## Notion Board

MobileTabletDesktop

## Project Board

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.kanban` — Root board container. CSS grid with horizontal auto-flow and snap scrolling.

- `.kanban--sm` — Small size. Narrower columns (`240px`), tighter gap (`12px`).

- `.kanban--md` — Medium size (default). Standard columns (`280px`), default gap (`16px`).

- `.kanban--lg` — Large size. Wider columns (`320px`), spacious gap (`20px`).


### Element Classes



- `.kanban__column` — Individual column section. Flex column with snap-center alignment.

- `.kanban__column-body` — Visual container for card list and add button. Rounded with `bg-default/40`.

- `.kanban__column-header` — Header area with indicator, title, count, and action buttons.

- `.kanban__column-actions` — Hover-reveal action buttons inside the header. Fades in on column header hover.

- `.kanban__column-indicator` — Colored status dot (when empty) or icon container (when children are provided).

- `.kanban__column-title` — Column heading text (`text-sm font-semibold`).

- `.kanban__column-count` — Item count badge (`text-xs text-muted`).

- `.kanban__card` — Outer card wrapper (RAC `GridListItem`). Handles focus ring, cursor, and drag opacity.

- `.kanban__card--sm` — Small card variant.

- `.kanban__card--md` — Medium card variant.

- `.kanban__card--lg` — Large card variant.

- `.kanban__card-content` — Inner motion wrapper. Carries background (`bg-overlay`), rounded corners, shadow, and flex layout.

- `.kanban__card-content--sm` — Small card content (`gap-1.5 p-2 text-xs`).

- `.kanban__card-content--md` — Medium card content (`gap-2 p-3 text-sm`). Default.

- `.kanban__card-content--lg` — Large card content (`gap-3 p-4 text-base`).

- `.kanban__card-list` — Scrollable GridList container with vertical gap between cards.

- `.kanban__scroll-shadow` — Optional ScrollShadow wrapper for constrained, scrollable columns.

- `.kanban__drop-indicator` — Custom drop indicator with animated height via `--kanban-drop-height`.

- `.kanban__drag-handle` — Grip button, screen-reader-only by default. Reveals on focus.

- `.kanban__empty` — Empty state placeholder centered inside an empty column.


### Interactive States



- Hover: `.kanban__card:hover > .kanban__card-content` — applies `shadow-sm`.

- Selected: `.kanban__card[data-selected="true"] > .kanban__card-content` — applies `bg-accent-soft`.

- Dragging: `.kanban__card[data-dragging]` — reduced opacity (0.5).

- Focus visible: `.kanban__card[data-focus-visible="true"]` — focus ring with `ring-2`.

- Disabled: `.kanban__card[aria-disabled="true"]` — disabled opacity.

- Column actions reveal: `.kanban__column-header:hover .kanban__column-actions` — opacity transitions to 1.

- Drop target: `.kanban__drop-indicator[data-drop-target]` — border and animated height.

- Drag handle reveal: `.kanban__card[data-focus-visible="true"] .kanban__drag-handle` — becomes visible (exits `sr-only`).


### CSS Variables



- `--kanban-column-min-width` — Minimum column width (default: `280px`).

- `--kanban-column-gap` — Gap between columns (default: `16px`).

- `--kanban-column-height` — Column height reference (default: `480px`).

- `--kanban-drop-height` — Drop indicator placeholder height. Set automatically by `useKanbanCardPlaceholder`.


## API Reference


### Kanban

The root board container. Wraps children in a horizontal `ScrollShadow` with Motion support.

PropTypeDefaultDescription`size``"sm" | "md" | "lg"``"md"`Size variant controlling card padding, font size, and column width.

Also supports all HeroUI ScrollShadow props (except `size`).


### Kanban.Column


An individual column section. Renders a `<section>`.


### Kanban.ColumnBody


Visual container for the card list and footer actions (e.g., "Add task" button). Renders a `<div>` with rounded background.


### Kanban.ColumnHeader


Header area containing indicator, title, count, and action buttons. Renders a `<header>`.


### Kanban.ColumnActions


Action buttons container that reveals on column header hover. Renders a `<div>`.


### Kanban.ColumnIndicator


Colored status dot or icon. Renders as a small dot when empty; switches to an icon container when children are provided. Renders a `<span>`.


### Kanban.ColumnTitle


Column heading text. Renders an `<h3>`.


### Kanban.ColumnCount


Item count badge next to the title. Renders a `<span>`.


### Kanban.CardList


The scrollable card list backed by RAC `GridList`.

PropTypeDefaultDescription`selectionMode``"none" | "single" | "multiple"``"none"`Selection behavior for cards.`renderEmptyState``() => ReactNode`—Custom empty state content when the column has no cards.

Also supports all RAC GridList props.


### Kanban.Card


An individual draggable card. Wraps content in a Motion `layout` animation for smooth reorder transitions. Backed by RAC `GridListItem`.

PropTypeDefaultDescription`textValue``string`—Accessible text value for the card.`children``ReactNode | ((renderProps) => ReactNode)`—Card content. Can be a render function receiving RAC render props.

Also supports all RAC GridListItem props.


### Kanban.DropIndicator


Visual drop indicator shown during drag operations. Supports animated height sizing.

PropTypeDefaultDescription`height``number`—Height of the drop placeholder in pixels. Typically set to the dragged card's height via `--kanban-drop-height`.

Also supports all RAC DropIndicator props.


### Kanban.DragHandle


Grip button for keyboard-accessible dragging. Screen-reader-only by default; reveals on focus. Uses `slot="drag"` for RAC drag integration.


Also supports all RAC Button props.


### Kanban.ScrollShadow


Optional scroll wrapper for constrained column heights. Use with `max-h-[...]` to enable vertical scrolling within a column.


Also supports all HeroUI ScrollShadow props.


### useKanban


A hook that manages the shared list data for the entire board.



```tsx
const kanban = useKanban({
  initialItems: tasks,
  getColumn: (item) => item.status,
  setColumn: (item, column) => ({ ...item, status: column }),
});
```

Options:

OptionTypeDefaultDescription`initialItems``T[]`—Items to populate the board with.`getColumn``(item: T) => string`—Return the column identifier for a given item.`setColumn``(item: T, column: string) => T`—Return a copy of the item assigned to a new column.`dragType``string``"kanban-item-id"`Custom MIME-like drag type for transferring item keys between columns.`getKey``(item: T) => string | number``item.id`Derive a unique key from each item.

Returns:

PropertyTypeDescription`list``ListData<T>`The underlying RAC `ListData` for advanced operations.`addItem``(item: T) => void`Add an item to the board.`removeItem``(key: string | number) => void`Remove an item by key.`moveItem``(key: string | number, toColumn: string) => void`Move an item to a different column.`updateItem``(key: string | number, item: T) => void`Update an item by key.`getColumn``(item: T) => string`Return the column for an item.`setColumn``(item: T, column: string) => T`Return item copy with new column.`dragType``string`The drag type string.

### useKanbanColumn


A hook that provides filtered items and drag-and-drop hooks for a single column.



```tsx
const { items, dragAndDropHooks } = useKanbanColumn(kanban, "In Progress", {
  renderDropIndicator,
});
```

OptionTypeDefaultDescription`kanban``UseKanbanReturn<T>`—The kanban instance from `useKanban`.`column``string`—The column identifier to filter items by.`options.renderDropIndicator``(target) => JSX.Element`—Override the default drop indicator rendering.
Returns:

PropertyTypeDescription`items``T[]`Items filtered to this column.`dragAndDropHooks``DragAndDropHooks`Pass to `Kanban.CardList` as `dragAndDropHooks`.

### useKanbanCardPlaceholder


A hook that measures the dragged card's height and writes it as a CSS variable for card-sized drop indicators.



```tsx
const { renderDropIndicator } = useKanbanCardPlaceholder({
  renderIndicator: (target) => <Kanban.DropIndicator target={target} />,
});
```

OptionTypeDefaultDescription`renderIndicator``(target: DropTarget) => JSX.Element`—Render function that receives the drop target and returns a custom `DropIndicator`.
Returns: `{ renderDropIndicator }` — pass to `useKanbanColumn` options.

Hover Card

A popover card that appears on hover to preview additional content without navigating away.

Item Card

A versatile list card with icon, title, description, and optional trailing actions like switches or selects.