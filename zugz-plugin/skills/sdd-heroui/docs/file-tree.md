# File Tree

Copy MarkdownA hierarchical file explorer with expand/collapse, drag-and-drop, icons, and multi-selection support.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the FileTree component and access all parts using dot notation.



```tsx
import {FileTree} from "@heroui-pro/react";

<FileTree>
  <FileTree.Section>
    <FileTree.Header />
    <FileTree.Item>
      <FileTree.Indicator />
    </FileTree.Item>
  </FileTree.Section>
</FileTree>
```


## Reduced Motion

Pass `reduceMotion` to disable expand/collapse animation while keeping the same tree behavior.


MobileTabletDesktop

## With Icons

MobileTabletDesktop

## Custom Indicator

MobileTabletDesktop

## Drag And Drop

MobileTabletDesktop

## Dynamic Collection

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## Guide Lines

MobileTabletDesktop

## Multiple Selection

MobileTabletDesktop

## PR File Review

MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.file-tree` — Root tree container. Sets flex column layout, padding, and outline.

- `.file-tree--sm` — Small size. Tighter indent and smaller item padding/font.

- `.file-tree--md` — Medium size (default). Moderate indent and padding.

- `.file-tree--lg` — Large size. Wider indent and larger item padding/font.


### Element Classes



- `.file-tree__item` — Individual tree row (file or folder). Rounded with interactive cursor.

- `.file-tree__item--sm` — Small item sizing (`text-xs`, compact padding).

- `.file-tree__item--md` — Medium item sizing (`text-sm`, default padding).

- `.file-tree__item--lg` — Large item sizing (`text-base`, spacious padding).

- `.file-tree__item-content` — Flex layout wrapper inside each item. Handles indent via `--tree-item-level`.

- `.file-tree__guide-line` — Vertical indent guide spanning the full row height, one per parent level.

- `.file-tree__guide-line--hover` — Guide lines only visible when the tree is hovered.

- `.file-tree__guide-line--none` — Guide lines hidden (`display: none`).

- `.file-tree__chevron` — Expand/collapse toggle button. Hidden when item has no children.

- `.file-tree__indicator` — The expand/collapse icon inside the chevron. Rotates 90° when expanded.

- `.file-tree__icon` — File/folder icon area next to the label.

- `.file-tree__label` — Text label for the tree item. Truncates with ellipsis.

- `.file-tree__section` — Optional grouping wrapper for related items.

- `.file-tree__section-header` — Section heading label. Muted, uppercase-style text.

- `.file-tree__drag-handle` — Grip button rendered when dragging is allowed. Appears on hover.


### Interactive States



- Hover: `&:hover` / `[data-hovered="true"]` on `.file-tree__item` — applies `bg-default`.

- Pressed: `&:active` / `[data-pressed="true"]` on `.file-tree__item` — applies `bg-default-hover`.

- Focus visible: `[data-focus-visible="true"]` on `.file-tree__item` — applies focus ring.

- Disabled: `[aria-disabled="true"]` on `.file-tree__item` — applies disabled opacity.

- Selected: `[data-selected="true"]` on `.file-tree__item` — applies `bg-default` with merged border-radius for adjacent selected items.

- Expanded: `[data-expanded]` on `.file-tree__item` — rotates `.file-tree__indicator` to 90°.

- Dragging: `[data-dragging]` on `.file-tree__item` — reduced opacity (0.4).

- Drop target: `[data-drop-target]` on `.file-tree__item` — accent background with outline.

- Empty tree: `[data-empty]` on `.file-tree` — centered italic placeholder text.


### CSS Variables



- `--file-tree-indent` — Indentation width per nesting level (varies by size).

- `--file-tree-item-px` — Horizontal padding for item content.

- `--file-tree-guide-color` — Color of the indent guide lines (default: `color-mix(in srgb, currentColor 10%, transparent)`).


## API Reference


### FileTree

The root tree container. Renders a `<div role="treegrid">` internally.

PropTypeDefaultDescription`reduceMotion``boolean``false`Disables expand/collapse animation. The user's reduced-motion preference is still respected.`showGuideLines``boolean | "hover"``true`Whether to show indent guide lines. `true` = always, `false` = never, `"hover"` = on tree hover only.`size``"sm" | "md" | "lg"``"md"`Size variant controlling item padding, font size, and indent width.

Also supports all RAC Tree props.


### FileTree.Item


An individual tree row representing a file or folder.

PropTypeDefaultDescription`title``ReactNode`—Label content rendered as the item text. Required.`icon``ReactNode | ((props: FileTreeItemRenderProps) => ReactNode)`—Icon rendered before the label. Can be a render function receiving `{ isExpanded, hasChildItems, allowsDragging }`.`dragIcon``ReactNode | false``<GripVertical />`Drag handle icon shown when dragging is allowed. Pass `false` to hide.

Also supports all RAC TreeItem props.


### FileTree.Indicator


Custom expand/collapse icon used inside the chevron button. Defaults to a `ChevronRight` icon that rotates on expand.

PropTypeDefaultDescription`children``ReactNode`—Custom icon element. When provided, replaces the default chevron.`className``string`—Additional CSS classes.

### FileTree.Section


Groups related tree items under an optional header.


Also supports all RAC TreeSection props.


### FileTree.Header


Section heading label rendered above a group of items.


Also supports all RAC TreeHeader props.


### useFileTree


A utility hook for working with tree data structures.



```tsx
const { expandableKeys, filterTree, leaves } = useFileTree({ items });
```

OptionTypeDefaultDescription`items``TreeNode[]`—The tree data. Each node must have `id` and optional `children`.`isLeaf``(node: T) => boolean``!children || children.length === 0`Custom predicate to identify leaf nodes.
Returns:

PropertyTypeDescription`expandableKeys``string[]`All branch node keys — useful for `defaultExpandedKeys`.`filterTree``(predicate: (node: T) => boolean) => T[]`Filters the tree by a leaf predicate, pruning empty branches.`leaves``T[]`All leaf nodes flattened from the tree.

### useFileTreeDrag


A hook that wires up drag-and-drop for the file tree using RAC's `useDragAndDrop`.



```tsx
const { dragAndDropHooks } = useFileTreeDrag({ tree });
```

OptionTypeDefaultDescription`tree``TreeDataManager`—The mutable tree data object returned by `useTreeData` from RAC.`getItems``(keys: Set<Key>) => DragItem[]`Serializes each key as `text/plain`Custom drag data per item.`onMove``(keys: Set<Key>, target: { key: Key; dropPosition: string }) => void`—Callback after items are successfully moved.
Returns: `{ dragAndDropHooks }` — pass directly to the `<FileTree>` component.

Empty State

A placeholder for empty views with icon, title, description, and call-to-action to guide users.

Floating TOC

A floating table of contents that tracks scroll position and provides quick navigation to page sections.