# Resizable

Copy MarkdownResizable panel groups with composable handle types and variants. Built on react-resizable-panels, wired up with HeroUI design tokens.

Storybook
## About

The `Resizable` component is built on top of react-resizable-panels by bvaughn.


## Usage


Wrap any number of `Resizable.Panel` children in a `Resizable` group, separated by `Resizable.Handle`s. The group sizes each panel as a percentage of its own width (horizontal) or height (vertical).


MobileTabletDesktop

## Anatomy


```tsx
import {Resizable} from "@heroui-pro/react";

export function Example() {
  return (
    <Resizable orientation="horizontal" autoSaveId="app:shell">
      <Resizable.Panel defaultSize={30} minSize={15} maxSize={45}>
        Sidebar
      </Resizable.Panel>
      <Resizable.Handle variant="primary" type="line" withIndicator />
      <Resizable.Panel>Main content</Resizable.Panel>
    </Resizable>
  );
}
```

Every layer is composable: `Resizable.Handle` renders a drag separator, and `Resizable.Indicator` is the inner affordance (pill or drag dots) you can also compose manually.


## Vertical


Set `orientation="vertical"` to stack panels and resize along the Y axis.


MobileTabletDesktop

## Handle Types

Three handle affordances — use the one that matches the importance of the boundary.



- `line` — minimal 1px separator. Default. Works everywhere.

- `drag` — 1px separator + drag grip chip in the middle. Use when users may not realize the boundary is resizable.

- `pill` — 1px separator + rounded pill grip. Highest affordance. Use sparingly, usually for critical boundaries.

- `handle` — standalone pill grip with no separator line. Use when you want a drag affordance that floats between panels without a continuous divider.


MobileTabletDesktop

## Variants

Variants map directly to v3 separator tokens so the handle blends into the surface it sits on.



- `primary` → `separator` (lightest — default, works on the primary background)

- `secondary` → `separator-secondary` (for `background-secondary` / `surface`)

- `tertiary` → `separator-tertiary` (for darker tertiary surfaces)


MobileTabletDesktop

## Nested Groups

Panels can contain nested `Resizable` groups. Use different orientations to build editor-style three-pane layouts.


MobileTabletDesktop

## Collapsible Panels

Set `collapsible` and `collapsedSize` on a panel to let it collapse when dragged below its minimum size. Use `handleRef` for imperative collapse/expand.


MobileTabletDesktop

## With Indicator

Set `withIndicator` on a `line`-type handle to render the drag-dots affordance inline, or compose `Resizable.Indicator` directly for full control.


MobileTabletDesktop

## Persisted Sizes


### Client-only apps

Pass `autoSaveId` to persist panel sizes to `localStorage`. Reloads restore the previous layout automatically. This is powered by `react-resizable-panels` and works out of the box for client-only apps (Vite, Storybook, etc.).



```tsx
<Resizable autoSaveId="app:panels">
  <Resizable.Panel defaultSize={30} minSize={20}>Sidebar</Resizable.Panel>
  <Resizable.Handle />
  <Resizable.Panel defaultSize={70}>Main</Resizable.Panel>
</Resizable>
```


### SSR-friendly persistence with cookies

On SSR frameworks, `localStorage` isn't available on the server, so the first paint uses the default sizes and the client re-renders after hydration. To avoid this flash, use `createCookieStorage` — a built-in helper that returns a cookie-backed `PanelGroupStorage`. Pass it to the `storage` prop alongside `autoSaveId`:



```tsx
import {createCookieStorage, Resizable} from "@heroui-pro/react";

const storage = createCookieStorage();

export function ResizableLayout() {
  return (
    <Resizable autoSaveId="app:panels" storage={storage}>
      <Resizable.Panel defaultSize={30} minSize={20}>
        Sidebar
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel defaultSize={70}>Main</Resizable.Panel>
    </Resizable>
  );
}
```

Reads fall back to `localStorage` for client-only apps; writes go to both cookie and `localStorage` so cross-tab readers stay in sync.

Next.js App Router

On the server, read the cookie and forward the saved layout to each panel via `defaultSize`:



```tsx
// app/layout.tsx
import {cookies} from "next/headers";

export default async function Layout({children}: {children: React.ReactNode}) {
  const store = await cookies();
  const layout = store.get("react-resizable-panels:app:panels");

  let defaultSizes = [30, 70];

  if (layout?.value) {
    try {
      const parsed = JSON.parse(layout.value);
      if (Array.isArray(parsed)) defaultSizes = parsed;
    } catch {
      // ignore malformed cookie
    }
  }

  return <ResizableLayout defaultSizes={defaultSizes}>{children}</ResizableLayout>;
}
```


## API Reference


### Resizable

PropTypeDefaultDescription`orientation``"horizontal" | "vertical"``"horizontal"`Layout direction.`autoSaveId``string`—Unique id used to persist panel sizes to `localStorage`.`onLayout``(sizes: number[]) => void`—Fires on every layout change (including while dragging).`storage``PanelGroupStorage``localStorage`Custom storage implementation for SSR-safe persistence.`id``string`—Unique identifier (required for nested groups).`handleRef``Ref<ImperativePanelGroupHandle>`—Imperative handle (`setLayout`, `getLayout`).

### Resizable.Panel

PropTypeDefaultDescription`defaultSize``number`—Initial panel size (percent).`minSize``number`—Minimum size (percent).`maxSize``number`—Maximum size (percent).`collapsible``boolean``false`Whether the panel can collapse to `collapsedSize`.`collapsedSize``number`—Size applied when collapsed.`id``string`—Unique id (required with `autoSaveId` + `collapsible`).`order``number`—Panel render order (for conditional rendering).`onCollapse``() => void`—Fires when the panel collapses.`onExpand``() => void`—Fires when the panel expands.`onResize``(size: number) => void`—Fires on resize.

### Resizable.Handle

PropTypeDefaultDescription`type``"line" | "drag" | "pill" | "handle"``"line"`Affordance style. `handle` is a standalone pill grip without the separator line.`variant``"primary" | "secondary" | "tertiary"``"primary"`Emphasis level. Maps to separator tokens.`withIndicator``boolean`—Sugar: render the default indicator inside the handle.`disabled``boolean``false`Whether the handle is disabled.`onDragging``(isDragging: boolean) => void`—Fires when drag starts/ends.

### Resizable.Indicator

PropTypeDefaultDescription`type``"pill" | "drag"``"pill"`Affordance style when no children are provided.`children``ReactNode`—Custom content. Overrides the default affordance.

## CSS Variables

The root `.resizable` element exposes the following variables for easy customization:

VariableDefaultDescription`--resizable-handle-size``1px`Visible separator thickness.`--resizable-handle-hit-area``8px`Invisible grab area around the line.`--resizable-handle-color``var(--color-separator)`Default handle color.`--resizable-handle-color-hover``var(--color-separator-secondary)`Hover color.`--resizable-handle-color-active``var(--color-accent-soft)`Active/dragging color.`--resizable-indicator-pill-width``6px`Pill indicator short axis.`--resizable-indicator-pill-height``32px`Pill indicator long axis.`--resizable-indicator-drag-size``12px`Drag dots size.
Trend Chip

A compact chip displaying a trend direction with percentage value, icon indicator, and contextual suffix.

Cell Color Picker

A compact color picker styled as a settings cell with preset palettes and custom color input.