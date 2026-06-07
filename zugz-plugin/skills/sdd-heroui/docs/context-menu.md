# Context Menu

Copy MarkdownA right-click context menu with nested submenus, selection state, and long-press support for touch.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the ContextMenu component and access all parts using dot notation.



```tsx
import {ContextMenu} from "@heroui-pro/react";

<ContextMenu>
  <ContextMenu.Trigger />
  <ContextMenu.Popover>
    <ContextMenu.Menu>
      <ContextMenu.Section>
        <ContextMenu.Item />
      </ContextMenu.Section>
      <ContextMenu.Separator />
    </ContextMenu.Menu>
  </ContextMenu.Popover>
</ContextMenu>
```


## Controlled

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Long Press

MobileTabletDesktop

## With Sections

MobileTabletDesktop

## With Selection

MobileTabletDesktop

## With Submenus

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.context-menu__trigger` — The right-click target area. Relatively positioned inline-block with `-webkit-touch-callout: none` for long-press support.

- `.context-menu__popover` — The floating menu panel positioned at the cursor. Has `bg-overlay`, `shadow-overlay`, rounded corners, and enter/exit animations.

- `.context-menu__menu` — The list of menu items inside the popover. Flex column with `gap-0.5`.

- `.context-menu__separator` — Horizontal divider between menu groups (`bg-separator`).


### Interactive States



- Entering: `[data-entering="true"]` on `.context-menu__popover` — `fade-in` + `zoom-in-90` with placement-aware slide (150ms).

- Exiting: `[data-exiting="true"]` on `.context-menu__popover` — `fade-out` + `zoom-out-95` (100ms).

- Placement slide: `[data-placement="top"]` slides from bottom, `[data-placement="bottom"]` from top, `[data-placement="left"]` from right, `[data-placement="right"]` from left.

- Focus visible: `.context-menu__popover[data-focus-visible="true"]` — outline suppressed (`outline: none`).

- Reduced motion: `motion-reduce:animate-none` on entering/exiting states.


## API Reference


### ContextMenu

The root provider that manages open state and cursor positioning.

PropTypeDefaultDescription`open``boolean`—Controlled open state.`defaultOpen``boolean``false`Initial open state (uncontrolled).`onOpenChange``(open: boolean) => void`—Callback when open state changes.`isDisabled``boolean``false`Whether the context menu is disabled.

### ContextMenu.Trigger


The right-click (or long-press) target area. Renders a `<div>` by default.

PropTypeDefaultDescription`children``ReactNode`—Content that can be right-clicked.`className``string`—Additional CSS classes.

### ContextMenu.Popover


The floating panel positioned at the cursor coordinates.

PropTypeDefaultDescription`offset``number``2`Distance from the anchor point in pixels.`placement``Placement``"bottom start"`Preferred placement relative to the cursor.

Also supports all RAC Popover props (except `isOpen`, `triggerRef`, and `children`).


### ContextMenu.Menu


The list of menu items. Automatically closes the context menu when an item is selected.

PropTypeDefaultDescription`onClose``() => void`—Custom close handler. Defaults to closing the context menu.

Also supports all RAC Menu props.


### ContextMenu.Item


An individual menu item. Re-exports HeroUI DropdownItem.


Also supports all HeroUI DropdownItem props.


### ContextMenu.ItemIndicator


Selection indicator for checkbox/radio menu items. Re-exports HeroUI DropdownItemIndicator.


### ContextMenu.Section


Groups related menu items. Re-exports HeroUI DropdownSection.


Also supports all HeroUI DropdownSection props.


### ContextMenu.SubmenuTrigger


Wraps a menu item that opens a nested submenu on hover. Re-exports HeroUI DropdownSubmenuTrigger.


### ContextMenu.SubmenuIndicator


Chevron icon indicating a submenu. Re-exports HeroUI DropdownSubmenuIndicator.


### ContextMenu.Separator


A horizontal divider between menu groups.


Also supports all RAC Separator props.

Command

A command palette with fuzzy search, keyboard navigation, and nested groups for quick actions.

Navbar

A composable top navigation bar with hide-on-scroll, responsive mobile menu, and client-side routing support.