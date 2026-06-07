# Floating TOC

Copy MarkdownA floating table of contents that tracks scroll position and provides quick navigation to page sections.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the FloatingToc component and access all parts using dot notation.



```tsx
import {FloatingToc} from "@heroui-pro/react";

<FloatingToc>
  <FloatingToc.Trigger />
  <FloatingToc.Bar />
  <FloatingToc.Content>
    <FloatingToc.Item />
  </FloatingToc.Content>
</FloatingToc>
```


## Controlled

MobileTabletDesktop

## Custom Delays

MobileTabletDesktop

## Hierarchical

MobileTabletDesktop

## In Page Context

MobileTabletDesktop

## Left Aligned Bars

MobileTabletDesktop

## Left Placement

MobileTabletDesktop

## Press Mode

MobileTabletDesktop

## Press Mode In Page

MobileTabletDesktop

## Virtualized

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.floating-toc__trigger` - Wrapper around bar indicators, acts as hover/click target

- `.floating-toc__bar` - Individual horizontal indicator line (uses `::after` for the visual bar)

- `.floating-toc__content` - Floating panel that appears on hover/tap

- `.floating-toc__item` - Pressable entry in the expanded content


### Interactive States



- Focus visible: `:focus-visible` or `[data-focus-visible="true"]` on `.floating-toc__trigger` (focus ring)

- Active bar: `[data-active="true"]` on `.floating-toc__bar` (accent color, wider bar)

- Active item: `[data-active="true"]` on `.floating-toc__item` (accent text color)

- Hover item: `:hover` or `[data-hovered="true"]` on `.floating-toc__item` (default background)

- Pressed item: `:active` or `[data-pressed="true"]` on `.floating-toc__item` (darker background)

- Disabled item: `:disabled` or `[aria-disabled="true"]` on `.floating-toc__item` (reduced opacity)


### Data Attributes



- `[data-placement="left|right"]` on `.floating-toc__trigger` - Controls bar growth direction

- `[data-entering="true"]` / `[data-exiting="true"]` on `.floating-toc__content` - Animation states

- `[data-placement="top|bottom|left|right"]` on `.floating-toc__content` - Slide direction


### CSS Variables



- `--floating-toc-bar-width` - Default bar width (default: `16px`)

- `--floating-toc-bar-active-width` - Active bar width (default: `24px`)

- `--floating-toc-bar-height` - Bar thickness (default: `2px`)

- `--floating-toc-bar-level-step` - Width reduction per nesting level (default: `3px`)

- `--floating-toc-bar-gap` - Gap between bars (default: `12px`)

- `--floating-toc-item-indent` - Indent per nesting level (default: `0.75rem`)

- `--floating-toc-level` - Current nesting depth (set via inline style)


## API Reference


### FloatingToc

The root component. Manages open/close state and context.

PropTypeDefaultDescription`placement``'left' | 'right'``'right'`Which side of the page the TOC is on`triggerMode``'hover' | 'press'``'hover'`How the trigger opens the content`open``boolean`-Controlled open state`defaultOpen``boolean`-Default open state (uncontrolled)`onOpenChange``(open: boolean) => void`-Callback when open state changes`openDelay``number``200`Time in ms before opening after hover`closeDelay``number``300`Time in ms before closing after pointer/focus leave`children``ReactNode`-Trigger and Content elements

### FloatingToc.Trigger


Wrapper around bar indicators. Acts as hover/click target.


Also supports all native `span` HTML attributes.


### FloatingToc.Bar


Individual horizontal indicator line.

PropTypeDefaultDescription`active``boolean`-Highlights this bar as the currently active section`level``number`-Nesting depth (1 = top-level). Deeper levels produce shorter bars

Also supports all native `span` HTML attributes.


### FloatingToc.Content


Floating panel that appears on hover/tap. Wraps RAC Popover.

PropTypeDefaultDescription`offset``number``8`Distance from the trigger`placement``Placement`-Override the default placement (auto-derived from root `placement`)

Also supports all RAC Popover props except `isOpen` and `triggerRef`.


### FloatingToc.Item


Pressable entry in the expanded content.

PropTypeDefaultDescription`active``boolean`-Highlights this item as the currently active section`level``number`-Nesting depth (1 = top-level). Deeper levels are indented

Also supports all native `button` HTML attributes.

File Tree

A hierarchical file explorer with expand/collapse, drag-and-drop, icons, and multi-selection support.

Hover Card

A popover card that appears on hover to preview additional content without navigating away.