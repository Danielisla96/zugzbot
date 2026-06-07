# Inline Select

Copy MarkdownA minimal inline dropdown that blends into surrounding text for contextual selections without a full form field.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the InlineSelect component and access all parts using dot notation.



```tsx
import {InlineSelect} from "@heroui-pro/react";

<InlineSelect>
  <InlineSelect.Indicator />
  <InlineSelect.Trigger />
  <InlineSelect.Value />
  <InlineSelect.Popover />
</InlineSelect>
```


## Team Switcher

MobileTabletDesktop

## Custom Indicator

MobileTabletDesktop

## Multi Select

MobileTabletDesktop

## Placements

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.inline-select` - Root wrapper with custom properties


### Element Classes



- `.inline-select__trigger` - Ghost-styled trigger button (overrides HeroUI Select field styles)

- `.inline-select__value` - Displayed text of the selected item(s)

- `.inline-select__indicator` - Inline chevron icon (static positioning instead of absolute)

- `.inline-select__popover` - Dropdown panel


### Interactive States



- Hover: `:hover` or `[data-hovered="true"]` on `.inline-select__trigger` (text color change)

- Focus visible: `:focus-visible` or `[data-focus-visible="true"]` on `.inline-select__trigger` (focus ring)

- Disabled: `:disabled` or `[aria-disabled="true"]` on `.inline-select__trigger` (reduced opacity)

- Open: `[data-open="true"]` on `.inline-select__indicator`


### CSS Variables



- `--inline-select-value-max-width` - Max width of the value text (default: `12rem`)

- `--inline-select-indicator-size` - Size of the indicator icon (default: `0.75rem`)


## API Reference


### InlineSelect

The root component. Wraps the HeroUI Select with ghost styling for inline use.

PropTypeDefaultDescription`children``ReactNode`-Trigger, Value, Indicator, Popover, and list items

Also supports all HeroUI Select props.


### InlineSelect.Trigger


Ghost-styled trigger button.


Also supports all HeroUI `Select.Trigger` props.


### InlineSelect.Value


Displayed text of the selected item(s), truncated.


Also supports all HeroUI `Select.Value` props.


### InlineSelect.Indicator


Chevron icon. Defaults to a `ChevronsExpandVertical` icon when no children are provided.

PropTypeDefaultDescription`children``ReactNode`-Custom indicator icon

Also supports all HeroUI `Select.Indicator` props.


### InlineSelect.Popover


Dropdown panel for selection options.

PropTypeDefaultDescription`placement``Placement``'bottom end'`Popover placement relative to the trigger

Also supports all HeroUI `Select.Popover` props.

Drop Zone

A drag-and-drop file upload area with file type filtering, size limits, and file list preview.

Native Select

A styled wrapper around the native HTML select element with label, description, and validation support.