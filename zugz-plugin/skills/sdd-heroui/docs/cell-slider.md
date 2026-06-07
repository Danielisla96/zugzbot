# Cell Slider

Copy MarkdownA range slider styled as a settings cell with label, value display, and step configuration.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the CellSlider component and access all parts using dot notation.



```tsx
import {CellSlider} from "@heroui-pro/react";

<CellSlider>
  <CellSlider.Label />
  <CellSlider.Output />
  <CellSlider.Track>
    <CellSlider.Fill />
    <CellSlider.Thumb />
  </CellSlider.Track>
</CellSlider>
```


## Controlled

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Integer Step

MobileTabletDesktop

## Secondary Group

MobileTabletDesktop

## Settings Group

MobileTabletDesktop

## Variants

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.cell-slider` - Root wrapper


### Element Classes



- `.cell-slider__track` - The visible cell row (Slider.Track)

- `.cell-slider__track--default` - Default variant track styling

- `.cell-slider__track--secondary` - Secondary variant track styling

- `.cell-slider__fill` - Accent tint showing the current value

- `.cell-slider__thumb` - Transparent hit area with a `::after` pill indicator

- `.cell-slider__label` - Leading text label (absolutely positioned left)

- `.cell-slider__output` - Value display (absolutely positioned right)


## API Reference


### CellSlider

The root component. Wraps HeroUI Slider with cell-style layout. Always renders in horizontal orientation.

PropTypeDefaultDescription`variant``'default' | 'secondary'``'default'`Visual style variant

Also supports all HeroUI Slider props except `variant` and `orientation`.


### CellSlider.Track


The visible cell row serving as the slider track. Contains fill, thumb, label, and output as children.


Also supports all HeroUI `Slider.Track` props.


### CellSlider.Fill


Subtle accent tint showing the current slider value.


Also supports all HeroUI `Slider.Fill` props.


### CellSlider.Thumb


Transparent hit area for drag and keyboard accessibility. The visible indicator is a `::after` pseudo-element (thin 3px pill).


Also supports all HeroUI `Slider.Thumb` props.


### CellSlider.Label


Leading text label, absolutely positioned on the left.

PropTypeDefaultDescription`children``ReactNode`-Label text

Also supports all native `span` HTML attributes.


### CellSlider.Output


Value display, absolutely positioned on the right.


Also supports all HeroUI `Slider.Output` props.

Cell Select

A compact select input styled as a settings cell, ideal for preference panels and configuration forms.

Cell Switch

A toggle switch styled as a settings cell with label and description, ideal for preference panels.