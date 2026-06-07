# Cell Color Picker

Copy MarkdownA compact color picker styled as a settings cell with preset palettes and custom color input.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the CellColorPicker component and access all parts using dot notation.



```tsx
import {CellColorPicker} from "@heroui-pro/react";

<CellColorPicker>
  <CellColorPicker.Label />
  <CellColorPicker.Trigger />
  <CellColorPicker.ValueDisplay />
  <CellColorPicker.Popover>
    <CellColorPicker.Swatch />
  </CellColorPicker.Popover>
</CellColorPicker>
```


## Controlled

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Settings Group

MobileTabletDesktop

## Variants

MobileTabletDesktop

## With Presets

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.cell-color-picker` - Root wrapper


### Element Classes



- `.cell-color-picker__trigger` - The visible cell row button

- `.cell-color-picker__trigger--default` - Default variant trigger styling

- `.cell-color-picker__trigger--secondary` - Secondary variant trigger styling

- `.cell-color-picker__label` - Leading text label

- `.cell-color-picker__value-display` - Hex value text display

- `.cell-color-picker__swatch` - Color swatch preview

- `.cell-color-picker__popover` - Dropdown color picker panel


## API Reference


### CellColorPicker

The root component. Wraps HeroUI ColorPicker with cell-style layout.

PropTypeDefaultDescription`variant``'default' | 'secondary'``'default'`Visual style variant

Also supports all RAC ColorPicker props except `children` (`defaultValue`, `value`, `onChange`, etc.).


### CellColorPicker.Trigger


The visible cell row button. Wraps RAC Button.


Also supports all RAC Button props.


### CellColorPicker.Label


Leading text label rendered as a `span`.

PropTypeDefaultDescription`children``ReactNode`-Label text

Also supports all native `span` HTML attributes.


### CellColorPicker.ValueDisplay


Displays the current color as a hex value (e.g. `#FF5733`). Automatically reads from the color picker state.


Also supports all native `span` HTML attributes.


### CellColorPicker.Swatch


Color swatch preview. Wraps HeroUI ColorSwatch.


Also supports all HeroUI ColorSwatch props.


### CellColorPicker.Popover


Dropdown color picker panel. Wraps HeroUI `ColorPicker.Popover`.

PropTypeDefaultDescription`placement``Placement``'bottom end'`Popover placement relative to the trigger

Also supports all HeroUI ColorPicker.Popover props.

Resizable

Resizable panel groups with composable handle types and variants. Built on react-resizable-panels, wired up with HeroUI design tokens.

Cell Select

A compact select input styled as a settings cell, ideal for preference panels and configuration forms.