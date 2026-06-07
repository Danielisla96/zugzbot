# Cell Switch

Copy MarkdownA toggle switch styled as a settings cell with label and description, ideal for preference panels.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the CellSwitch component and access all parts using dot notation.



```tsx
import {CellSwitch} from "@heroui-pro/react";

<CellSwitch>
  <CellSwitch.Label />
  <CellSwitch.Trigger>
    <CellSwitch.Control />
  </CellSwitch.Trigger>
</CellSwitch>
```


## Controlled

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Feature Announcement

MobileTabletDesktop

## Secondary Group

MobileTabletDesktop

## Settings Group

MobileTabletDesktop

## Variants

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.cell-switch` - Root wrapper (renders as a `label` via HeroUI Switch)


### Element Classes



- `.cell-switch__trigger` - The visible cell row container

- `.cell-switch__trigger--default` - Default variant trigger styling

- `.cell-switch__trigger--secondary` - Secondary variant trigger styling

- `.cell-switch__label` - Leading text label

- `.cell-switch__control` - Switch control wrapper

- `.cell-switch__control--secondary` - Secondary variant control styling


### Variant Classes



- `.cell-switch--secondary` - Secondary variant on the root


## API Reference


### CellSwitch

The root component. Wraps HeroUI Switch with cell-style layout. Clicking anywhere in the cell toggles the switch.

PropTypeDefaultDescription`variant``'default' | 'secondary'``'default'`Visual style variant

Also supports all HeroUI Switch props except `variant`.


### CellSwitch.Trigger


The visible cell row containing the label and switch control.

PropTypeDefaultDescription`children``ReactNode`-Label and control elements

Also supports all native `div` HTML attributes.


### CellSwitch.Label


Leading text label rendered as a `span`.

PropTypeDefaultDescription`children``ReactNode`-Label text

Also supports all native `span` HTML attributes.


### CellSwitch.Control


Switch control. Renders the default HeroUI `Switch.Thumb` when no children are provided.

PropTypeDefaultDescription`children``ReactNode`-Custom control content

Also supports all HeroUI `Switch.Control` props.

Cell Slider

A range slider styled as a settings cell with label, value display, and step configuration.

Checkbox Button Group

A multi-selection button group with card-style checkboxes, icons, and custom indicators.