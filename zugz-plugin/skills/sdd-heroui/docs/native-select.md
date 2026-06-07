# Native Select

Copy MarkdownA styled wrapper around the native HTML select element with label, description, and validation support.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the NativeSelect component and access all parts using dot notation.



```tsx
import {NativeSelect} from "@heroui-pro/react";

<NativeSelect>
  <NativeSelect.Trigger>
    <NativeSelect.Indicator />
  </NativeSelect.Trigger>
  <NativeSelect.OptGroup>
    <NativeSelect.Option />
  </NativeSelect.OptGroup>
</NativeSelect>
```


## Controlled

MobileTabletDesktop

## Custom Indicator

MobileTabletDesktop

## Disabled Select

MobileTabletDesktop

## Form Example

MobileTabletDesktop

## Full Width

MobileTabletDesktop

## Invalid State

MobileTabletDesktop

## Variants

MobileTabletDesktop

## With Description

MobileTabletDesktop

## With Disabled Options

MobileTabletDesktop

## With Groups

MobileTabletDesktop

## With Label

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.native-select` - Base outer wrapper (label + trigger + description)

- `.native-select__trigger` - Positioned wrapper containing the select and indicator

- `.native-select__select` - The native `select` element with field styling

- `.native-select__indicator` - Chevron icon positioned inside the trigger


### Variant Classes



- `.native-select--secondary` - Secondary variant with default background and no shadow


### Modifier Classes



- `.native-select--full-width` - Makes the wrapper full-width

- `.native-select__trigger--full-width` - Makes the trigger full-width


### Interactive States



- Hover: `:hover` or `[data-hovered="true"]` on `.native-select__select` (background and border change)

- Focus: `:focus` on `.native-select__select` (border and background change)

- Focus visible: `:focus-visible` or `[data-focus-visible="true"]` on `.native-select__select` (focus ring)

- Invalid: `[data-invalid="true"]` or `[aria-invalid="true"]` on `.native-select` (error styling)

- Disabled: `:disabled` or `[aria-disabled="true"]` on `.native-select__select` (reduced opacity, no pointer events)


## API Reference


### NativeSelect

The root component. Wraps the trigger, label, and description.

PropTypeDefaultDescription`variant``'primary' | 'secondary'``'primary'`Visual style variant`fullWidth``boolean``false`Whether the select takes the full width of its container`children``ReactNode`-Trigger, label, and description elements

Also supports all native `div` HTML attributes.


### NativeSelect.Trigger


Wrapper containing the native `select` element and the indicator.

PropTypeDefaultDescription`className``string`-Additional CSS class applied to the `select` element`wrapperClassName``string`-Additional CSS class applied to the wrapper `div``children``ReactNode`-Option, OptGroup, and Indicator elements

Also supports all native `select` HTML attributes (`value`, `onChange`, `disabled`, etc.).


### NativeSelect.Indicator


Chevron icon inside the trigger. Renders a default down-chevron SVG when no children are provided.

PropTypeDefaultDescription`children``ReactNode`-Custom indicator icon

Also supports all native `span` HTML attributes.


### NativeSelect.Option


A native `option` element.

PropTypeDefaultDescription`children``ReactNode`-Option label text

Also supports all native `option` HTML attributes (`value`, `disabled`, etc.).


### NativeSelect.OptGroup


A native `optgroup` element for grouping options.

PropTypeDefaultDescription`children``ReactNode`-Option elements

Also supports all native `optgroup` HTML attributes (`label`, `disabled`, etc.).

Inline Select

A minimal inline dropdown that blends into surrounding text for contextual selections without a full form field.

Number Stepper

A numeric input with increment/decrement buttons, min/max bounds, step intervals, and custom formatting.