# Item Card

Copy MarkdownA versatile list card with icon, title, description, and optional trailing actions like switches or selects.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the ItemCard component and access all parts using dot notation.



```tsx
import {ItemCard} from "@heroui-pro/react";

<ItemCard>
  <ItemCard.Icon />
  <ItemCard.Content>
    <ItemCard.Title />
    <ItemCard.Description />
  </ItemCard.Content>
  <ItemCard.Action />
</ItemCard>
```


## Device List

MobileTabletDesktop

## Email Setting

MobileTabletDesktop

## Pressable

MobileTabletDesktop

## Title Only

MobileTabletDesktop

## Variants

MobileTabletDesktop

## Vertical Stack

MobileTabletDesktop

## Wallet Card

MobileTabletDesktop

## With Multi Select

MobileTabletDesktop

## With Select

MobileTabletDesktop

## With Switch

MobileTabletDesktop

## Without Icon

MobileTabletDesktop

## CSS Classes


### Base & Variant Classes



- `.item-card` - Base horizontal row layout with rounded corners

- `.item-card--default` - Default variant with surface background and shadow

- `.item-card--secondary` - Secondary variant with surface-secondary background

- `.item-card--tertiary` - Tertiary variant with surface-tertiary background

- `.item-card--outline` - Outline variant with border and transparent background

- `.item-card--transparent` - Transparent variant with no background or shadow


### Element Classes



- `.item-card__icon` - Leading icon container (rounded square with default background)

- `.item-card__content` - Title + description area, fills available space

- `.item-card__title` - Primary label text (truncated)

- `.item-card__description` - Secondary text (truncated)

- `.item-card__action` - Trailing slot for buttons, toggles, etc.


## API Reference


### ItemCard

The root component. Renders a horizontal row container.

PropTypeDefaultDescription`variant``'default' | 'secondary' | 'tertiary' | 'outline' | 'transparent'``'default'`Visual style variant`children``ReactNode`-Card content`className``string`-Additional CSS class`render``DOMRenderFunction`-Custom render function to override the default `div` element

Also supports all native `div` HTML attributes.


### ItemCard.Icon


Leading icon container.

PropTypeDefaultDescription`children``ReactNode`-Icon element

Also supports all native `div` HTML attributes.


### ItemCard.Content


Container for title and description, fills available space.

PropTypeDefaultDescription`children``ReactNode`-Title and description elements

Also supports all native `div` HTML attributes.


### ItemCard.Title


Primary label text rendered as a `span`.

PropTypeDefaultDescription`children``ReactNode`-Title text

Also supports all native `span` HTML attributes.


### ItemCard.Description


Secondary descriptive text rendered as a `span`.

PropTypeDefaultDescription`children``ReactNode`-Description text

Also supports all native `span` HTML attributes.


### ItemCard.Action


Trailing action slot for buttons, toggles, or other controls.

PropTypeDefaultDescription`children``ReactNode`-Action content

Also supports all native `div` HTML attributes.

Kanban

A drag-and-drop kanban board with columns, cards, and keyboard navigation for organizing tasks and workflows.

Item Card Group

A layout component for grouping item cards in list or grid arrangements with section headers and dividers.