# Carousel

Copy MarkdownA content browsing component for navigating through a collection of images or items, with thumbnails, dots, and navigation controls.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Carousel component and access all parts using dot notation.



```tsx
import {Carousel} from "@heroui-pro/react";

<Carousel>
  <Carousel.Content>
    <Carousel.Item />
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
  <Carousel.Dots />
  <Carousel.Thumbnails>
    <Carousel.Thumbnail />
  </Carousel.Thumbnails>
</Carousel>
```


## Modal Type

The modal type positions navigation arrows outside the content area, ideal for focused overlay-style viewing.


MobileTabletDesktop

## Multiple Slides

Show multiple slides per viewport using Tailwind `basis` utility classes on `Carousel.Item`.


MobileTabletDesktop

## Infinite Loop

Enable infinite looping with `opts={{ loop: true }}`.


MobileTabletDesktop

## Autoplay

Use the `embla-carousel-autoplay` plugin via the `plugins` prop.


MobileTabletDesktop

## API Access

Use the `setApi` prop to get the Embla API instance for programmatic control.


MobileTabletDesktop

## CSS Classes


### Base Classes



- `.carousel` — Root wrapper. Sets `--carousel-gap` for slide spacing.

- `.carousel__viewport-wrapper` — Relative positioning context for navigation buttons.

- `.carousel__viewport` — Overflow-hidden container that clips off-screen slides.

- `.carousel__content` — Flex container holding all slide items.

- `.carousel__item` — Individual slide. Min-width zero, flex-shrink zero, full basis by default.


### Type Modifier Classes



- `.carousel--in-place` — Default type. Navigation arrows positioned inside the viewport area.

- `.carousel--modal` — Overlay-style layout. Arrows positioned far outside the content, flex column with gap.

- `.carousel--miniatures` — Compact layout. Arrows inline with the thumbnail row.


### Navigation Button Classes



- `.carousel__previous` / `.carousel__next` — Absolute-positioned containers for HeroUI Button (variant `tertiary`, size `sm`, icon-only).

- `.carousel__previous--in-place` / `.carousel__next--in-place` — Vertically centered inside the viewport, inset from edges.

- `.carousel__previous--modal` / `.carousel__next--modal` — Vertically centered, positioned outside the viewport bounds.

- `.carousel__previous--miniatures` / `.carousel__next--miniatures` — Relative positioning (inline with thumbnails).


### Dot Indicator Classes



- `.carousel__dots` — Flex container for pagination dots, centered with gap.

- `.carousel__dot` — Individual dot. `bg-default` by default, `bg-accent` when selected. Theme-aware border-radius.


### Thumbnail Classes



- `.carousel__thumbnails` — Flex container for thumbnail navigation. Centered with gap.

- `.carousel__thumbnails--miniatures` — Removes top margin for miniatures type.

- `.carousel__thumbnail` — Individual thumbnail button. `size-16`, `rounded-2xl`. Selected state uses `box-shadow` ring with accent color (no layout shift).


### Interactive States



- Hover: `[data-hovered="true"]` on `.carousel__previous` / `.carousel__next` — applies `bg-default-hover`.

- Pressed: `[data-pressed="true"]` on `.carousel__previous` / `.carousel__next` — applies `bg-default-hover`.

- Disabled: `[aria-disabled="true"]` on `.carousel__previous` / `.carousel__next` — applies disabled opacity.

- Focus visible: `[data-focus-visible="true"]` on buttons, dots, and thumbnails — applies focus ring.

- Dot selected: `[data-selected="true"]` on `.carousel__dot` — applies `bg-accent`.

- Thumbnail selected: `[data-selected="true"]` on `.carousel__thumbnail` — applies accent `box-shadow` ring.

- Thumbnail hover: `[data-hovered="true"]` on `.carousel__thumbnail` — applies `opacity: 0.85`.

- Thumbnail pressed: `[data-pressed="true"]` on `.carousel__thumbnail` — applies `scale(0.95)`.

- Reduced motion: `prefers-reduced-motion: reduce` disables all thumbnail transitions.


### CSS Variables



- `--carousel-gap` — Spacing between slides (default: `calc(var(--spacing) * 4)`).


## API Reference


### Carousel

The root container. Sets up Embla Carousel and provides context to all subcomponents.

PropTypeDefaultDescription`opts``EmblaOptionsType`—Embla Carousel options. See Embla docs.`plugins``EmblaPluginType[]`—Embla Carousel plugins. See Embla plugins.`type``"in-place" | "modal" | "miniatures"``"in-place"`Layout type controlling navigation button positioning.`setApi``(api: EmblaCarouselType) => void`—Callback to receive the Embla API instance for programmatic control.

Also supports all HTML `div` props.


### Carousel.Content


The scrollable slide container. Renders the Embla viewport wrapper and flex content area.


Also supports all HTML `div` props.


### Carousel.Item


An individual slide. Set `className="basis-1/3"` (or similar) to show multiple slides per viewport.


Also supports all HTML `div` props.


### Carousel.Previous


Navigation button to scroll to the previous slide. Automatically disabled when at the start (unless looping).

PropTypeDefaultDescription`icon``ReactNode`—Custom icon to replace the default chevron.

Also supports all HTML `button` props.


### Carousel.Next


Navigation button to scroll to the next slide. Automatically disabled when at the end (unless looping).

PropTypeDefaultDescription`icon``ReactNode`—Custom icon to replace the default chevron.

Also supports all HTML `button` props.


### Carousel.Dots


Pagination dot indicators. Renders one dot per scroll snap. Automatically hidden when there is only one snap point.

PropTypeDefaultDescription`renderDot``(props: { index: number; isSelected: boolean }) => ReactNode`—Custom render function for each dot.

Also supports all HTML `div` props.


### Carousel.Thumbnails


Container for thumbnail navigation buttons. Renders as a `tablist`.


Also supports all HTML `div` props.


### Carousel.Thumbnail


An individual thumbnail button linked to a slide index. Clicking navigates the carousel to that slide.

PropTypeDefaultDescription`index``number`—The slide index this thumbnail navigates to (0-based). Required.`src``string`—Image source URL. Alternatively, pass `children` for custom content.`alt``string``""`Alt text for the thumbnail image.

Also supports all HTML `button` props.


### useCarousel


A hook to access the carousel context from any descendant component.



```tsx
const { api, selectedIndex, scrollSnapCount, canScrollPrev, canScrollNext, scrollPrev, scrollNext, scrollTo } = useCarousel();
```

Returns:

PropertyTypeDescription`api``EmblaCarouselType | undefined`The Embla API instance.`selectedIndex``number`Currently active slide index.`scrollSnapCount``number`Total number of scroll snap points.`canScrollPrev``boolean`Whether scrolling backward is possible.`canScrollNext``boolean`Whether scrolling forward is possible.`scrollPrev``() => void`Scroll to the previous slide.`scrollNext``() => void`Scroll to the next slide.`scrollTo``(index: number) => void`Scroll to a specific slide by index.
Action Bar

A floating toolbar for contextual actions — bulk selection, editing controls, or any set of actions that appear in response to user interaction.

Data Grid

A full-featured data grid with sorting, selection, column resizing, pinned columns, drag-and-drop row reorder, virtualization, and async loading — built on the HeroUI Table.