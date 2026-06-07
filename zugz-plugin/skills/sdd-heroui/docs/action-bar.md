# Action Bar

Copy MarkdownA floating toolbar for contextual actions — bulk selection, editing controls, or any set of actions that appear in response to user interaction.

Storybook
## Usage

The `ActionBar` component is a floating pill-shaped toolbar that animates in/out based on the `isOpen` prop. It uses a Prefix / Content / Suffix structure.


Combine with ListView for bulk selection rows.


MobileTabletDesktop

## With Data Grid

Combine with DataGrid for bulk selection workflows. The ActionBar appears when rows are selected and provides contextual actions like edit, export, archive, or delete.


MobileTabletDesktop

## Anatomy


```tsx
import {ActionBar} from "@heroui-pro/react";
import {Button, Chip, Separator, Tooltip} from "@heroui/react";

<ActionBar isOpen={hasSelection}>
  <ActionBar.Prefix>
    <Chip size="sm">{count}</Chip>
  </ActionBar.Prefix>
  <Separator />
  <ActionBar.Content>
    <Button size="sm" variant="ghost">Edit</Button>
    <Button size="sm" variant="ghost">Export</Button>
  </ActionBar.Content>
  <Separator />
  <ActionBar.Suffix>
    <Tooltip>
      <Button isIconOnly aria-label="Clear" size="sm" variant="ghost" onPress={onClear}>
        <Xmark />
      </Button>
      <Tooltip.Content>Clear selection</Tooltip.Content>
    </Tooltip>
  </ActionBar.Suffix>
</ActionBar>
```

All three sections (`Prefix`, `Content`, `Suffix`) are optional. Use `Separator` from `@heroui/react` between sections as needed.


## Responsive Labels


Use the `action-bar__label` CSS class on any text you want hidden on mobile. Below the `sm` breakpoint (640px), elements with this class become `sr-only` — buttons collapse to icon-only while remaining accessible.



```tsx
<Button aria-label="Edit" size="sm" variant="ghost">
  <Pencil />
  <span className="action-bar__label">Edit</span>
</Button>
```


## CSS Classes


### Base Classes



- `.action-bar` — Outer positioning wrapper. Fixed to viewport bottom-center with `pointer-events: none`.

- `.action-bar__wrapper` — The visible pill surface. Restores `pointer-events: auto`, applies shadow.


### Element Classes



- `.action-bar__prefix` — Leading section (badges, counts).

- `.action-bar__content` — Middle section for main actions.

- `.action-bar__suffix` — Trailing section (dismiss button).

- `.action-bar__label` — Text that collapses to `sr-only` below 640px.


## API Reference


### ActionBar

The root component. Extends `ToolbarProps` from `@heroui/react`.

PropTypeDefaultDescription`isOpen``boolean`—Controls visibility with animated enter/exit. Required.`aria-label``string``"Actions"`Accessible label for the toolbar.`isAttached``boolean``true`Whether the toolbar has a surface background with full rounding.`orientation``"horizontal" | "vertical"``"horizontal"`The orientation of the toolbar.`className``string`—Additional CSS classes applied to the toolbar wrapper.`children``ReactNode`—Content — typically `Prefix`, `Content`, `Suffix`, and `Separator` components.

### ActionBar.Prefix


Leading section container.

PropTypeDefaultDescription`children``ReactNode`—Content for the leading section (badges, counts, labels).`className``string`—Additional CSS classes.

### ActionBar.Content


Middle section container for main actions.

PropTypeDefaultDescription`children``ReactNode`—Action buttons, dropdowns, etc.`className``string`—Additional CSS classes.

### ActionBar.Suffix


Trailing section container.

PropTypeDefaultDescription`children``ReactNode`—Dismiss button, secondary actions.`className``string`—Additional CSS classes.
Agenda

A composable calendar component with day, week, and month views for displaying and managing events with drag interactions.

Carousel

A content browsing component for navigating through a collection of images or items, with thumbnails, dots, and navigation controls.