# Radio Button Group

Copy MarkdownA single-selection button group with card-style radio options, icons, and custom indicators.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the RadioButtonGroup component and access all parts using dot notation.



```tsx
import {RadioButtonGroup} from "@heroui-pro/react";

<RadioButtonGroup>
  <RadioButtonGroup.Item>
    <RadioButtonGroup.ItemIcon />
    <RadioButtonGroup.ItemContent />
    <RadioButtonGroup.Indicator />
  </RadioButtonGroup.Item>
</RadioButtonGroup>
```


## Delivery And Payment

MobileTabletDesktop

## Subscription Plans

MobileTabletDesktop

## Controlled

MobileTabletDesktop

## Custom Indicator

MobileTabletDesktop

## Disabled Group

MobileTabletDesktop

## Grid Layout

MobileTabletDesktop

## Icon Cards

MobileTabletDesktop

## No Indicator

MobileTabletDesktop

## Render Prop Children

MobileTabletDesktop

## With Icons

MobileTabletDesktop

## With Ripple

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.radio-button-group` - Base RadioGroup container with flex layout


### Layout Classes



- `.radio-button-group--grid` - Grid layout mode


### Element Classes



- `.radio-button-group__item` - Card-like radio button with border and selection ring

- `.radio-button-group__indicator` - Positioned top-right indicator (radio dot or custom icon)

- `.radio-button-group__item-content` - Text/content area wrapping Radio.Content

- `.radio-button-group__item-icon` - Leading icon container


### Interactive States



- Selected: `[data-selected="true"]` on `.radio-button-group__item` (accent ring)

- Focus visible: `:focus-visible` or `[data-focus-visible="true"]` on `.radio-button-group__item` (focus ring)

- Disabled: `:disabled` or `[aria-disabled="true"]` on `.radio-button-group__item` (reduced opacity)


### CSS Variables



- `--radio-button-group-item-radius` - Border radius of items (default: `var(--radius-2xl)`)


## API Reference


### RadioButtonGroup

The root component. Wraps HeroUI RadioGroup with card-style layout.

PropTypeDefaultDescription`layout``'flex' | 'grid'``'flex'`Layout mode for items

Also supports all HeroUI RadioGroup props.


### RadioButtonGroup.Item


A selectable card wrapping HeroUI Radio. Supports render prop children for accessing selection state.


Also supports all HeroUI Radio props.


### RadioButtonGroup.Indicator


Selection indicator positioned at the top-right of the item.



- No children: renders the default HeroUI radio dot (Control + Indicator)

- With children: renders a custom icon that appears only when selected

PropTypeDefaultDescription`children``ReactNode`-Custom indicator icon (shown when selected)

Also supports all native `span` HTML attributes.


### RadioButtonGroup.ItemContent


Content area for title and description text. Wraps HeroUI `Radio.Content`.

PropTypeDefaultDescription`children``ReactNode`-Content elements

Also supports all native `div` HTML attributes.


### RadioButtonGroup.ItemIcon


Leading icon container.

PropTypeDefaultDescription`children``ReactNode`-Icon element

Also supports all native `div` HTML attributes.

Number Stepper

A numeric input with increment/decrement buttons, min/max bounds, step intervals, and custom formatting.

AppLayout

A scaffold layout that composes a full-height sidebar, a sticky navbar, a main content area, and an optional right-side aside panel.