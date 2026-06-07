# Checkbox Button Group

Copy MarkdownA multi-selection button group with card-style checkboxes, icons, and custom indicators.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the CheckboxButtonGroup component and access all parts using dot notation.



```tsx
import {CheckboxButtonGroup} from "@heroui-pro/react";

<CheckboxButtonGroup>
  <CheckboxButtonGroup.Item>
    <CheckboxButtonGroup.ItemIcon />
    <CheckboxButtonGroup.ItemContent />
    <CheckboxButtonGroup.Indicator />
  </CheckboxButtonGroup.Item>
</CheckboxButtonGroup>
```


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

## Subscription Plans

MobileTabletDesktop

## With Icons

MobileTabletDesktop

## With Ripple

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.checkbox-button-group` - Base CheckboxGroup container with flex layout


### Layout Classes



- `.checkbox-button-group--grid` - Grid layout mode


### Element Classes



- `.checkbox-button-group__item` - Card-like checkbox button with border and selection ring

- `.checkbox-button-group__indicator` - Positioned top-right indicator (checkbox control or custom icon)

- `.checkbox-button-group__item-content` - Text/content area wrapping Checkbox.Content

- `.checkbox-button-group__item-icon` - Leading icon container


### Interactive States



- Selected: `[data-selected="true"]` on `.checkbox-button-group__item` (accent ring)

- Focus visible: `:focus-visible` or `[data-focus-visible="true"]` on `.checkbox-button-group__item` (focus ring)

- Disabled: `:disabled` or `[aria-disabled="true"]` on `.checkbox-button-group__item` (reduced opacity)


### CSS Variables



- `--checkbox-button-group-item-radius` - Border radius of items (default: `var(--radius-2xl)`)


## API Reference


### CheckboxButtonGroup

The root component. Wraps HeroUI CheckboxGroup with card-style layout.

PropTypeDefaultDescription`layout``'flex' | 'grid'``'flex'`Layout mode for items

Also supports all HeroUI CheckboxGroup props.


### CheckboxButtonGroup.Item


A selectable card wrapping HeroUI Checkbox. Supports render prop children for accessing selection state.


Also supports all HeroUI Checkbox props.


### CheckboxButtonGroup.Indicator


Selection indicator positioned at the top-right of the item.



- No children: renders the default HeroUI checkbox (Control + Indicator)

- With children: renders a custom icon that appears only when selected

PropTypeDefaultDescription`children``ReactNode`-Custom indicator icon (shown when selected)

Also supports all native `span` HTML attributes.


### CheckboxButtonGroup.ItemContent


Content area for title and description text. Wraps HeroUI `Checkbox.Content`.

PropTypeDefaultDescription`children``ReactNode`-Content elements

Also supports all native `div` HTML attributes.


### CheckboxButtonGroup.ItemIcon


Leading icon container.

PropTypeDefaultDescription`children``ReactNode`-Icon element

Also supports all native `div` HTML attributes.

Cell Switch

A toggle switch styled as a settings cell with label and description, ideal for preference panels.

Drop Zone

A drag-and-drop file upload area with file type filtering, size limits, and file list preview.