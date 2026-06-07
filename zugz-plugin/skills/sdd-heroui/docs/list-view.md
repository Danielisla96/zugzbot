# List View

Copy MarkdownA single-column interactive list with keyboard navigation, selection, and accessible item actions — built on RAC GridList.

Storybook
## Usage

The `ListView` component displays a list of interactive items with built-in keyboard navigation, typeahead search, and selection.


MobileTabletDesktop

## Selection Modes

ListView supports three selection modes: `none` (read-only), `single` (radio-style), and `multiple` (checkboxes). Selection checkboxes are rendered automatically when selection is enabled.


MobileTabletDesktop

```tsx
// No selection
<ListView aria-label="Files" selectionMode="none">
  ...
</ListView>

// Single selection
<ListView aria-label="Files" selectionMode="single">
  ...
</ListView>

// Multiple selection
<ListView
  aria-label="Files"
  selectionMode="multiple"
  selectedKeys={selected}
  onSelectionChange={setSelected}
>
  ...
</ListView>
```


## Variants


### Primary

The default variant. Gray background wrapper with white surface items forming a card shape.


MobileTabletDesktop

### Secondary

No background wrapper. Items are transparent with bottom borders. Uses primary (accent) checkboxes for contrast.


MobileTabletDesktop

## Disabled Items

Use the `disabledKeys` prop to disable specific items. Disabled items cannot be selected, focused, or interacted with.


MobileTabletDesktop

```tsx
<ListView
  aria-label="Files"
  disabledKeys={["3", "5"]}
  selectionMode="multiple"
>
  ...
</ListView>
```


## With Action Bar

Combine with `ActionBar` for bulk selection workflows. The ActionBar appears when items are selected and provides contextual actions.


MobileTabletDesktop

## Anatomy


```tsx
import {ListView} from "@heroui-pro/react";

<ListView aria-label="Files" items={files} selectionMode="multiple">
  {(file) => (
    <ListView.Item id={file.id} textValue={file.name}>
      <ListView.ItemContent>
        <FileIcon />
        <div>
          <ListView.Title>{file.name}</ListView.Title>
          <ListView.Description>{file.size}</ListView.Description>
        </div>
      </ListView.ItemContent>
      <ListView.ItemAction>
        <Button isIconOnly size="sm" variant="ghost">
          <Ellipsis />
        </Button>
      </ListView.ItemAction>
    </ListView.Item>
  )}
</ListView>
```


## CSS Classes


### Base Classes



- `.list-view` — Root container. Sets `min-height: 0`, `width: 100%`, and `outline: none`.

- `.list-view--primary` — Gray background wrapper with padding and large border-radius. Items have white surface backgrounds.

- `.list-view--secondary` — No background or padding. Items are transparent with bottom borders.


### Element Classes



- `.list-view__item` — Individual row. Flex layout with gap, padding, and interactive states.

- `.list-view__item-content` — Main content area (icon + text). Flex with `min-width: 0` for truncation.

- `.list-view__title` — Primary text. Truncated, `text-sm font-medium`.

- `.list-view__description` — Secondary text. Truncated, `text-xs text-muted`.

- `.list-view__item-action` — Trailing action slot. Auto-margin to the end.

- `.list-view__selection-cell` — Checkbox area. Fixed width, flex-shrink: 0.

- `.list-view__empty-state` — Centered empty state container.


### Interactive States



- Hover: `bg-surface/40` (primary) or `bg-default/50` (secondary).

- Selected: `bg-surface/10` (primary) or `bg-accent-soft` (secondary).

- Focus visible: Inset focus ring via `box-shadow: inset 0 0 0 2px var(--color-focus)`.

- Disabled: `status-disabled` utility.

- Dragging: `opacity: 0.5`.


## API Reference


### ListView

The root list component. Accepts a generic type parameter `T` for the item data shape. Extends RAC `GridListProps`.

PropTypeDefaultDescription`aria-label``string`—Accessible label for the list. Required.`variant``"primary" | "secondary"``"primary"`Visual variant.`selectionMode``"none" | "single" | "multiple"``"none"`Item selection mode.`selectedKeys``Selection`—Controlled selected item keys.`defaultSelectedKeys``Selection`—Default selected keys (uncontrolled).`onSelectionChange``(keys: Selection) => void`—Callback when selection changes.`selectionBehavior``"toggle" | "replace"``"toggle"`Selection interaction model.`items``Iterable<T>`—Item objects for dynamic collections.`disabledKeys``Iterable<Key>`—Keys of items that should be disabled.`onAction``(key: Key) => void`—Callback when a user performs an action on an item.`renderEmptyState``() => ReactNode`—Render function for the empty state.`virtualized``boolean``false`Enable row virtualization for large datasets.`rowHeight``number``48`Estimated row height in pixels for virtualization.`className``string`—Additional CSS classes.`children``ReactNode | ((item: T) => ReactNode)`—Static items or render function for dynamic collections.

### ListView.Item


Individual list item. Extends RAC `GridListItemProps`.

PropTypeDefaultDescription`id``Key`—Unique item identifier.`textValue``string`—String representation for typeahead and accessibility.`isDisabled``boolean`—Whether the item is disabled.`href``string`—URL to navigate to when the item is actioned.`children``ReactNode`—Item content — typically `ItemContent` and optionally `ItemAction`.`className``string`—Additional CSS classes.

### ListView.ItemContent


Main content container for the item (icon/avatar + text).

PropTypeDefaultDescription`children``ReactNode`—Icon, avatar, title, description.`className``string`—Additional CSS classes.

### ListView.Title


Primary text element inside an item.

PropTypeDefaultDescription`children``ReactNode`—Title text.`className``string`—Additional CSS classes.

### ListView.Description


Secondary/muted text element inside an item.

PropTypeDefaultDescription`children``ReactNode`—Description text.`className``string`—Additional CSS classes.

### ListView.ItemAction


Trailing action slot inside an item.

PropTypeDefaultDescription`children``ReactNode`—Action buttons, menus, icons.`className``string`—Additional CSS classes.
KPI Group

A layout component for arranging multiple KPI cards in horizontal or vertical stacks with consistent spacing.

Widget

A dashboard container that wraps charts, tables, KPIs, or any content with a consistent surface treatment — secondary background shell with an elevated white content area.