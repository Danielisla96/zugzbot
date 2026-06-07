# AppLayout

Copy MarkdownA scaffold layout that composes a full-height sidebar, a sticky navbar, a main content area, and an optional right-side aside panel.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

`AppLayout` is a controlled scaffold that wires together the `Sidebar`, `Navbar`, an optional right-side `aside` panel, and the `main` region. Pass the sidebar, navbar, and aside as props and render the page content as children:



```tsx
import {AppLayout, Navbar, Sidebar} from "@heroui-pro/react";

export function DashboardLayout({children}) {
  return (
    <AppLayout
      aside={<DetailsPanel />}
      navbar={
        <Navbar maxWidth="full">
          <Navbar.Header>
            <AppLayout.MenuToggle />
            <Sidebar.Trigger />
            {/* … */}
            <Navbar.Spacer />
            <AppLayout.AsideTrigger />
          </Navbar.Header>
        </Navbar>
      }
      sidebar={
        <>
          <Sidebar>{/* … */}</Sidebar>
          <Sidebar.Mobile>{/* … */}</Sidebar.Mobile>
        </>
      }
    >
      {children}
    </AppLayout>
  );
}
```

Under the hood `AppLayout` renders a `Sidebar.Provider`, so you can use all of the Sidebar and Navbar compound parts inside without additional setup.



Do not wrap `AppLayout` with your own `Sidebar.Provider`. It's already set up internally and would create a nested context that shadows the layout's sidebar state. Configure the sidebar through `AppLayout`'s `sidebarOpen`, `defaultSidebarOpen`, `onSidebarOpenChange`, `sidebarSide`, `sidebarVariant`, `sidebarCollapsible`, `navigate`, `reduceMotion`, and `toggleShortcut` props — they're all forwarded to the internal provider.



## Collapsible


Set `sidebarCollapsible="icon"` to let the sidebar collapse into an icon-only rail. Press `Cmd+B` (or `Ctrl+B`) or click the sidebar trigger to toggle.


MobileTabletDesktop

## Offcanvas

With `sidebarCollapsible="offcanvas"` the sidebar slides fully off-screen when collapsed, giving the main content area the full viewport width.


MobileTabletDesktop

## Inset Sidebar

`sidebarVariant="inset"` renders the sidebar inside a bordered card while still filling the full viewport height. The main content sits next to it flush with the viewport edge.


MobileTabletDesktop

## Floating Sidebar

`sidebarVariant="floating"` detaches the sidebar from the viewport edge with rounded corners and a shadow, a common pattern for product dashboards.


MobileTabletDesktop

## Inset Dashboard

A full dashboard composition combining the `inset` sidebar variant, offcanvas collapse behavior, KPIs, and a rich user dropdown.


MobileTabletDesktop

## Docs Site

A documentation-style layout with a search bar, theme segment, and a grouped navigation sidebar.


MobileTabletDesktop

## With Breadcrumbs

A project-management-style navbar with a multi-level breadcrumb trail reflecting the current navigation depth.


MobileTabletDesktop

## With Aside

Pass content to the `aside` prop to render a right-side panel — ideal for conversation details, metadata, or contextual tooling. The aside is hidden below the desktop breakpoint and slides off-screen when closed.


Use `AppLayout.AsideTrigger` inside the navbar to let users toggle the aside open and closed.


MobileTabletDesktop

## Content Scroll Mode

By default, `AppLayout` uses page-level scrolling (`scrollMode="page"`). Set `scrollMode="content"` to keep the shell fixed to the viewport and move vertical scrolling into the main column instead.


This is useful for app shells where the sidebar and navbar should stay pinned while only the content region scrolls.


MobileTabletDesktop

## Complex

A full-featured layout combining an agent-hub-style sidebar, compact spacing, multiple menu groups, chips, a user dropdown, and a navbar with breadcrumbs and actions.


MobileTabletDesktop

## Resizable Sidebar and Aside

Opt into user-resizable panels with `sidebarResizable` / `asideResizable`. Both flags render the shell inside a `Resizable` group so users can drag the handles to adjust the layout. Sizes are persisted when `resizableAutoSaveId` is set.


`sidebarResizable` requires `sidebarCollapsible="offcanvas"` or `"none"` — the icon-rail mode is not compatible with free-resize yet and falls back to the static layout.


MobileTabletDesktop
MobileTabletDesktop

## Persisted State

When `AppLayout` is uncontrolled (no `sidebarOpen` / `asideOpen` props), it automatically writes `sidebar_state` and `aside_state` cookies on every toggle. To restore the state across page loads, read those cookies server-side and pass them as `defaultSidebarOpen` / `defaultAsideOpen`. Because the server renders with the correct state from the start, there is no flash and no hydration mismatch.


### Next.js App Router



```tsx
// app/layout.tsx
import {cookies} from "next/headers";
import {AppLayout, Navbar, Sidebar} from "@heroui-pro/react";

export default async function Layout({children}: {children: React.ReactNode}) {
  const store = await cookies();
  const defaultSidebarOpen = store.get("sidebar_state")?.value !== "false";
  const defaultAsideOpen = store.get("aside_state")?.value !== "false";

  return (
    <AppLayout
      defaultSidebarOpen={defaultSidebarOpen}
      defaultAsideOpen={defaultAsideOpen}
      sidebar={<MySidebar />}
      navbar={<MyNavbar />}
    >
      {children}
    </AppLayout>
  );
}
```


### Vite / CSR

For client-only apps you can read the cookies with a library like `js-cookie`:



```tsx
import Cookies from "js-cookie";

const defaultSidebarOpen = Cookies.get("sidebar_state") !== "false";
const defaultAsideOpen = Cookies.get("aside_state") !== "false";
```


Using `Sidebar.Provider` on its own without `AppLayout`? It writes the same `sidebar_state` cookie automatically. See Sidebar > Persisted State.



## Aside Keyboard Shortcut


Pass `asideToggleShortcut` to bind a keyboard combo to `toggleAside()`. The shortcut parser is shared with `toggleShortcut` — same `mod+.`, `shift+?`, `ctrl+alt+k` syntax. Disabled by default to avoid swallowing `Cmd+.` on macOS.



```tsx
<AppLayout asideToggleShortcut="mod+." aside={<DetailsPanel />}>
  {children}
</AppLayout>
```


## Mobile Aside Sheet

By default the aside is hidden below `1024px`. Set `asideMobile="sheet"` to render it in a full-height `Sheet` instead, toggled by the same `AppLayout.AsideTrigger`. Use the `<AppLayout.MobileAside>` slot to provide different mobile content (e.g. a condensed view):



```tsx
<AppLayout asideMobile="sheet" aside={<FullDetails />}>
  <AppLayout.MobileAside>
    <CondensedDetails />
  </AppLayout.MobileAside>
  {children}
</AppLayout>
```

If no `MobileAside` slot is provided, the `aside` prop is used inside the sheet.


## Toolbar and Footer


Pass `toolbar` to render a second sticky row below the navbar, and `footer` for a pinned row at the bottom of the body column. Both are optional and tree-shake when unused.


MobileTabletDesktop

## Mobile Behavior

On viewports below `768px` the desktop sidebar is hidden. Use `AppLayout.MenuToggle` inside the `Navbar.Header` to open a `Sidebar.Mobile` sheet:



```tsx
<AppLayout
  navbar={
    <Navbar maxWidth="full">
      <Navbar.Header>
        <AppLayout.MenuToggle />
        <Sidebar.Trigger />
        {/* … */}
      </Navbar.Header>
    </Navbar>
  }
  sidebar={
    <>
      <Sidebar>{/* desktop sidebar */}</Sidebar>
      <Sidebar.Mobile>{/* mobile sheet sidebar */}</Sidebar.Mobile>
    </>
  }
>
  {children}
</AppLayout>
```



- `AppLayout.MenuToggle` is mobile-only via CSS — it's hidden on desktop and visible below the `md` breakpoint.

- `Sidebar.Trigger` is hidden on mobile inside an `AppLayout` so the two controls never appear together.


## Client-Side Routing

`AppLayout` forwards its `navigate` prop to both the internal `Sidebar.Provider` and any `Navbar` rendered inside it via the `navbar` prop. Pass your router's push function once and every `Sidebar.MenuItem`, `Navbar.Item`, and `Navbar.MenuItem` with an `href` will route through it:


### Next.js (App Router)



```tsx
"use client";

import {useRouter} from "next/navigation";
import {AppLayout} from "@heroui-pro/react";

export function DashboardLayout({children}) {
  const router = useRouter();

  return (
    <AppLayout navigate={router.push} navbar={/* … */} sidebar={/* … */}>
      {children}
    </AppLayout>
  );
}
```


A `Navbar` rendered via the `navbar` prop inherits the layout's `navigate` automatically. If you set a `navigate` prop directly on the `Navbar`, that value wins — useful when the navbar needs a different router (e.g. an external shell app). See the Navbar routing guide for non-layout usage.



### React Router



```tsx
import {useNavigate} from "react-router";
import {AppLayout} from "@heroui-pro/react";

export function DashboardLayout({children}) {
  const navigate = useNavigate();

  return (
    <AppLayout navigate={navigate} navbar={/* … */} sidebar={/* … */}>
      {children}
    </AppLayout>
  );
}
```


### TanStack Router


```tsx
import {useRouter} from "@tanstack/react-router";
import {AppLayout} from "@heroui-pro/react";

export function DashboardLayout({children}) {
  const router = useRouter();

  return (
    <AppLayout
      navigate={(href) => router.navigate({to: href})}
      navbar={/* … */}
      sidebar={/* … */}
    >
      {children}
    </AppLayout>
  );
}
```


## Controlled State

Both the sidebar and aside panel can be controlled via props on `AppLayout`:



```tsx
const [sidebarOpen, setSidebarOpen] = useState(true);
const [asideOpen, setAsideOpen] = useState(true);

<AppLayout
  sidebarOpen={sidebarOpen}
  onSidebarOpenChange={setSidebarOpen}
  asideOpen={asideOpen}
  onAsideOpenChange={setAsideOpen}
  aside={<DetailsPanel />}
  navbar={<AppNavbar />}
  sidebar={<AppSidebar />}
>
  {children}
</AppLayout>
```

Inside children, you can reach for `useSidebar` to read or toggle the sidebar state, and `useAppLayout` to read or toggle the aside state.


## Navbar Adaptation


When a `Navbar` is rendered inside `AppLayout` (via the `navbar` prop), it automatically detects the parent layout and:



- Drops its own sticky/floating/static positioning (the `AppLayout` header element owns positioning).

- Clears border, margin, radius, and shadow overrides from `position="floating"`.

- Sets `data-in-app-layout="true"` so you can style it further if needed.


This means you can reuse the same `Navbar` composition standalone or inside an `AppLayout` without changing its markup.


## CSS Classes



### Base Classes



- `.app-layout__body` — The right column containing the navbar header and main content. Flex column, `min-w-0 flex-1`.

- `.app-layout__header` — The sticky header row that wraps the `navbar` prop. `sticky top-0 z-40 shrink-0`.

- `.app-layout__main` — Primary content area. `min-w-0 flex-1`.


### Aside Classes



- `.app-layout__aside` — The right-side aside panel. Sticky, full viewport height, with a left border. Hidden below the `1024px` breakpoint.

- `.app-layout__aside[data-state="closed"]` — Collapsed state. Width transitions to `0` and the inner content slides off via `translateX(100%)`.

- `.app-layout__aside-trigger` — The aside toggle button. Hidden below `1024px` to match the aside itself.


### Toggle Classes



- `.app-layout__menu-toggle` — The mobile-only sidebar menu toggle. Hidden on desktop, `display: inline-flex` below `768px`.


### CSS Variables



- `--app-layout-aside-width` — Width of the aside panel when open (default: `320px`).

- `--app-layout-aside-duration` — Aside open/close transition duration (default: `200ms`).

The sidebar width (`--sidebar-width`), collapsed width (`--sidebar-width-collapsed`), and navbar height (`--navbar-height`) are inherited from the Sidebar and Navbar components.


### Interactive States




- Mobile (`≤768px`): The desktop `Sidebar` and `Sidebar.Trigger` inside `[data-app-layout]` are hidden, and `AppLayout.MenuToggle` becomes visible. Use `Sidebar.Mobile` for the mobile sheet.

- Tablet/Mobile (`≤1024px`): The aside panel and aside trigger are hidden.

- Aside closed: `[data-state="closed"]` on `.app-layout__aside` collapses width to `0` and slides the inner content off-screen.

- Reduced motion: `@media (prefers-reduced-motion: reduce)` — disables aside width/transform transitions.


## API Reference


### AppLayout

The root scaffold. Wraps a `Sidebar.Provider` and renders the sidebar, header (with the `navbar`), main content, and optional aside.

PropTypeDefaultDescription`sidebar``ReactNode`—Sidebar content rendered in the full-height side panel. Typically a `<Sidebar>` element alongside a `<Sidebar.Mobile>`.`navbar``ReactNode`—Navbar content rendered inside the sticky header row of the body column.`aside``ReactNode`—Content rendered in the optional right-side aside panel (full viewport height, hidden on mobile).`children``ReactNode`—Main content area. Rendered inside a `<main>` element.`sidebarOpen``boolean`—Controlled sidebar open state.`defaultSidebarOpen``boolean``true`Initial sidebar open state (uncontrolled).`onSidebarOpenChange``(open: boolean) => void`—Callback when the sidebar open state changes.`sidebarSide``"left" | "right"``"left"`Which side the sidebar is on. Forwarded to `Sidebar.Provider`.`sidebarVariant``"sidebar" | "floating" | "inset"``"sidebar"`Sidebar visual variant. Forwarded to `Sidebar.Provider`.`sidebarCollapsible``"icon" | "offcanvas" | "none"``"icon"`Sidebar collapse behavior. Forwarded to `Sidebar.Provider`.`asideOpen``boolean`—Controlled aside open state.`defaultAsideOpen``boolean``true`Initial aside open state (uncontrolled).`onAsideOpenChange``(open: boolean) => void`—Callback when the aside open state changes.`navigate``(href: string) => void`—Programmatic navigation function for client-side routing. Forwarded to the internal `Sidebar.Provider` and inherited by any `Navbar` rendered inside the layout (unless the `Navbar` sets its own `navigate`).`reduceMotion``boolean``false`Disables nested `Sidebar.Menu` expand/collapse animations. The user's reduced-motion preference is still respected.`toggleShortcut``string | false | null``"mod+b"`Keyboard shortcut that toggles the sidebar. Forwarded to the internal `Sidebar.Provider`. See Sidebar › Keyboard Shortcut for the combo-string syntax. Pass `false` or `null` to disable.`asideToggleShortcut``string | false | null`—Keyboard shortcut that toggles the aside. Disabled by default. Same combo syntax as `toggleShortcut`.`asideMobile``"hidden" | "sheet"``"hidden"`How the aside behaves on viewports `≤1024px`. `"sheet"` renders the aside in a `Sheet` toggled by the same `AsideTrigger`.`sidebarResizable``boolean``false`Make the sidebar user-resizable. Requires `sidebarCollapsible="offcanvas"` or `"none"`.`sidebarDefaultSize``number``18`Initial sidebar size (percent) when resizable.`sidebarMinSize``number``12`Minimum sidebar size (percent) when resizable.`sidebarMaxSize``number``30`Maximum sidebar size (percent) when resizable.`asideResizable``boolean``false`Make the aside user-resizable.`asideDefaultSize``number``20`Initial aside size (percent) when resizable.`asideMinSize``number``15`Minimum aside size (percent) when resizable.`asideMaxSize``number``40`Maximum aside size (percent) when resizable.`resizableAutoSaveId``string`—`autoSaveId` forwarded to the internal `Resizable` group (enables persisted panel sizes).`scrollMode``"page" | "content"``"page"`Controls which element owns vertical scrolling. `"page"` keeps window/body scrolling; `"content"` makes the main column scroll while the shell stays fixed to the viewport.`toolbar``ReactNode`—Optional second sticky row rendered below the navbar.`footer``ReactNode`—Optional row pinned to the bottom of the body column.

Also supports all `<div>` props — they are forwarded to the underlying `Sidebar.Provider`.


### AppLayout.MenuToggle


An icon button that opens the mobile sidebar sheet (`Sidebar.Mobile`). Mobile-only — hidden on viewports above `768px`. Place it inside your `Navbar.Header` alongside the `Sidebar.Trigger`.

PropTypeDefaultDescription`children``ReactNode``<Bars />`Custom icon.`tooltip``ReactNode`—Tooltip content. When omitted, no tooltip is rendered.`tooltipProps``AppLayoutTooltipProps`—Props forwarded to the internal `Tooltip` (delay, placement, etc.).

Also supports all HeroUI Button props.


### AppLayout.AsideTrigger


An icon button that toggles the aside panel open and closed. Hidden below the desktop breakpoint. Place it inside the navbar (typically at the end of `Navbar.Content`).

PropTypeDefaultDescription`children``ReactNode``<LayoutSideContentRight />`Custom icon.`closedTooltip``ReactNode`—Tooltip content when the aside is closed.`openTooltip``ReactNode`—Tooltip content when the aside is open.`tooltipProps``AppLayoutTooltipProps`—Props forwarded to the internal `Tooltip`. Applied to both open and closed states.

Also supports all HeroUI Button props.


The rendered button exposes `aria-expanded` and `data-state="open" | "closed"` so you can style it contextually.


### AppLayout.MobileAside


A marker component that provides alternative content for the mobile aside sheet (used when `asideMobile="sheet"`). Place it as a direct child of `AppLayout`.

PropTypeDescription`children``ReactNode`Mobile-only aside content. Replaces the `aside`.

### AppLayoutTooltipProps


Shared tooltip customization for `AppLayout.MenuToggle` and `AppLayout.AsideTrigger`.

PropTypeDefaultDescription`placement``"top" | "bottom" | "left" | "right"``"bottom"`Tooltip placement relative to the trigger.`delay``number`—Delay in ms before showing the tooltip.`closeDelay``number`—Delay in ms before hiding the tooltip.`offset``number`—Offset from the trigger element in px.`showArrow``boolean``false`Whether to show the tooltip arrow.`isDisabled``boolean``false`Whether the tooltip is disabled.`className``string`—Class name applied to the `Tooltip.Content` element.

### useAppLayout


A hook for reading and mutating the aside state from inside `AppLayout`'s children.



```tsx
const appLayout = useAppLayout();

if (appLayout) {
  const {isAsideOpen, setAsideOpen, toggleAside} = appLayout;
}
```

PropertyTypeDescription`isAsideOpen``boolean`Whether the aside panel is currently open.`setAsideOpen``(open: boolean) => void`Set the aside open state.`toggleAside``() => void`Toggle the aside open/closed.
The hook returns `null` when called outside of an `AppLayout`. For sidebar state, use `useSidebar` — the `AppLayout` sets up the same provider internally.

Radio Button Group

A single-selection button group with card-style radio options, icons, and custom indicators.

Command

A command palette with fuzzy search, keyboard navigation, and nested groups for quick actions.