# Sidebar

Copy MarkdownA responsive sidebar navigation component with collapsible groups, rail mode, and mobile sheet support.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Sidebar component and access all parts using dot notation.



```tsx
import {Sidebar} from "@heroui-pro/react";

<Sidebar.Provider>
  <Sidebar>
    <Sidebar.Header />
    <Sidebar.Main>
      <Sidebar.Menu>
        <Sidebar.MenuSection>
          <Sidebar.MenuItem>
            <Sidebar.MenuIcon />
            <Sidebar.MenuItemContent>
              <Sidebar.MenuLabel />
            </Sidebar.MenuItemContent>
          </Sidebar.MenuItem>
        </Sidebar.MenuSection>
      </Sidebar.Menu>
    </Sidebar.Main>
    <Sidebar.Content />
    <Sidebar.Footer />
    <Sidebar.Group>
      <Sidebar.GroupLabel />
    </Sidebar.Group>
    <Sidebar.Separator />
    <Sidebar.Rail />
    <Sidebar.Trigger />
    <Sidebar.Mobile />
  </Sidebar>
</Sidebar.Provider>
```


## Complex

A full-featured sidebar with compact spacing, teamspaces, agents, favorites, recents, and utility footer.


MobileTabletDesktop

## Compact With User Menu

Compact sidebar with a user dropdown menu at the footer.


MobileTabletDesktop

## Meeting Notes

Meeting notes sidebar with search command palette, spaces, and workspace switcher. Uses offcanvas collapsible mode.


MobileTabletDesktop

## Agent Hub

Agent-focused sidebar combining compact spacing, workspaces, recent chats, and a user dropdown.


MobileTabletDesktop

## Agent Workspace

Workspace sidebar with agent tasks grouped by repository, inspired by AI coding tools.


MobileTabletDesktop

## Inset Variant

The inset variant uses a transparent sidebar background with a card-like content area.


MobileTabletDesktop

## With Groups

Organize menu items into labeled groups separated by dividers.


MobileTabletDesktop

## Collapsible Groups

Use expandable/collapsible groups for documentation-style navigation with guide lines.


MobileTabletDesktop

## Collapsible

Enable `collapsible="icon"` to allow the sidebar to collapse into an icon-only rail. Press `Cmd+B` to toggle.


MobileTabletDesktop

## Keyboard Shortcut

By default the sidebar toggles on `Cmd+B` (macOS) or `Ctrl+B` (other platforms). Override it via the `toggleShortcut` prop on `Sidebar.Provider`:



```tsx
<Sidebar.Provider toggleShortcut="mod+shift+s">{/* … */}</Sidebar.Provider>
```

The combo string joins modifiers with `+`. Recognized modifiers are `mod` (Cmd on macOS, Ctrl elsewhere), `cmd`, `ctrl`, `meta`, `shift`, and `alt`. Finish with a single key (e.g. `"mod+\\"`, `"ctrl+k"`, `"alt+shift+s"`).


To disable the shortcut entirely, pass `false` or `null`:



```tsx
<Sidebar.Provider toggleShortcut={false}>{/* … */}</Sidebar.Provider>
```


The handler calls `preventDefault()` when the shortcut matches. If your app owns its own global keyboard map (command palettes, rich-text editors), disable this shortcut and wire the toggle yourself via `useSidebar`.



## Persisted State


When `Sidebar.Provider` is uncontrolled (no `open` prop), it automatically writes the sidebar state to a `sidebar_state` cookie on every toggle. To restore the state across page loads, read that cookie server-side and pass it as `defaultOpen`.


### Next.js App Router



```tsx
// app/layout.tsx
import {cookies} from "next/headers";
import {Sidebar} from "@heroui-pro/react";

export default async function Layout({children}: {children: React.ReactNode}) {
  const store = await cookies();
  const defaultOpen = store.get("sidebar_state")?.value !== "false";

  return (
    <Sidebar.Provider defaultOpen={defaultOpen}>
      <Sidebar>{/* … */}</Sidebar>
      <Sidebar.Main>{children}</Sidebar.Main>
    </Sidebar.Provider>
  );
}
```


### Vite / CSR

For client-only apps you can read the cookie with a library like `js-cookie`:



```tsx
import Cookies from "js-cookie";

const defaultOpen = Cookies.get("sidebar_state") !== "false";
```


When using `AppLayout`, both `sidebar_state` and `aside_state` cookies are written automatically. See AppLayout › Persisted State.



## Reduced Motion


Pass `reduceMotion` to `Sidebar.Provider` to disable nested `Sidebar.Menu` expand/collapse animation across the sidebar.


MobileTabletDesktop

## Floating Variant

The floating variant renders the sidebar with rounded corners and a shadow.


MobileTabletDesktop

## With Avatar

Display a user avatar in the sidebar header with a collapsible layout.


MobileTabletDesktop

## Right Side

Position the sidebar on the right by setting `side="right"` on the provider.


MobileTabletDesktop

## Icon Only

A permanently collapsed icon-only sidebar with tooltips on each item.


MobileTabletDesktop

## Client-Side Routing

`Sidebar.MenuItem` supports navigation via the `href` prop. Because RAC `TreeItem` elements cannot be rendered as `<a>` tags due to HTML spec limitations, navigation is handled programmatically through a `navigate` callback on `Sidebar.Provider`.


Pass your router's navigation function to the `navigate` prop, and add `href` to any `Sidebar.MenuItem` that should navigate:


### Next.js (App Router)



```tsx
"use client";

import { useRouter } from "next/navigation";

function AppSidebar() {
  const router = useRouter();

  return (
    <Sidebar.Provider navigate={router.push}>
      <Sidebar>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.MenuItem href="/dashboard">
              <Sidebar.MenuIcon><HomeIcon /></Sidebar.MenuIcon>
              <Sidebar.MenuLabel>Dashboard</Sidebar.MenuLabel>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem href="/settings">
              <Sidebar.MenuIcon><SettingsIcon /></Sidebar.MenuIcon>
              <Sidebar.MenuLabel>Settings</Sidebar.MenuLabel>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.Content>
      </Sidebar>
      <Sidebar.Main>{/* ... */}</Sidebar.Main>
    </Sidebar.Provider>
  );
}
```


### React Router


```tsx
import { useNavigate } from "react-router";

function AppSidebar() {
  const navigate = useNavigate();

  return (
    <Sidebar.Provider navigate={navigate}>
      <Sidebar>
        {/* ... */}
        <Sidebar.MenuItem href="/dashboard">
          <Sidebar.MenuIcon><HomeIcon /></Sidebar.MenuIcon>
          <Sidebar.MenuLabel>Dashboard</Sidebar.MenuLabel>
        </Sidebar.MenuItem>
        {/* ... */}
      </Sidebar>
      <Sidebar.Main>{/* ... */}</Sidebar.Main>
    </Sidebar.Provider>
  );
}
```


### TanStack Router


```tsx
import { useRouter } from "@tanstack/react-router";

function AppSidebar() {
  const router = useRouter();

  return (
    <Sidebar.Provider navigate={(href) => router.navigate({ to: href })}>
      <Sidebar>
        {/* ... */}
        <Sidebar.MenuItem href="/dashboard">
          <Sidebar.MenuIcon><HomeIcon /></Sidebar.MenuIcon>
          <Sidebar.MenuLabel>Dashboard</Sidebar.MenuLabel>
        </Sidebar.MenuItem>
        {/* ... */}
      </Sidebar>
      <Sidebar.Main>{/* ... */}</Sidebar.Main>
    </Sidebar.Provider>
  );
}
```


### External Links and Force Reload

External URLs (starting with `http://` or `https://`) are automatically opened in a new tab via `window.open`. For internal links that need a full page reload instead of client-side navigation, use the `forceReload` prop:



```tsx
<Sidebar.MenuItem href="https://github.com/heroui-inc/heroui">
  <Sidebar.MenuIcon><GithubIcon /></Sidebar.MenuIcon>
  <Sidebar.MenuLabel>GitHub</Sidebar.MenuLabel>
</Sidebar.MenuItem>

<Sidebar.MenuItem href="/legacy-page" forceReload>
  <Sidebar.MenuIcon><ExternalLinkIcon /></Sidebar.MenuIcon>
  <Sidebar.MenuLabel>Legacy Page</Sidebar.MenuLabel>
</Sidebar.MenuItem>
```


If no `navigate` function is provided, `href` falls back to `window.location.href` for navigation.



## CSS Classes



### Base & Variant Classes



- `.sidebar` — The sidebar panel. Flex column with `h-svh`, transitions on width and box-shadow.

- `.sidebar--default` — Default variant with an inset box-shadow border separator.

- `.sidebar--floating` — Rounded with shadow, margin, and `bg-surface`. Detached from the edge.

- `.sidebar--inset` — Transparent background with no border or shadow.

- `.sidebar--left` — Left-side positioning (default).

- `.sidebar--right` — Right-side positioning with `order: 1`.


### Layout Classes



- `.sidebar__provider` — Layout wrapper for sidebar + main content. `flex min-h-svh w-full`.

- `.sidebar__offcanvas-wrapper` — Collapsing spacer for offcanvas mode. Width transitions to `0` when collapsed.

- `.sidebar__main` — Main content area. `flex-1` with `min-h-svh`.

- `.sidebar__mobile` — Mobile Sheet wrapper. Full-height flex column.


### Section Classes



- `.sidebar__header` — Top section with flex column layout and padding.

- `.sidebar__content` — Scrollable middle section wrapping `ScrollShadow`. `flex-1` with `overflow-y: auto`.

- `.sidebar__footer` — Bottom section with flex column layout and padding.

- `.sidebar__group` — Flex column group with top margin between siblings.

- `.sidebar__group-label` — Muted group heading label. Hidden when sidebar is collapsed.


### Menu Classes



- `.sidebar__menu` — Tree-based menu container. Flex column with `gap-0.5`.

- `.sidebar__menu-section` — Section grouping within a menu with top margin.

- `.sidebar__menu-header` — Section heading label. Muted, uppercase, hidden when collapsed.

- `.sidebar__menu-item` — Individual menu row. Relative positioned with transition on box-shadow.

- `.sidebar__menu-item-content` — Inner content wrapper with flex layout, `min-h-9`, and `rounded-2xl`. Indented via `--sidebar-menu-item-offset`.

- `.sidebar__menu-trigger` — Expand/collapse toggle button (`size-5`). Hidden when item has no children.

- `.sidebar__menu-indicator` — Chevron icon that rotates 90° when expanded.

- `.sidebar__menu-icon` — Icon slot (`size-5`) with muted color.

- `.sidebar__menu-label` — Label text with truncation and `text-sm`.

- `.sidebar__menu-label-text` — Inner text span with `text-ellipsis` and `whitespace-nowrap`.

- `.sidebar__menu-chip` — Trailing badge/counter with muted color and `tabular-nums`.

- `.sidebar__menu-actions` — Action buttons container. Hidden by default, shown on hover or when current.

- `.sidebar__menu-action` — Individual action button with hover/pressed background transitions.


### Utility Classes



- `.sidebar__separator` — Horizontal divider with vertical margin.

- `.sidebar__rail` — Thin edge strip for toggling. Absolute positioned with directional resize cursor.


### Interactive States



- Collapsed (icon): `[data-state="collapsed"]` — width transitions to `--sidebar-width-collapsed`. Labels, chips, and actions are hidden. Items center their icon.

- Collapsed (offcanvas): `[data-state="collapsed"][data-collapsible="offcanvas"]` — sidebar slides off-screen via `translate: -100% 0` (or `100%` for right side).

- Expanded: `[data-state="expanded"]` — full `--sidebar-width` with all content visible.

- Item hover: `.sidebar__menu-item:hover .sidebar__menu-item-content` — applies `bg-default`.

- Item current: `[data-current="true"]` on `.sidebar__menu-item` — applies `bg-default` to content and `font-medium` to label.

- Item focus visible: `[data-focus-visible="true"]` on `.sidebar__menu-item` — applies focus ring to content.

- Item disabled: `[aria-disabled="true"]` on `.sidebar__menu-item` — applies disabled styles.

- Guide lines always: `[data-guide-lines="always"]` — repeating vertical guide lines via `::before` pseudo-element.

- Guide lines hover: `[data-guide-lines="hover"]` — guide lines fade in on menu hover.

- Rail hover: `.sidebar__rail:hover` — changes the sidebar edge outline color.

- Mobile: `@media (max-width: 768px)` — desktop sidebar is hidden, `Sidebar.Mobile` renders a Sheet.

- Reduced motion: `@media (prefers-reduced-motion: reduce)` — disables all transitions.


### CSS Variables



- `--sidebar-width` — Expanded sidebar width (default: `240px`).

- `--sidebar-width-collapsed` — Collapsed sidebar width for icon mode (default: `48px`).

- `--sidebar-duration` — Transition duration (default: `200ms`).

- `--sidebar-ease` — Transition easing (default: `ease`).

- `--sidebar-edge-outline` — Border color for the default variant edge.

- `--sidebar-menu-indent` — Indentation width per nesting level (default: `calc(var(--spacing) * 4)`).

- `--sidebar-menu-guide-color` — Guide line color (default: `color-mix(in srgb, currentColor 10%, transparent)`).

- `--sidebar-menu-row-gap` — Vertical gap between menu rows (default: `calc(var(--spacing) * 0.5)`).

- `--sidebar-menu-item-offset` — Per-item left offset based on `aria-level` (set automatically).


## API Reference


### Sidebar.Provider

Layout wrapper that provides sidebar context to all children. Wraps both the sidebar and main content.

PropTypeDefaultDescription`open``boolean`—Controlled open/expanded state.`defaultOpen``boolean``true`Initial open state (uncontrolled).`onOpenChange``(open: boolean) => void`—Callback when open state changes.`side``"left" | "right"``"left"`Which side the sidebar is on.`variant``"sidebar" | "floating" | "inset"``"sidebar"`Visual style variant.`collapsible``"icon" | "offcanvas" | "none"``"icon"`Collapse behavior. `"icon"` collapses to icon-only, `"offcanvas"` slides off-screen, `"none"` disables collapse.`navigate``(href: string) => void`—Programmatic navigation function for client-side routing (e.g. `router.push`). Called when a `Sidebar.MenuItem` with `href` is pressed.`reduceMotion``boolean``false`Disables nested `Sidebar.Menu` expand/collapse animations for all menus inside the provider. The user's reduced-motion preference is still respected.`toggleShortcut``string | false | null``"mod+b"`Keyboard shortcut that toggles the sidebar. Accepts a combo string with modifiers joined by `+` — `mod` (Cmd on macOS, Ctrl elsewhere), `cmd`, `ctrl`, `meta`, `shift`, `alt` — followed by a single key (e.g. `"mod+shift+s"`, `"ctrl+\\"`). Pass `false` or `null` to disable.

### Sidebar


The sidebar panel element. Renders an `<aside>` tag.


### Sidebar.Header


Top section of the sidebar. Renders a `<div>` with flex column layout.


### Sidebar.Content


Scrollable middle section. Wraps HeroUI ScrollShadow with `hideScrollBar`.


Also supports all HeroUI ScrollShadow props.


### Sidebar.Footer


Bottom section of the sidebar. Renders a `<div>` with flex column layout.


### Sidebar.Group


Groups related menu items or content with optional spacing between groups. Renders a `<div>`.

PropTypeDefaultDescription`closeMobileOnAction``boolean``true`Whether pressing a menu item in this group automatically closes the mobile sidebar sheet. Inherited by all `Sidebar.Menu` and `Sidebar.MenuItem` descendants.

### Sidebar.GroupLabel


Label for a sidebar group. Hidden when the sidebar is collapsed. Renders a `<div>`.


### Sidebar.Menu


Tree-based menu container backed by RAC `Tree`. Supports keyboard navigation and guide lines.

PropTypeDefaultDescription`closeMobileOnAction``boolean`inherited from `Sidebar.Group` or `true`Whether pressing a menu item automatically closes the mobile sidebar sheet. Overrides the group-level setting.`reduceMotion``boolean`inherited from `Sidebar.Provider`Disables submenu expand/collapse animations for this menu only. The user's reduced-motion preference is still respected.`showGuideLines``boolean | "hover"``true`Whether to show submenu guide lines. `true` = always, `false` = never, `"hover"` = on menu hover only.

Also supports all RAC Tree props (selection-related props are disallowed).


### Sidebar.MenuSection


Section grouping within a menu.


Also supports all RAC TreeSection props.


### Sidebar.MenuHeader


Section heading label within a menu. Hidden when collapsed.


Also supports all RAC TreeHeader props.


### Sidebar.MenuItem


An individual menu item that can contain icons, labels, actions, chips, and nested submenus.

PropTypeDefaultDescription`closeMobileOnAction``boolean`inheritedOverride the inherited `closeMobileOnAction` for this specific item. Set to `false` to keep the mobile sidebar open when this item is pressed.`forceReload``boolean``false`Force a full page reload instead of client-side navigation. Uses `window.location.href` instead of the Provider's `navigate` function.`href``string`—URL to navigate to. Uses the Provider's `navigate` function for client-side routing, or `window.location.href` as a fallback. External URLs (`http://https://`) open in a new tab.`isCurrent``boolean``false`Marks the item as the current page (`aria-current="page"`).`tooltip``ReactNode`Item label textTooltip content shown when the sidebar is collapsed to icon-only.`tooltipProps``SidebarMenuItemTooltipProps`—Props for an always-visible tooltip wrapping the item content.

Also supports all RAC TreeItem props.


### Sidebar.MenuItemContent


Wrapper for the content rendered inside a menu item. Children are rendered directly.


### Sidebar.MenuIcon


Icon slot inside a menu item. Renders a `<span>` with `size-5`.


### Sidebar.MenuLabel


Label text inside a menu item. Automatically separates trailing `Sidebar.MenuTrigger` elements. Renders a `<span>`.


### Sidebar.MenuChip


Trailing badge/counter inside a menu item. Renders a `<span>` with muted color and `tabular-nums`.


### Sidebar.MenuActions


Container for action buttons inside a menu item. Hidden by default, shown on hover or when current.


### Sidebar.MenuAction


An individual action button inside the actions container.


Also supports all RAC Button props.


### Sidebar.MenuTrigger


Expand/collapse toggle for items with children. Hidden when item has no child items.


Also supports all RAC Button props.


### Sidebar.MenuIndicator


Chevron icon that rotates when an item is expanded. Accepts custom children to replace the default icon.


### Sidebar.Submenu


Wrapper for nested child items. Children are rendered as tree sub-items.


### Sidebar.Separator


Horizontal divider.


Also supports all HeroUI Separator props.


### Sidebar.Trigger


Toggle button for opening/closing the sidebar. Renders a HeroUI Button with `variant="ghost"` and `size="sm"`.


Also supports all HeroUI Button props.


### Sidebar.Rail


Thin edge strip for toggling the sidebar by clicking. Shows directional resize cursor.


### Sidebar.Main


Main content area next to the sidebar. Renders a `<main>` tag with `flex-1`.


### Sidebar.Mobile


Mobile-only Sheet wrapper. Renders nothing on desktop. On mobile, wraps children in a Sheet that slides from the sidebar's side.

PropTypeDefaultDescription`backdrop``"blur" | "opaque" | "transparent"``"blur"`Backdrop style for the mobile sheet.

### Sidebar.Tooltip


Tooltip wrapper that only shows when the sidebar is collapsed. When expanded, renders children directly.

PropTypeDefaultDescription`content``ReactNode`—Tooltip content shown when sidebar is collapsed.`placement``"top" | "bottom" | "left" | "right"``"right"`Tooltip placement.`delay``number`—Delay in ms before showing the tooltip.`closeDelay``number`—Delay in ms before hiding the tooltip.

### useSidebar


A hook for programmatic sidebar control.



```tsx
const { isOpen, setOpen, isMobile, isMobileOpen, setMobileOpen, toggleSidebar, side, variant, collapsible } = useSidebar();
```

PropertyTypeDescription`isOpen``boolean`Current desktop open/expanded state.`setOpen``(open: boolean) => void`Set the desktop open state.`isMobile``boolean`Whether the viewport is at mobile width (`≤768px`).`isMobileOpen``boolean`Current mobile sheet open state (independent from desktop).`setMobileOpen``(open: boolean) => void`Set the mobile sheet open state.`toggleSidebar``() => void`Toggle the sidebar open/closed (desktop or mobile depending on viewport).`side``"left" | "right"`Which side the sidebar is on.`variant``"sidebar" | "floating" | "inset"`Current visual variant.`collapsible``"icon" | "offcanvas" | "none"`Current collapse behavior.Segment

A segmented control for toggling between a small set of mutually exclusive options.

Stepper

A step-by-step progress indicator with numbered, icon, and bullet variants in horizontal or vertical layouts.