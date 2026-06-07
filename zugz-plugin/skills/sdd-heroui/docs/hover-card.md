# Hover Card

Copy MarkdownA popover card that appears on hover to preview additional content without navigating away.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the HoverCard component and access all parts using dot notation.



```tsx
import {HoverCard} from "@heroui-pro/react";

<HoverCard>
  <HoverCard.Trigger />
  <HoverCard.Content>
    <HoverCard.Arrow />
  </HoverCard.Content>
</HoverCard>
```


## Controlled

MobileTabletDesktop

## Custom Delays

MobileTabletDesktop

## Placements

MobileTabletDesktop

## With Arrow

MobileTabletDesktop

## With Image

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.hover-card__trigger` - Inline wrapper around the trigger element

- `.hover-card__content` - The floating panel that appears on hover

- `.hover-card__arrow` - Optional pointing arrow connecting content to trigger


### Interactive States



- Entering/Exiting: `[data-entering="true"]` / `[data-exiting="true"]` on `.hover-card__content` (fade + zoom + slide animation)

- Placement: `[data-placement="top|bottom|left|right"]` on `.hover-card__content` and `.hover-card__arrow` (directional animations and arrow rotation)


## API Reference


### HoverCard

The root component. Manages hover state, open/close timing, and context.

PropTypeDefaultDescription`open``boolean`-Controlled open state`defaultOpen``boolean`-Default open state (uncontrolled)`onOpenChange``(open: boolean) => void`-Callback when open state changes`openDelay``number``700`Time in ms before opening after hover`closeDelay``number``300`Time in ms before closing after pointer/focus leave`children``ReactNode`-Trigger and Content elements

### HoverCard.Trigger


Inline wrapper that tracks hover and focus events on its children.


Also supports all native `span` HTML attributes.


### HoverCard.Content


The floating panel. Wraps RAC Popover.

PropTypeDefaultDescription`placement``Placement``'top'`Popover placement relative to the trigger`offset``number``8`Distance from the trigger

Also supports all RAC Popover props except `isOpen` and `triggerRef`.


### HoverCard.Arrow


Optional pointing arrow. Wraps RAC OverlayArrow. Renders a default SVG arrow when no children are provided.

PropTypeDefaultDescription`children``ReactNode`-Custom arrow element

Also supports all RAC OverlayArrow props.

Floating TOC

A floating table of contents that tracks scroll position and provides quick navigation to page sections.

Kanban

A drag-and-drop kanban board with columns, cards, and keyboard navigation for organizing tasks and workflows.