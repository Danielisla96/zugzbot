# Navbar

Copy MarkdownA composable top navigation bar with hide-on-scroll, responsive mobile menu, and client-side routing support.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Navbar component and access all parts using dot notation.



```tsx
import {Navbar} from "@heroui-pro/react";

<Navbar>
  <Navbar.Header>
    <Navbar.Brand />
    <Navbar.MenuToggle />
    <Navbar.Menu>
      <Navbar.MenuItem />
    </Navbar.Menu>
  </Navbar.Header>
  <Navbar.Content>
    <Navbar.Item />
    <Navbar.Label />
    <Navbar.Separator />
    <Navbar.Spacer />
  </Navbar.Content>
</Navbar>
```


## Docs Site

A docs-site style navbar with a search bar, theme segment, and responsive mobile menu.


MobileTabletDesktop

## With Dropdowns

SaaS-style navbar with a team switcher, user dropdown, and mobile menu.


MobileTabletDesktop

## Dashboard

Breadcrumb-style dashboard navbar built with `InlineSelect` for the workspace, project, and timezone selectors.


MobileTabletDesktop

## Compact

A dense navbar tuned via `--spacing` and `height` overrides for a Luma-style compact layout.


MobileTabletDesktop

## With Menu

Responsive navbar with a mobile hamburger toggle and animated dropdown menu.


MobileTabletDesktop

## Hide on Scroll

Pass `hideOnScroll` to hide the navbar when the user scrolls down and reveal it on scroll up.


MobileTabletDesktop

## Responsive Mobile Menu

`Navbar.MenuToggle` and `Navbar.Menu` provide a built-in mobile dropdown. Use `hidden md:flex` on desktop-only groups and keep the toggle visible below the breakpoint:



```tsx
<Navbar>
  <Navbar.Header>
    <Navbar.MenuToggle className="md:hidden" />
    <Navbar.Brand>…</Navbar.Brand>

    {/* Desktop-only nav */}
    <Navbar.Content className="hidden md:flex">
      <Navbar.Item href="/features">Features</Navbar.Item>
      <Navbar.Item href="/pricing">Pricing</Navbar.Item>
    </Navbar.Content>
  </Navbar.Header>

  {/* Mobile-only menu — animates in when the toggle is pressed */}
  <Navbar.Menu>
    <Navbar.MenuItem href="/features">Features</Navbar.MenuItem>
    <Navbar.MenuItem href="/pricing">Pricing</Navbar.MenuItem>
  </Navbar.Menu>
</Navbar>
```

The menu open state can be controlled via `isMenuOpen` / `onMenuOpenChange` on `Navbar`, or uncontrolled via `defaultMenuOpen`. By default the navbar locks body scroll while the menu is open — pass `shouldBlockScroll={false}` to disable.


## Compact Density


Scale the entire navbar (paddings, gaps, icon sizes) by overriding the Tailwind v4 `--spacing` variable on the navbar or a wrapper, and tune the bar height with the `height` prop:



```tsx
<Navbar
  height="2.75rem"
  size="sm"
  style={{"--spacing": "0.22rem"} as React.CSSProperties}
>
  …
</Navbar>
```



- `--spacing` scales every Tailwind spacing utility (`gap-*`, `p-*`, `size-*`) inside the navbar

- `height` overrides the internal `--navbar-height` CSS variable

- `size="sm"` applies the built-in compact text + padding variants


## Client-Side Routing

`Navbar.Item` renders a real `<a>` element when `href` is set (and `Navbar.MenuItem` does the same for the mobile menu), so it works with any router. You have two ways to integrate client-side routing:


### Option 1 — `navigate` callback (recommended)


Pass your router's push function to `Navbar`. Every `Navbar.Item` / `Navbar.MenuItem` with an `href` will route through it, preventing full-page reloads.

Next.js (App Router)


```tsx
"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@heroui-pro/react";

export function AppNavbar() {
  const router = useRouter();

  return (
    <Navbar navigate={router.push}>
      <Navbar.Header>
        <Navbar.Brand>Acme</Navbar.Brand>
        <Navbar.Content>
          <Navbar.Item href="/features">Features</Navbar.Item>
          <Navbar.Item href="/pricing">Pricing</Navbar.Item>
        </Navbar.Content>
      </Navbar.Header>
    </Navbar>
  );
}
```

React Router

```tsx
import { useNavigate } from "react-router";
import { Navbar } from "@heroui-pro/react";

export function AppNavbar() {
  const navigate = useNavigate();

  return (
    <Navbar navigate={navigate}>
      {/* ... */}
    </Navbar>
  );
}
```

TanStack Router

```tsx
import { useRouter } from "@tanstack/react-router";
import { Navbar } from "@heroui-pro/react";

export function AppNavbar() {
  const router = useRouter();

  return (
    <Navbar navigate={(href) => router.navigate({ to: href })}>
      {/* ... */}
    </Navbar>
  );
}
```


### Option 2 — `render` prop for a custom link component

Since `Navbar.Item` and `Navbar.MenuItem` are polymorphic, you can swap the rendered element entirely to use a framework-specific `<Link>` component (preserving prefetch, scroll restoration, and any router-level behaviors):



```tsx
import Link from "next/link";
import { Navbar } from "@heroui-pro/react";

export function AppNavbar() {
  return (
    <Navbar>
      <Navbar.Header>
        <Navbar.Content>
          <Navbar.Item
            href="/features"
            render={(props) => <Link href="/features" {...props} />}
          >
            Features
          </Navbar.Item>
        </Navbar.Content>
      </Navbar.Header>
    </Navbar>
  );
}
```

Same works for `Navbar.MenuItem` in the mobile menu and for React Router's `Link`, TanStack Router's `Link`, etc.



Combine both approaches if you like — `render` owns the element/prefetch, and `navigate` is used as the fallback for programmatic navigations (e.g. closing the mobile menu and pushing to the href).



### External Links and Force Reload


External URLs (starting with `http://` or `https://`) are automatically opened in a new tab via `window.open(href, "_blank", "noopener,noreferrer")`. For internal links that need a full page reload instead of client-side navigation, use the `forceReload` prop:



```tsx
<Navbar.Item href="https://github.com/heroui-inc/heroui">GitHub</Navbar.Item>

<Navbar.Item href="/legacy-page" forceReload>Legacy page</Navbar.Item>
```


If no `navigate` function is provided, `href` falls back to the browser's default navigation.



## Positioning


Use the `position` prop to control how the navbar is anchored:



- `"sticky"` (default) — sticks to the top of its scroll container (`sticky top-0`)

- `"static"` — flows inline with the page

- `"floating"` — sticky, but detached from the edges with rounded corners, margin, border, and a shadow



```tsx
<Navbar position="floating" maxWidth="xl">…</Navbar>
```


## Programmatic Control

Use the `useNavbar` hook inside children of `Navbar` for programmatic access to the menu state and scroll-hidden state:



```tsx
import { useNavbar } from "@heroui-pro/react";

function CloseMenuButton() {
  const { isMenuOpen, setMenuOpen } = useNavbar();

  return (
    <Button onPress={() => setMenuOpen(false)} isDisabled={!isMenuOpen}>
      Close menu
    </Button>
  );
}
```


## CSS Classes


### Base & Variant Classes



- `.navbar` — Root `<nav>` element. Flex column, `bg-background`, `z-40`.

- `.navbar--sticky` — Sticky to the top of the scroll container.

- `.navbar--static` — Inline positioning.

- `.navbar--floating` — Sticky, detached with `rounded-2xl`, `border`, `shadow-surface`, and `mx-2`.

- `.navbar[data-hidden="true"]` — Applied while the navbar is hidden via `hideOnScroll`.

- `.navbar[data-menu-open="true"]` — Applied while the mobile menu is open.


### Layout Classes



- `.navbar__header` — Horizontal bar wrapper. `flex items-center gap-4 px-6`, clamped by `--navbar-max-width` and `--navbar-height`.

- `.navbar__header--max-sm|md|lg|xl|2xl|full` — Sets `--navbar-max-width` to `640px` / `768px` / `1024px` / `1280px` / `1536px` / `100%`.

- `.navbar__header--sm|md|lg` — Size variants that tune `--navbar-height` and header padding.

- `.navbar__brand` — Logo / site-title container. `flex shrink-0 items-center gap-2`.

- `.navbar__content` — Horizontal group of items. `flex items-center gap-1`.

- `.navbar__spacer` — Flex-grow gap that pushes sibling content to the edges.


### Item Classes



- `.navbar__item` — Nav link/button. `text-muted text-sm`, hover → `text-foreground`, `rounded-lg`.

- `.navbar__item--sm|lg` — Size variants for items (padding + font size).

- `.navbar__item[data-current="true"]` — Applied when `isCurrent` is true; bumps to `text-foreground`. Also sets `aria-current="page"`.

- `.navbar__label` — Truncated text inside items.

- `.navbar__separator` — Vertical decorative divider (`h-6 self-center`).


### Menu Classes



- `.navbar__menu-toggle` — Hamburger button (`size-9`). Toggles between hamburger and close icon via `::before`/`::after` pseudo-elements.

- `.navbar__menu-toggle--sm|lg` — Size variants.

- `.navbar__menu-toggle-icon` — Inner span housing the animated pseudo-element lines.

- `.navbar__menu` — Mobile dropdown menu. `flex flex-col gap-1 overflow-y-auto px-6 pb-6 pt-2`. Height animates between `0` and `calc(100dvh - var(--navbar-height))`.

- `.navbar__menu-item` — Individual mobile menu item. `text-foreground text-base font-medium`, hover → `bg-default`.

- `.navbar__menu-item--sm|lg` — Size variants.

- `.navbar__menu-item[data-current="true"]` — Current mobile menu item (bg-default).


### CSS Variables



- `--navbar-height` — Height of the horizontal bar (default: `4rem`; `3rem` for `sm`; `5rem` for `lg`). Can also be set via the `height` prop on `Navbar`.

- `--navbar-max-width` — Max content width inside the header (default: `1024px`, overridable via `maxWidth`).

- `--navbar-transition-duration` — Reserved for future transitions (default: `300ms`).

- `--spacing` — Tailwind v4 base spacing token. Override on the navbar root (or a wrapper) to uniformly scale all internal paddings, gaps, and icon sizes.


## Accessibility



- Rendered as a `<nav>` landmark. Add an `aria-label` when multiple navigation regions share the page.

- `Navbar.Item` with `isCurrent` sets `aria-current="page"` automatically.

- `Navbar.MenuToggle` is backed by RAC `ToggleButton`; its selected state is wired to `isMenuOpen`. Customize the screen-reader label via the `srLabel` prop.

- Animations respect the user's `prefers-reduced-motion` preference.


## API Reference


### Navbar

The root `<nav>` landmark and the context provider. Accepts all `<nav>` props.

PropTypeDefaultDescription`position``"sticky" | "static" | "floating"``"sticky"`How the navbar is anchored to the page.`size``"sm" | "md" | "lg"``"md"`Applies the matching size variants to the header, items, and menu toggle.`maxWidth``"sm" | "md" | "lg" | "xl" | "2xl" | "full"``"lg"`Caps the header's content width via `--navbar-max-width`.`height``string``"4rem"`CSS height for the bar. Sets `--navbar-height` inline.`hideOnScroll``boolean``false`Hide the navbar when scrolling down and reveal on scroll up. Uses a spring transform so layout stays intact.`parentRef``RefObject<HTMLElement | null>``window`Scroll container used by `hideOnScroll`. Defaults to the window.`isMenuOpen``boolean`—Controlled mobile menu open state.`defaultMenuOpen``boolean``false`Initial mobile menu open state (uncontrolled).`onMenuOpenChange``(isOpen: boolean) => void`—Callback when the mobile menu state changes.`shouldBlockScroll``boolean``true`Lock body scroll while the mobile menu is open.`navigate``(href: string) => void`—Programmatic navigation function used by `Navbar.Item` / `Navbar.MenuItem` when pressed.

### Navbar.Header


Horizontal bar wrapper. Renders a `<header>` with the header size and `max-width` slot classes applied.


### Navbar.Brand


Logo / site-title container. Polymorphic — accepts a `render` prop to customize the rendered element. Renders a `<div>` by default.


### Navbar.Content


Horizontal group of nav items. Renders a `<div>`.


### Navbar.Item


A single nav link or action. Renders an `<a>` when `href` is set, otherwise a `<button>`. Polymorphic via the `render` prop.

PropTypeDefaultDescription`href``string`—Destination URL. Uses the parent `Navbar`'s `navigate` for client-side routing, or the browser's default navigation as a fallback. External URLs (`http://`, `https://`) open in a new tab.`isCurrent``boolean``false`Marks the item as the current page. Sets `aria-current="page"` and `data-current="true"`.`forceReload``boolean``false`Skip the `navigate` callback and use `window.location.href` for this item.`render``(props) => ReactElement`—Override the rendered element (e.g. to render a Next.js / React Router `<Link>`).

### Navbar.Label


Truncated text span for use inside `Navbar.Item`.


### Navbar.Separator


Vertical divider. Wraps HeroUI Separator with `orientation="vertical"`.


### Navbar.Spacer


Flex-grow spacer that pushes surrounding content to opposite ends of the header.


### Navbar.MenuToggle


Hamburger button for the mobile menu. Wraps RAC ToggleButton; its selected state is bound to `isMenuOpen`.

PropTypeDefaultDescription`srLabel``string``"Toggle navigation menu"`Screen-reader label for the toggle.`children``ReactNode`—Custom icon. When omitted, the built-in animated hamburger/close icon is used.

### Navbar.Menu


Animated mobile dropdown. Only renders when `isMenuOpen` is true. Fills the viewport below the navbar with `calc(100dvh - var(--navbar-height))`.


### Navbar.MenuItem


An individual item inside `Navbar.Menu`. Same API surface as `Navbar.Item` — but pressing an item automatically closes the mobile menu.

PropTypeDefaultDescription`href``string`—Destination URL. Same client-side routing rules as `Navbar.Item`.`isCurrent``boolean``false`Marks the item as the current page.`forceReload``boolean``false`Skip the `navigate` callback and use `window.location.href`.`render``(props) => ReactElement`—Override the rendered element.

### useNavbar


A hook for reading and mutating navbar state from inside `Navbar`'s children.



```tsx
const { height, isHidden, isMenuOpen, setMenuOpen, navigate } = useNavbar();
```

PropertyTypeDescription`height``string`Current navbar height (as passed via the `height` prop).`isHidden``boolean`Whether the navbar is currently hidden via `hideOnScroll`.`isMenuOpen``boolean`Whether the mobile menu is currently open.`setMenuOpen``(open: boolean) => void`Programmatically open/close the mobile menu.`navigate``((href: string) => void) | undefined`The navigation function passed to `Navbar`, if any.Context Menu

A right-click context menu with nested submenus, selection state, and long-press support for touch.

Segment

A segmented control for toggling between a small set of mutually exclusive options.