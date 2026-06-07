# Cell Select

Copy MarkdownA compact select input styled as a settings cell, ideal for preference panels and configuration forms.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the CellSelect component and access all parts using dot notation.



```tsx
import {CellSelect} from "@heroui-pro/react";

<CellSelect>
  <CellSelect.Label />
  <CellSelect.Indicator />
  <CellSelect.Trigger />
  <CellSelect.Value />
  <CellSelect.Popover />
</CellSelect>
```


## Controlled

MobileTabletDesktop

## Custom Value

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Font Family

MobileTabletDesktop

## Settings Group

MobileTabletDesktop

## Variants

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.cell-select` - Root wrapper


### Element Classes



- `.cell-select__trigger` - The visible cell row (wraps Select.Trigger)

- `.cell-select__trigger--default` - Default variant trigger styling

- `.cell-select__trigger--secondary` - Secondary variant trigger styling

- `.cell-select__label` - Leading text label

- `.cell-select__value` - Selected value display

- `.cell-select__indicator` - Chevron icon

- `.cell-select__popover` - Dropdown panel


## API Reference


### CellSelect

The root component. Wraps HeroUI Select with cell-style layout.

PropTypeDefaultDescription`variant``'default' | 'secondary'``'default'`Visual style variant

Also supports all HeroUI Select props except `variant`.


### CellSelect.Trigger


The visible cell row containing label, value, and indicator.


Also supports all HeroUI `Select.Trigger` props.


### CellSelect.Label


Leading text label rendered as a `span`.

PropTypeDefaultDescription`children``ReactNode`-Label text

Also supports all native `span` HTML attributes.


### CellSelect.Value


Display of the currently selected value.


Also supports all HeroUI `Select.Value` props.


### CellSelect.Indicator


Chevron icon. Defaults to a `ChevronsExpandVertical` icon when no children are provided.

PropTypeDefaultDescription`children``ReactNode`-Custom indicator icon

Also supports all HeroUI `Select.Indicator` props.


### CellSelect.Popover


Dropdown panel for selection options.

PropTypeDefaultDescription`placement``Placement``'bottom end'`Popover placement relative to the trigger

Also supports all HeroUI `Select.Popover` props.

Cell Color Picker

A compact color picker styled as a settings cell with preset palettes and custom color input.

Cell Slider

A range slider styled as a settings cell with label, value display, and step configuration.