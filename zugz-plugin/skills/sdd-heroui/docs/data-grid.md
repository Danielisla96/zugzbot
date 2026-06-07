# Data Grid

Copy MarkdownA full-featured data grid with sorting, selection, column resizing, pinned columns, drag-and-drop row reorder, virtualization, and async loading — built on the HeroUI Table.

Storybook
## Usage

The `DataGrid` component takes a flat `data` array, a `columns` definition, and a `getRowId` function. It renders a fully accessible table with built-in support for sorting, selection, column resizing, and more.


MobileTabletDesktop

## Anatomy

Import the `DataGrid` component — it is not a compound component and has no `DataGrid.*` sub-parts.



```tsx
import {DataGrid} from "@heroui-pro/react";

<DataGrid />
```


## Column Definitions

Columns are defined as an array of `DataGridColumn<T>` objects. Each column has an `id`, a `header`, and either an `accessorKey` (to read a value from the row object) or a custom `cell` renderer.



```tsx
import type {DataGridColumn} from "@heroui-pro/react";

interface Payment {
  id: string;
  customer: string;
  amount: number;
  status: "succeeded" | "failed";
}

const columns: DataGridColumn<Payment>[] = [
  {
    id: "customer",
    header: "Customer",
    accessorKey: "customer",
    isRowHeader: true,
    allowsSorting: true,
  },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
    align: "end",
    cell: (item) => `$${item.amount.toFixed(2)}`,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
  },
];
```


### Custom Cell Rendering

The `cell` function receives the full row item and column definition. Return any `ReactNode`:



```tsx
{
  id: "status",
  header: "Status",
  cell: (item) => (
    <Chip color={item.status === "succeeded" ? "success" : "danger"} size="sm" variant="soft">
      {item.status}
    </Chip>
  ),
}
```


### Custom Header Rendering

The `header` property accepts a string, a `ReactNode`, or a render function that receives `{ sortDirection }` for sortable columns:



```tsx
{
  id: "amount",
  header: ({ sortDirection }) => (
    <span>Amount {sortDirection === "ascending" ? "↑" : sortDirection === "descending" ? "↓" : ""}</span>
  ),
  allowsSorting: true,
}
```


## Row Selection

Enable row selection with `selectionMode` and `showSelectionCheckboxes`. Supports both `"single"` and `"multiple"` modes with controlled or uncontrolled state.



```tsx
const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

<DataGrid
  aria-label="Users"
  columns={columns}
  data={users}
  getRowId={(item) => item.id}
  selectionMode="multiple"
  showSelectionCheckboxes
  selectedKeys={selectedKeys}
  onSelectionChange={setSelectedKeys}
/>
```


## Sorting

Mark columns as sortable with `allowsSorting: true`. In uncontrolled mode, the DataGrid sorts data client-side using locale-aware string comparison (or a custom `sortFn`). For server-side sorting, pass a controlled `sortDescriptor` and handle `onSortChange`.


### Uncontrolled (client-side)



```tsx
<DataGrid
  aria-label="Payments"
  columns={columns}
  data={payments}
  getRowId={(item) => item.id}
  defaultSortDescriptor={{ column: "customer", direction: "ascending" }}
/>
```


### Controlled (server-side)


```tsx
const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
  column: "date",
  direction: "descending",
});

<DataGrid
  aria-label="Payments"
  columns={columns}
  data={payments}
  getRowId={(item) => item.id}
  sortDescriptor={sortDescriptor}
  onSortChange={setSortDescriptor}
/>
```


### Custom Sort Function

Provide a `sortFn` on a column for custom comparison logic:



```tsx
{
  id: "priority",
  header: "Priority",
  allowsSorting: true,
  sortFn: (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
}
```


## Column Resizing

Enable column resizing with `allowsColumnResize` on the DataGrid and `allowsResizing` on individual columns. Columns must have `minWidth` set.



```tsx
<DataGrid
  aria-label="Payments"
  columns={columns}
  data={payments}
  getRowId={(item) => item.id}
  allowsColumnResize
  onColumnResize={(widths) => console.log("Resizing:", widths)}
  onColumnResizeEnd={(widths) => console.log("Final widths:", widths)}
/>
```


## Pinned Columns

Pin columns to the start or end edge so they stay visible during horizontal scroll. Pinned columns must have a numeric `width` or `minWidth`.


MobileTabletDesktop

```tsx
const columns: DataGridColumn<Company>[] = [
  {
    id: "name",
    header: "Company",
    pinned: "start",
    minWidth: 160,
    // ...
  },
  // ... scrollable columns ...
  {
    id: "actions",
    header: "",
    pinned: "end",
    width: 50,
    cell: (item) => <RowActions id={item.id} />,
  },
];
```


## Drag and Drop

Enable row reorder with the `onReorder` callback. The DataGrid provides built-in drag handles, keyboard support (Enter to grab, arrows to move, Enter to drop), and fires the callback with the reordered data array.


MobileTabletDesktop

```tsx
const [tasks, setTasks] = useState(initialTasks);

<DataGrid
  aria-label="Backlog"
  columns={columns}
  data={tasks}
  getRowId={(item) => item.id}
  onReorder={(event) => setTasks(event.reorderedData)}
/>
```

For advanced drag-and-drop scenarios (cross-list, custom drag items), pass `dragAndDropHooks` directly from RAC's `useDragAndDrop`.


## Expandable Rows


Render hierarchical data by providing a `getChildren` function. The DataGrid recursively renders child rows, auto-generates a chevron toggle in the `treeColumn`, and indents each nested level by `treeIndent` pixels.


MobileTabletDesktop

```tsx
interface FileRow {
  id: string;
  name: string;
  type: "Folder" | "File";
  children?: FileRow[];
}

const [expandedKeys, setExpandedKeys] = useState<Selection>(new Set(["1"]));

<DataGrid
  aria-label="Files"
  columns={columns}
  data={files}
  getRowId={(item) => item.id}
  getChildren={(item) => item.children}
  treeColumn="name"
  expandedKeys={expandedKeys}
  onExpandedChange={setExpandedKeys}
/>
```

The `treeColumn` prop specifies which column displays the chevron. If omitted, it defaults to the first `isRowHeader` column (or the first column). Use `defaultExpandedKeys` for uncontrolled expansion, or pair `expandedKeys` with `onExpandedChange` for controlled behavior. Set `treeIndent={0}` to disable automatic per-level indentation.


Expandable rows compose with selection, drag-and-drop, sorting, pinned columns, and column resizing.


## Editable Cells


Use the `cell` render function to embed any interactive component — text fields, selects, switches, number steppers, etc.


MobileTabletDesktop

## Empty State

Provide a `renderEmptyState` function to display a custom empty state when `data` is empty.


MobileTabletDesktop

```tsx
<DataGrid
  aria-label="Projects"
  columns={columns}
  data={[]}
  getRowId={(item) => item.id}
  renderEmptyState={() => (
    <EmptyState size="sm">
      <EmptyState.Header>
        <EmptyState.Media variant="icon">
          <FolderOpen />
        </EmptyState.Media>
        <EmptyState.Title>No Projects Yet</EmptyState.Title>
        <EmptyState.Description>
          Get started by creating your first project.
        </EmptyState.Description>
      </EmptyState.Header>
    </EmptyState>
  )}
/>
```


## Async Loading

Use `onLoadMore`, `isLoadingMore`, and `loadMoreContent` to implement infinite scroll loading. The DataGrid renders a sentinel row that triggers `onLoadMore` when it scrolls into view.


MobileTabletDesktop

```tsx
<DataGrid
  aria-label="Invoices"
  columns={columns}
  data={items}
  getRowId={(item) => item.id}
  scrollContainerClassName="max-h-[400px] overflow-y-auto"
  onLoadMore={hasMore ? handleLoadMore : undefined}
  isLoadingMore={isLoading}
  loadMoreContent={<Spinner size="md" />}
/>
```


## Virtualization

Enable row virtualization for large datasets (1,000+ rows) with the `virtualized` prop. Only visible rows are rendered to the DOM. You must set `rowHeight` and `headingHeight`.


MobileTabletDesktop

```tsx
<DataGrid
  virtualized
  aria-label="Product inventory"
  columns={columns}
  data={products}
  getRowId={(item) => item.id}
  contentClassName="h-[400px] min-w-[900px] overflow-auto"
  rowHeight={58}
  headingHeight={37}
/>
```


## Bulk Actions

Combine row selection with an `ActionBar` to provide bulk operations like export, archive, or delete.


MobileTabletDesktop

## Users

A minimal user directory using the `"secondary"` variant with `accessorKey`-only columns and a row action link — no selection, no sorting.


MobileTabletDesktop

## Team Members

A full-featured HR table with controlled sorting, multi-selection, pinned columns, column resizing, column visibility toggling, search, filters, and client-side pagination.


MobileTabletDesktop

## Servers

A server monitoring dashboard with controlled sorting, selection, column visibility toggling, search, status filtering, and rich cell renderers including sparkline charts and circular progress indicators.


MobileTabletDesktop

## CSS Classes


### Base Classes



- `.data-grid` — Root wrapper. Sets `position: relative` and `width: 100%`. Defines `--data-grid-selection-column-width` and `--data-grid-drag-handle-column-width` custom properties.


### Element Classes



- `.data-grid__selection-column` — Narrow `<th>` for the select-all checkbox. Fixed width from `--data-grid-selection-column-width`.

- `.data-grid__selection-cell` — Narrow `<td>` for row selection checkboxes. Same fixed width.

- `.data-grid__drag-handle-column` — Narrow `<th>` for the drag handle column. Fixed width from `--data-grid-drag-handle-column-width`.

- `.data-grid__drag-handle-cell` — Narrow `<td>` for the drag handle. Same fixed width.

- `.data-grid__drag-handle` — The grip button inside each row. Styled with `cursor: grab` and subtle color.

- `.data-grid__sort-icon` — Chevron indicator next to sortable column headers. Rotates 180° when descending.

- `.data-grid__empty-state` — Centered container for the empty state message. Muted text, vertical padding.

- `.data-grid__tree-cell` — Flex wrapper inside the `treeColumn` cell that holds the chevron toggle and cell content. Per-level indentation is applied inline via `padding-inline-start`.

- `.data-grid__tree-toggle` — Expand/collapse chevron button, rendered when a row has children. Sized via `--data-grid-tree-toggle-size`.

- `.data-grid__tree-toggle-icon` — Chevron icon inside the toggle. Rotates 90° when the row is expanded via `[data-expanded]`.

- `.data-grid__tree-toggle-spacer` — Invisible placeholder rendered for leaf rows so their content aligns with sibling rows that have a chevron.


### Interactive States



- Drag handle hover: `&:hover` / `[data-hovered="true"]` on `.data-grid__drag-handle` — text transitions to `foreground`.

- Drag handle pressed: `&:active` / `[data-pressed="true"]` on `.data-grid__drag-handle` — cursor changes to `grabbing`.

- Drag handle focus: `[data-focus-visible="true"]` on `.data-grid__drag-handle` — applies focus ring via `status-focused`.

- Row dragging: `.table__row[data-dragging="true"]` — reduced opacity (0.5).

- Drop indicator: `.react-aria-DropIndicator[data-drop-target] td` — accent background line.


### Alignment



- `[data-align="end"]` — Right-aligns both header and cell content.

- `[data-align="center"]` — Center-aligns both header and cell content.


### Vertical Alignment

Controlled by the `verticalAlign` prop via `[data-vertical-align]` on the root:



- `[data-vertical-align="top"]` — `vertical-align: top` (flexbox `items-start` in virtualized mode).

- `[data-vertical-align="middle"]` — `vertical-align: middle` (flexbox `items-center` in virtualized mode).

- `[data-vertical-align="bottom"]` — `vertical-align: bottom` (flexbox `items-end` in virtualized mode).


### Pinned Columns




- `[data-pinned]` — Makes the cell `position: sticky` with `z-index: 2`.

- `[data-pinned="start"]` — Sticky to `inset-inline-start`.

- `[data-pinned="end"]` — Sticky to `inset-inline-end`.

- `[data-pinned-edge]` — Boundary column that shows a separator line when the pinned group detaches from the scrollable content.

- `[data-pinned-start-detached]` — Set on root when content has scrolled past the start-pinned columns. Shows separator via `::after`.

- `[data-pinned-end-detached]` — Set on root when content hasn't scrolled to the end edge. Shows separator via `::after`.


### CSS Variables



- `--data-grid-selection-column-width` — Width of the selection checkbox column (default: `40px`).

- `--data-grid-drag-handle-column-width` — Width of the drag handle column (default: `32px`).

- `--data-grid-tree-toggle-size` — Size of the expand/collapse chevron button and its leaf-row spacer (default: `24px`).

- `--data-grid-tree-gap` — Gap between the chevron/spacer and the cell content in a `treeColumn` cell (default: `4px`).


## API Reference


### DataGrid

The root data grid component. Accepts a generic type parameter `T` for the row data shape.

PropTypeDefaultDescription`data``T[]`—Row data array.`columns``DataGridColumn<T>[]`—Column definitions.`getRowId``(item: T) => string | number`—Extracts a unique key from each row item.`aria-label``string`—Accessible label for the table. Required.`variant``"primary" | "secondary"``"primary"`Visual variant passed to the underlying Table.`className``string`—Additional className for the root wrapper.`contentClassName``string`—Additional className for the inner `<table>` element (e.g. `min-w-[1200px]` for horizontal scroll).`scrollContainerClassName``string`—Additional className for the scroll container (e.g. `max-h-[400px] overflow-y-auto`).`verticalAlign``"top" | "middle" | "bottom"``"middle"`Vertical alignment of cell content within each row.`selectionMode``"none" | "single" | "multiple"``"none"`Row selection mode.`selectedKeys``Selection`—Controlled selected row keys.`defaultSelectedKeys``Selection`—Default selected row keys (uncontrolled).`onSelectionChange``(keys: Selection) => void`—Callback when selection changes.`selectionBehavior``"toggle" | "replace"``"toggle"`Selection interaction model.`showSelectionCheckboxes``boolean``false`Auto-prepend a checkbox column for selection.`sortDescriptor``SortDescriptor`—Controlled sort descriptor. When provided, sorting is controlled externally.`defaultSortDescriptor``SortDescriptor`—Default sort descriptor (uncontrolled).`onSortChange``(descriptor: SortDescriptor) => void`—Callback when sort changes. Fires in both controlled and uncontrolled modes.`allowsColumnResize``boolean``false`Enable column resizing on columns that opt in.`onColumnResize``(widths: Map<string | number, ColumnSize>) => void`—Callback during column resize.`onColumnResizeEnd``(widths: Map<string | number, ColumnSize>) => void`—Callback when resize ends.`onReorder``(event: DataGridReorderEvent<T>) => void`—Convenience callback for row reorder. Enables built-in drag-and-drop. Mutually exclusive with `dragAndDropHooks`.`dragAndDropHooks``DragAndDropHooks`—Advanced RAC drag-and-drop hooks for custom DnD scenarios. Overrides `onReorder`.`onRowAction``(key: string | number) => void`—Callback when a row is actioned (e.g. double-click or Enter).`renderEmptyState``() => ReactNode`—Render function for the empty state when `data` is empty.`onLoadMore``() => void`—Callback when the load-more sentinel scrolls into view.`isLoadingMore``boolean``false`Whether more data is currently being fetched.`loadMoreContent``ReactNode`—Content to show inside the load-more sentinel row (e.g. a `Spinner`).`disabledKeys``Iterable<string | number>`—Keys of rows that should be disabled.`virtualized``boolean``false`Enable row virtualization for large datasets. Requires `rowHeight` and `headingHeight`.`rowHeight``number``42`Fixed row height in pixels. Required when `virtualized` is true.`headingHeight``number``36`Header row height in pixels. Required when `virtualized` is true.`getChildren``(item: T) => T[] | undefined`—Return child rows for a given item. Providing this enables expandable/tree rows.`treeColumn``string`—Column id that displays the expand/collapse chevron. Defaults to the first `isRowHeader` column, or the first column.`expandedKeys``Selection`—Controlled set of expanded row keys.`defaultExpandedKeys``Selection`—Default expanded row keys (uncontrolled).`onExpandedChange``(keys: Selection) => void`—Callback when expanded rows change.`treeIndent``number``20`Pixels of inline-start padding added per nested level on the `treeColumn` cell. Set to `0` to disable.

### DataGridColumn<T>


Column definition object passed to the `columns` prop.

PropertyTypeDefaultDescription`id``string`—Unique column identifier. Used as the sort key and RAC column id. Required.`header``ReactNode | ((info: { sortDirection?: SortDirection }) => ReactNode)`—Column header content. String, node, or render function receiving sort info.`accessorKey``keyof T & string`—Key on `T` to read the cell value from. Used for default rendering and sorting.`cell``(item: T, column: DataGridColumn<T>) => ReactNode`—Custom cell renderer. Receives the row item and column definition.`isRowHeader``boolean``false`Mark this column as the row header (for accessibility).`allowsSorting``boolean``false`Allow this column to be sorted.`sortFn``(a: T, b: T) => number`—Custom sort comparator. Falls back to locale-aware string comparison.`allowsResizing``boolean`—Allow this column to be resized. Only effective when `allowsColumnResize` is true on the DataGrid.`width``ColumnSize`—Initial/controlled column width (px, %, or fr).`minWidth``number`—Minimum column width when resizing.`maxWidth``number`—Maximum column width when resizing.`align``"start" | "center" | "end"``"start"`Cell text alignment.`headerClassName``string`—Additional className appended to every `<th>` for this column.`cellClassName``string`—Additional className appended to every `<td>` for this column.`pinned``"start" | "end"`—Pin this column so it stays visible during horizontal scroll. Uses logical directions (start = left in LTR). Pinned columns must have a numeric `width` or `minWidth`.

### DataGridReorderEvent<T>


Event object passed to the `onReorder` callback.

PropertyTypeDescription`keys``Set<string | number>`The keys that were moved.`target``{ key: string | number; dropPosition: "before" | "after" }`The target row key and drop position.`reorderedData``T[]`The full reordered data array after applying the move.

### Type Exports


The following types are re-exported from the DataGrid module for convenience:

TypeOriginDescription`DataGridSelection``react-aria-components` `Selection`Represents a set of selected keys, or `"all"`.`DataGridSortDescriptor``react-aria-components` `SortDescriptor`Describes the current sort column and direction.`DataGridSortDirection``react-aria-components` `SortDirection``"ascending" | "descending"`.`DataGridColumnSize`—A number, a numeric string, a percentage string, or a fractional unit string.
Carousel

A content browsing component for navigating through a collection of images or items, with thumbnails, dots, and navigation controls.

Empty State

A placeholder for empty views with icon, title, description, and call-to-action to guide users.