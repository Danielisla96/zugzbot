# Rating

Copy MarkdownA star rating input with fractional read-only display, custom icons, sizes, and interactive selection.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Rating component and access all parts using dot notation.



```tsx
import {Rating} from "@heroui-pro/react";

<Rating>
  <Rating.Item />
</Rating>
```


## Controlled

MobileTabletDesktop

## Custom Color

MobileTabletDesktop

## Custom Icon Heart

MobileTabletDesktop

## Custom Icon Per Item

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Product Review

MobileTabletDesktop

## Read Only

MobileTabletDesktop

## Read Only Fractional

MobileTabletDesktop

## Render Function

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## With Label

MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.rating` - Base rating group container

- `.rating--sm` - Small size (no gap, smaller icons)

- `.rating--md` - Medium size (1px gap, default)

- `.rating--lg` - Large size (2px gap, larger icons)


### Element Classes



- `.rating__item` - Individual rating option

- `.rating__item--sm` / `.rating__item--md` / `.rating__item--lg` - Item size variants

- `.rating__icon` - Icon wrapper (star, heart, etc.)

- `.rating__icon-partial` - Overlay for fractional read-only display


### Interactive States



- Active: `[data-active="true"]` on `.rating__item` (icon turns active color)

- Read-only: `[data-readonly="true"]` on `.rating__item` (default cursor, no press scale)

- Focus visible: `[data-focus-visible="true"]` on `.rating` or `.rating__item` (focus ring)

- Pressed: `:active` or `[data-pressed="true"]` on `.rating__item` (scale down to 0.8)

- Disabled: `[data-disabled="true"]` on `.rating` or `:disabled` / `[aria-disabled="true"]` on `.rating__item` (reduced opacity)


### CSS Variables



- `--rating-active-color` - Color for active/selected stars (default: `var(--color-warning)`)

- `--rating-inactive-color` - Color for inactive stars (default: `var(--color-surface-tertiary)`)

- `--rating-partial` - Width of the partial overlay for fractional display (set via inline style)


## API Reference


### Rating

The root component. Wraps RAC RadioGroup in horizontal orientation.

PropTypeDefaultDescription`size``'sm' | 'md' | 'lg'``'md'`Size variant`value``number`-The current rating value (controlled)`defaultValue``number`-The initial rating value (uncontrolled)`onValueChange``(value: number) => void`-Handler called when the rating value changes`icon``ReactNode`-Custom icon element for all rating items

Also supports all RAC RadioGroup props except `defaultValue`, `onChange`, `orientation`, and `value`.


### Rating.Item


An individual rating option. Wraps RAC Radio.

PropTypeDefaultDescription`value``number`-Required. The numeric value for this item`children``ReactNode | ((props: RatingItemRenderProps) => ReactNode)`-Custom content or render function

Also supports all RAC Radio props except `children` and `value`.


### RatingItemRenderProps


When using the render prop pattern on `Rating.Item`:

PropertyTypeDescription`isActive``boolean`Whether this item is at or below the current rating`isPartial``boolean`Whether this item shows a partial fill (read-only fractional)`partialPercent``number`The fill percentage for partial display (0-100)
Pressable Feedback

A press interaction layer adding ripple, highlight, hold-to-confirm, and progress feedback effects to any element.

Trend Chip

A compact chip displaying a trend direction with percentage value, icon indicator, and contextual suffix.