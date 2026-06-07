# Stepper

Copy MarkdownA step-by-step progress indicator with numbered, icon, and bullet variants in horizontal or vertical layouts.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Stepper component and access all parts using dot notation.



```tsx
import {Stepper} from "@heroui-pro/react";

<Stepper>
  <Stepper.Step>
    <Stepper.Indicator />
    <Stepper.Icon />
    <Stepper.Title />
    <Stepper.Description />
    <Stepper.Content />
    <Stepper.Separator />
  </Stepper.Step>
</Stepper>
```


## Package Tracking

MobileTabletDesktop

## Bullet Steps

MobileTabletDesktop

## Controlled

MobileTabletDesktop

## Controlled Vertical

MobileTabletDesktop

## Custom Color

MobileTabletDesktop

## Custom Color Vertical

MobileTabletDesktop

## Custom Completed Icon

MobileTabletDesktop

## Display Only

MobileTabletDesktop

## Dynamic Icon

MobileTabletDesktop

## Free Trial Timeline

MobileTabletDesktop

## Onboarding Timeline

MobileTabletDesktop

## Render Function

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## Vertical

MobileTabletDesktop

## Vertical Sizes

MobileTabletDesktop

## Vertical With Icons

MobileTabletDesktop

## With Descriptions

MobileTabletDesktop

## With Icons

MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.stepper` - Base root container (`ol` element)

- `.stepper--sm` - Small size (22px indicator, 12px vertical gap)

- `.stepper--md` - Medium size (28px indicator, 16px vertical gap, default)

- `.stepper--lg` - Large size (36px indicator, 24px vertical gap)


### Orientation Classes



- `.stepper--horizontal` - Horizontal layout

- `.stepper--vertical` - Vertical layout


### Element Classes



- `.stepper__step` - Individual step wrapper (`li` element)

- `.stepper__step--horizontal` / `.stepper__step--vertical` - Orientation-specific step layout

- `.stepper__step-button` - Interactive button inside each step

- `.stepper__step-button--horizontal` / `.stepper__step-button--vertical` - Orientation-specific button layout

- `.stepper__indicator` - Circle badge showing step number or icon

- `.stepper__indicator--sm` / `.stepper__indicator--md` / `.stepper__indicator--lg` - Indicator text sizing

- `.stepper__content` - Wrapper for title and description

- `.stepper__content--horizontal` / `.stepper__content--vertical` - Orientation-specific content alignment

- `.stepper__title` - Step title text

- `.stepper__title--sm` / `.stepper__title--md` / `.stepper__title--lg` - Title text sizing

- `.stepper__description` - Step description text

- `.stepper__description--sm` / `.stepper__description--md` / `.stepper__description--lg` - Description text sizing

- `.stepper__icon` - Icon wrapper inside the indicator

- `.stepper__separator` - Connector line container between steps

- `.stepper__separator--horizontal` / `.stepper__separator--vertical` - Orientation-specific separator positioning

- `.stepper__separator-track` - Background rail of the separator

- `.stepper__separator-track--horizontal` / `.stepper__separator-track--vertical` - Track sizing

- `.stepper__separator-fill` - Colored progress overlay inside the track

- `.stepper__separator-fill--horizontal` / `.stepper__separator-fill--vertical` - Fill animation direction


### Interactive States



- Clickable hover: `[data-clickable="true"]:hover` on `.stepper__step-button` (indicator opacity change)

- Clickable active: `[data-clickable="true"]:active` on `.stepper__step-button` (opacity reduction)

- Focus visible: `:focus-visible` on `.stepper__step-button` (focus ring)


### Data Attributes



- `[data-status="inactive"]` / `[data-status="active"]` / `[data-status="complete"]` on `.stepper__indicator` and `.stepper__step` - Step status

- `[data-clickable]` on `.stepper__step-button` - Whether the step is interactive

- `[data-complete]` on `.stepper__separator-track` - Whether the separator is fully filled


### CSS Variables



- `--stepper-indicator-size` - Size of the indicator circle (set by size modifier)

- `--stepper-separator-size` - Thickness of the separator line (default `2px`)

- `--stepper-vertical-gap` - Gap between vertical steps (set by size modifier)

- `--stepper-active-color` - Color for the active step (default: accent)

- `--stepper-complete-color` - Color for completed steps (default: accent)

- `--stepper-complete-fg` - Foreground color for completed indicator (default: accent-foreground)

- `--stepper-inactive-border` - Border color for inactive indicator (default: border)

- `--stepper-inactive-fg` - Text color for inactive indicator (default: muted)

- `--stepper-separator-progress` - Progress value (0-1) controlling separator fill


## API Reference


### Stepper

The root component. Renders an `ol` element with step progress tracking.

PropTypeDefaultDescription`orientation``'horizontal' | 'vertical'``'horizontal'`Layout direction`size``'sm' | 'md' | 'lg'``'md'`Size variant`currentStep``number`-The current active step index (controlled)`defaultStep``number``0`The initial step index (uncontrolled)`onStepChange``(step: number) => void`-Callback when a step is clicked; makes steps interactive when provided`children``ReactNode`-Stepper steps

Also supports all native `ol` HTML attributes.


### Stepper.Step


A single step wrapper. Renders an `li` element and provides step context to children.

PropTypeDefaultDescription`children``ReactNode`-Step content (Indicator, Content, Separator, etc.)

Also supports all native `li` HTML attributes.


### Stepper.Indicator


The circle badge showing a step number, icon, or checkmark.


Defaults:



- Inactive/Active: displays step number (1-based)

- Complete: displays an animated checkmark icon

PropTypeDefaultDescription`children``ReactNode`-Custom content overriding the default number/checkmark`className``string`-Additional CSS class

### Stepper.Content


Flex wrapper for title and description.

PropTypeDefaultDescription`children``ReactNode`-Title and description elements

Also supports all native `span` HTML attributes.


### Stepper.Title


Step title text.

PropTypeDefaultDescription`children``ReactNode`-Title text

Also supports all native `span` HTML attributes.


### Stepper.Description


Step description text.

PropTypeDefaultDescription`children``ReactNode`-Description text

Also supports all native `span` HTML attributes.


### Stepper.Icon


Icon wrapper rendered inside the indicator.

PropTypeDefaultDescription`children``ReactNode`-Icon element

Also supports all native `span` HTML attributes.


### Stepper.Separator


Connector line between steps. Automatically hidden on the last step.

PropTypeDefaultDescription`progress``number`-Explicit progress value (0-1). Auto-computed from `currentStep` when omitted`force``boolean``false`Force rendering even on the last step

Also supports all native `div` HTML attributes.


### useStepperStep


Hook to access per-step context from any descendant of `Stepper.Step`.


Returns:

PropertyTypeDescription`index``number`Zero-based step index`status``'inactive' | 'active' | 'complete'`Current step status`isLast``boolean`Whether this is the last step
Sidebar

A responsive sidebar navigation component with collapsible groups, rail mode, and mobile sheet support.

Emoji Picker

A searchable emoji picker with virtualized list, category navigation, skin tone selection, and recent emoji tracking.