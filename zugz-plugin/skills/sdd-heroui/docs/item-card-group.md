# Item Card Group

Copy MarkdownA layout component for grouping item cards in list or grid arrangements with section headers and dividers.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the ItemCardGroup component and access all parts using dot notation.



```tsx
import {ItemCardGroup} from "@heroui-pro/react";

<ItemCardGroup>
  <ItemCardGroup.Header>
    <ItemCardGroup.Title />
    <ItemCardGroup.Description />
  </ItemCardGroup.Header>
</ItemCardGroup>
```


## Grid

MobileTabletDesktop

## Grid Three Columns

MobileTabletDesktop

## Linked Accounts

MobileTabletDesktop

## List

MobileTabletDesktop

## Multiple Sections

MobileTabletDesktop

## Notification Preferences

MobileTabletDesktop

## Permission Levels

MobileTabletDesktop

## Pressable

MobileTabletDesktop

## Variants

MobileTabletDesktop

## Wallet List

MobileTabletDesktop

## With Header

MobileTabletDesktop

## CSS Classes


### Base & Variant Classes



- `.item-card-group` - Base group container with rounded corners

- `.item-card-group--default` - Default variant with surface background and shadow

- `.item-card-group--secondary` - Secondary variant with surface-secondary background

- `.item-card-group--tertiary` - Tertiary variant with surface-tertiary background

- `.item-card-group--outline` - Outline variant with border and transparent background

- `.item-card-group--transparent` - Transparent variant with no background, shadow, or rounded corners


### Layout Classes



- `.item-card-group--list` - Vertical stack layout with auto-dividers between cards

- `.item-card-group--grid` - Multi-column grid layout with spaced cards (column count via `--item-card-group-columns`)


### Element Classes



- `.item-card-group__header` - Optional section heading area

- `.item-card-group__title` - Section heading text

- `.item-card-group__description` - Section subtext


### CSS Variables



- `--item-card-group-columns` - Number of grid columns (default: `2`, set via the `columns` prop)


## API Reference


### ItemCardGroup

The root component. Groups item cards with shared styling.

PropTypeDefaultDescription`layout``'list' | 'grid'``'list'`Layout mode`variant``'default' | 'secondary' | 'tertiary' | 'outline' | 'transparent'``'default'`Visual style variant`columns``2 | 3``2`Number of grid columns when `layout` is `"grid"``children``ReactNode`-Item cards, separators, and headers

Also supports all native `div` HTML attributes.


### ItemCardGroup.Header


Optional section heading area.

PropTypeDefaultDescription`children``ReactNode`-Title and description elements

Also supports all native `div` HTML attributes.


### ItemCardGroup.Title


Section heading rendered as an `h3`.

PropTypeDefaultDescription`children``ReactNode`-Title text

Also supports all native `h3` HTML attributes.


### ItemCardGroup.Description


Section subtext rendered as a `p`.

PropTypeDefaultDescription`children``ReactNode`-Description text

Also supports all native `p` HTML attributes.

Item Card

A versatile list card with icon, title, description, and optional trailing actions like switches or selects.

KPI

A key performance indicator card displaying a metric value with trend chip, sparkline chart, and contextual details.