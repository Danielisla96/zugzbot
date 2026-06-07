# Trend Chip

Copy MarkdownA compact chip displaying a trend direction with percentage value, icon indicator, and contextual suffix.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the TrendChip component and access all parts using dot notation.



```tsx
import {TrendChip} from "@heroui-pro/react";

<TrendChip>
  <TrendChip.Prefix />
  <TrendChip.Indicator />
  <TrendChip.Suffix />
</TrendChip>
```


## Custom Indicator

MobileTabletDesktop

## Prefix And Suffix

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## Tabular Nums

MobileTabletDesktop

## Variants

MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.trend-chip` - Base chip wrapper

- `.trend-chip--sm` - Small size (default)

- `.trend-chip--md` - Medium size

- `.trend-chip--lg` - Large size


### Element Classes



- `.trend-chip__indicator` - Trend arrow icon

- `.trend-chip__value` - Numeric value text

- `.trend-chip__prefix` - Text before the value

- `.trend-chip__suffix` - Text after the value


### Data Attributes



- `[data-trend="up"]` / `[data-trend="down"]` / `[data-trend="neutral"]` on the root - Current trend direction


## API Reference


### TrendChip

The root component. Wraps HeroUI Chip with trend-aware coloring and arrow icons.

PropTypeDefaultDescription`trend``'up' | 'down' | 'neutral'``'up'`Trend direction; controls arrow icon and color (success/danger/warning)`size``'sm' | 'md' | 'lg'``'sm'`Size variant`variant``'primary' | 'secondary' | 'soft' | 'tertiary'``'soft'`Chip style variant`children``ReactNode`-Value text, optional Indicator, Prefix, and Suffix sub-components

Also supports all HeroUI Chip props except `children`, `color`, and `size`.


### TrendChip.Indicator


Custom trend arrow icon. When omitted, a default directional arrow is rendered based on the `trend` prop.

PropTypeDefaultDescription`children``ReactNode`-Custom SVG icon element

Also supports all native `svg` HTML attributes.


### TrendChip.Prefix


Text displayed before the value.

PropTypeDefaultDescription`children``ReactNode`-Prefix text

Also supports all native `span` HTML attributes.


### TrendChip.Suffix


Text displayed after the value.

PropTypeDefaultDescription`children``ReactNode`-Suffix text

Also supports all native `span` HTML attributes.

Rating

A star rating input with fractional read-only display, custom icons, sizes, and interactive selection.

Resizable

Resizable panel groups with composable handle types and variants. Built on react-resizable-panels, wired up with HeroUI design tokens.