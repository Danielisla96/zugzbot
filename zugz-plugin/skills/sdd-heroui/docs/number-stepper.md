# Number Stepper

Copy MarkdownA numeric input with increment/decrement buttons, min/max bounds, step intervals, and custom formatting.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the NumberStepper component and access all parts using dot notation.



```tsx
import {NumberStepper} from "@heroui-pro/react";

<NumberStepper>
  <NumberStepper.Group>
    <NumberStepper.DecrementButton />
    <NumberStepper.Value />
    <NumberStepper.IncrementButton />
  </NumberStepper.Group>
</NumberStepper>
```


## Guest Picker

MobileTabletDesktop

## Controlled

MobileTabletDesktop

## Custom Icons

MobileTabletDesktop

## Custom Value

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Min Max Values

MobileTabletDesktop

## Reversed Layout

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## With Custom Buttons

MobileTabletDesktop

## With Format Options

MobileTabletDesktop

## With Label

MobileTabletDesktop

## With Step

MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.number-stepper` - Base root wrapper

- `.number-stepper--sm` - Small size

- `.number-stepper--md` - Medium size (default)

- `.number-stepper--lg` - Large size


### Element Classes



- `.number-stepper__group` - Container grouping value and buttons

- `.number-stepper__group--sm` / `--md` / `--lg` - Group size variants

- `.number-stepper__value` - Animated number display (via Number Flow)

- `.number-stepper__decrement-button` - Minus button

- `.number-stepper__increment-button` - Plus button

- `.number-stepper__input` - Hidden native input for accessibility


### Interactive States



- Hover: `:hover` or `[data-hovered="true"]` on buttons (background change)

- Focus visible: `:focus-visible` or `[data-focus-visible="true"]` on buttons (focus ring)

- Pressed: `:active` or `[data-pressed="true"]` on buttons (scale down)

- Disabled: `:disabled` or `[data-disabled="true"]` on buttons (reduced opacity)


## API Reference


### NumberStepper

The root component. Wraps RAC NumberField.

PropTypeDefaultDescription`size``'sm' | 'md' | 'lg'``'md'`Size variant`formatOptions``Format`-Number formatting options passed to Number Flow

Also supports all RAC NumberField props (`value`, `defaultValue`, `onChange`, `minValue`, `maxValue`, `step`, `isDisabled`, etc.).


### NumberStepper.Group


Container grouping value and buttons. Wraps RAC Group. Automatically renders a hidden input for accessibility.


Also supports all RAC Group props.


### NumberStepper.Value


Animated number display using Number Flow.

PropTypeDefaultDescription`value``number`-Override value (defaults to the root's current value)`format``Format`-Override format options`children``ReactNode | ((props: { value: number, formatOptions?: Format }) => ReactNode)`-Custom content or render function

Also supports all Number Flow props except `value` and `children`.


### NumberStepper.DecrementButton


Minus button. Wraps RAC Button with `slot="decrement"`. Renders a default minus icon when no children are provided.


Also supports all RAC Button props.


### NumberStepper.IncrementButton


Plus button. Wraps RAC Button with `slot="increment"`. Renders a default plus icon when no children are provided.


Also supports all RAC Button props.

Native Select

A styled wrapper around the native HTML select element with label, description, and validation support.

Radio Button Group

A single-selection button group with card-style radio options, icons, and custom indicators.