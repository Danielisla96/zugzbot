# Pressable Feedback

Copy MarkdownA press interaction layer adding ripple, highlight, hold-to-confirm, and progress feedback effects to any element.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the PressableFeedback component and access all parts using dot notation.



```tsx
import {PressableFeedback} from "@heroui-pro/react";

<PressableFeedback>
  <PressableFeedback.Highlight />
  <PressableFeedback.Ripple />
  <PressableFeedback.HoldConfirm />
  <PressableFeedback.ProgressFeedback />
</PressableFeedback>
```


## Comparison

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Hold Confirm Callback

MobileTabletDesktop

## Hold Confirm Durations

MobileTabletDesktop

## Hold Confirm Sweep

MobileTabletDesktop

## Pressable Cards

MobileTabletDesktop

## Progress Feedback Callback

MobileTabletDesktop

## Progress Feedback Durations

MobileTabletDesktop

## Progress Feedback No Reset

MobileTabletDesktop

## Progress Feedback Sweep

MobileTabletDesktop

## Standalone Highlight

MobileTabletDesktop

## Standalone Ripple

MobileTabletDesktop

## With Highlight

MobileTabletDesktop

## With Hold Confirm

MobileTabletDesktop

## With Progress Feedback

MobileTabletDesktop

## With Ripple

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.pressable-feedback` - Base pressable container with relative positioning and overflow hidden


### Element Classes



- `.pressable-feedback__highlight` - Opacity-based press overlay

- `.pressable-feedback__ripple` - M3-style radial ripple container

- `.pressable-feedback__ripple-surface` - Ripple animation surface with `::before` (hover) and `::after` (press) pseudo-elements

- `.pressable-feedback__hold-confirm` - Clip-path hold-to-reveal overlay

- `.pressable-feedback__progress-feedback` - Clip-path click-to-progress overlay


### Interactive States



- Focus visible: `:focus-visible` or `[data-focus-visible="true"]` on `.pressable-feedback` (focus ring)

- Disabled: `:disabled` or `[aria-disabled="true"]` on `.pressable-feedback` (reduced opacity, no pointer events)

- Hover: `:hover` or `[data-hovered="true"]` on parent activates `.pressable-feedback__highlight` opacity

- Pressed: `:active` or `[data-pressed="true"]` on parent activates highlight pressed opacity


### Data Attributes



- `[data-sweep="right|left|down|up"]` on hold-confirm and progress-feedback - Clip-path sweep direction

- `[data-holding="true"]` on `.pressable-feedback__hold-confirm` - Currently being held

- `[data-complete="true"]` on hold-confirm/progress-feedback - Action completed

- `[data-progressing="true"]` on `.pressable-feedback__progress-feedback` - Progress is active


### CSS Variables



- `--pressable-feedback-highlight-color` - Highlight overlay color (default: `currentColor`)

- `--pressable-feedback-highlight-opacity` - Hover opacity (default: `0.08`)

- `--pressable-feedback-highlight-pressed-opacity` - Pressed opacity (default: `0.12`)

- `--pressable-feedback-ripple-color` - Ripple color (default: `currentColor`)

- `--pressable-feedback-ripple-hover-opacity` - Ripple hover opacity (default: `0.08`)

- `--pressable-feedback-ripple-pressed-opacity` - Ripple pressed opacity (default: `0.12`)

- `--pressable-feedback-hold-confirm-duration` - Hold duration (default: `2000ms`)

- `--pressable-feedback-hold-confirm-release-duration` - Release snap-back duration (default: `200ms`)

- `--pressable-feedback-progress-feedback-duration` - Progress duration (default: `2000ms`)

- `--pressable-feedback-progress-feedback-release-duration` - Reset snap-back duration (default: `300ms`)


## API Reference


### PressableFeedback

The root pressable container. Renders a `button` element by default.

PropTypeDefaultDescription`isDisabled``boolean``false`Whether the pressable is disabled`children``ReactNode`-Feedback layers and content`className``string`-Additional CSS class`render``DOMRenderFunction`-Custom render function to override the default `button` element

Also supports all native `button` HTML attributes.


### PressableFeedback.Highlight


Opacity-based hover/press overlay. No additional props beyond standard `div` attributes.


### PressableFeedback.Ripple


M3-style radial ripple effect.

PropTypeDefaultDescription`duration``number``150`Duration in ms for the ripple grow animation`hoverOpacity``number``0.08`Opacity of the hover state`pressedOpacity``number``0.12`Opacity of the pressed state`minimumPressDuration``number``225`Minimum press duration in ms`isDisabled``boolean`-Whether the ripple is disabled`className``string`-Additional CSS class`style``CSSProperties`-Additional inline styles

### PressableFeedback.HoldConfirm


Clip-path hold-to-reveal overlay.

PropTypeDefaultDescription`duration``number``2000`Hold duration in ms before the action is confirmed`releaseDuration``number``200`Duration in ms for the snap-back animation on release`sweep``'right' | 'left' | 'down' | 'up'``'right'`Which edge the clip-path reveal sweeps toward`resetOnComplete``boolean``true`Whether to reset the overlay after the hold completes`isDisabled``boolean`-Whether the hold confirm is disabled`onComplete``() => void`-Fired when the hold reaches the full duration`children``ReactNode`-Overlay content shown during the reveal`className``string`-Additional CSS class

### PressableFeedback.ProgressFeedback


Clip-path click-to-progress overlay (auto, no hold required).

PropTypeDefaultDescription`duration``number``2000`Progress duration in ms before the action is confirmed`releaseDuration``number``300`Duration in ms for the snap-back animation on reset`sweep``'right' | 'left' | 'down' | 'up'``'right'`Which edge the clip-path reveal sweeps toward`autoReset``boolean``true`Whether to automatically reset after completing`resetDelay``number``1500`Delay in ms before resetting after completion`isDisabled``boolean`-Whether the progress feedback is disabled`onComplete``() => void`-Fired when the progress reaches the full duration`onReset``() => void`-Fired when the overlay resets back to idle`children``ReactNode`-Overlay content shown during the reveal`className``string`-Additional CSS class
Number Value

A formatted number display with locale-aware rendering for currency, percentages, and compact notation.

Rating

A star rating input with fractional read-only display, custom icons, sizes, and interactive selection.