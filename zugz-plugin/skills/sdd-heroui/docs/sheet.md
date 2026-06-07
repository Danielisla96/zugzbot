# Sheet

Copy MarkdownA bottom sheet overlay with snap points, swipe-to-dismiss, and placement options for mobile-friendly dialogs.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Sheet component and access all parts using dot notation.



```tsx
import {Sheet} from "@heroui-pro/react";

<Sheet>
  <Sheet.Trigger />
  <Sheet.Backdrop>
    <Sheet.Content>
      <Sheet.Dialog>
        <Sheet.Handle />
        <Sheet.CloseTrigger />
        <Sheet.Header>
          <Sheet.Heading />
        </Sheet.Header>
        <Sheet.Body />
        <Sheet.Footer>
          <Sheet.Close />
        </Sheet.Footer>
      </Sheet.Dialog>
    </Sheet.Content>
  </Sheet.Backdrop>
</Sheet>
```


## Backdrop Variants

MobileTabletDesktop

## Controlled

MobileTabletDesktop

## Detached

MobileTabletDesktop

## Emoji Picker Sheet

MobileTabletDesktop

## Handle Only

MobileTabletDesktop

## Nested

MobileTabletDesktop

## Non Dismissable

MobileTabletDesktop

## Placements

MobileTabletDesktop

## Professions Picker

MobileTabletDesktop

## Scrollable Content

MobileTabletDesktop

## Slack Message Actions

MobileTabletDesktop

## Snap Points

MobileTabletDesktop

## Snap Points Custom Fade

MobileTabletDesktop

## Snap Points Sequential

MobileTabletDesktop

## With Form

MobileTabletDesktop

## CSS Classes


### Base & Variant Classes



- `.sheet__backdrop` — Fixed fullscreen overlay behind the sheet. Uses a `::before` pseudo-element for the backdrop visual so opacity animations don't affect the panel.

- `.sheet__backdrop--opaque` — Solid backdrop using `bg-backdrop`.

- `.sheet__backdrop--blur` — Semi-transparent backdrop with `backdrop-blur-sm`.

- `.sheet__backdrop--transparent` — Fully transparent backdrop.


### Content & Placement Classes



- `.sheet__content` — The sliding panel container. Fixed position with `z-index: 50`.

- `.sheet__content--bottom` — Anchored to bottom edge with `rounded-t-2xl` and `max-height: 96vh`.

- `.sheet__content--top` — Anchored to top edge with `rounded-b-2xl` and `max-height: 96vh`.

- `.sheet__content--left` — Anchored to left edge with `rounded-r-2xl` and `max-width: 96vw`.

- `.sheet__content--right` — Anchored to right edge with `rounded-l-2xl` and `max-width: 96vw`.


### Dialog & Layout Classes



- `.sheet__dialog` — The visible dialog surface inside the content panel. Has `bg-overlay`, `shadow-overlay`, and flex column layout.

- `.sheet__dialog--bottom` — Bottom dialog rounding and max-height.

- `.sheet__dialog--top` — Top dialog rounding and max-height.

- `.sheet__dialog--left` — Left dialog rounding with `height: 100%`.

- `.sheet__dialog--right` — Right dialog rounding with `height: 100%`.


### Element Classes



- `.sheet__header` — Flex column container for heading content. Padded with `1rem 1.25rem`.

- `.sheet__heading` — Title text with `text-lg` and `font-semibold`.

- `.sheet__body` — Scrollable content area with `overflow-y: auto` and flex-grow.

- `.sheet__footer` — Bottom action bar with flex row layout and `gap-0.5rem`.

- `.sheet__handle` — Drag handle area with grab cursor. Centered with padding.

- `.sheet__handle-bar` — The visible pill-shaped bar inside the handle (`bg-default`, `2rem × 0.3rem`).

- `.sheet__close-trigger` — Absolutely positioned close button (`top-right`). Uses `text-muted` with hover-to-foreground transition.


### Interactive States



- Entering: `[data-entering]` on `[data-sheet-drawer]` — triggers slide-in animation per placement direction.

- Exiting: `[data-exiting]` on `[data-sheet-drawer]` — triggers slide-out animation with `animation-fill-mode: forwards`.

- Dragging: `.sheet-dragging` on `[data-sheet-drawer]` — promotes to compositor layer with `will-change: transform`.

- Snap points: `[data-sheet-snap-points="true"]` — enables JS-driven transforms via `--snap-point-height`.

- Detached: `[data-sheet-detached]` — floats the sheet with `0.5rem` inset and full `rounded-2xl`.

- Handle hover/active: `.sheet__handle:hover` / `.sheet__handle:active` — increases opacity and changes cursor to `grabbing`.

- Close trigger hover: `.sheet__close-trigger:hover` — changes from `text-muted` to `text-foreground`.

- Close trigger focus: `.sheet__close-trigger[data-focus-visible="true"]` — applies focus ring.

- Reduced motion: `@media (prefers-reduced-motion: reduce)` — near-zero animation/transition durations.


### CSS Variables



- `--sheet-backdrop-opacity` — JS-driven backdrop opacity for snap-point mode.

- `--initial-transform` — Starting transform for slide animations (default: `100%`). Detached mode uses `calc(100% + 8px)`.

- `--snap-point-height` — Current snap-point offset in pixels, set by JS.


### Keyframes



- `sheet-fadeIn` / `sheet-fadeOut` — Backdrop opacity fade.

- `sheet-slideFromBottom` / `sheet-slideToBottom` — Bottom placement slide.

- `sheet-slideFromTop` / `sheet-slideToTop` — Top placement slide.

- `sheet-slideFromLeft` / `sheet-slideToLeft` — Left placement slide.

- `sheet-slideFromRight` / `sheet-slideToRight` — Right placement slide.


## API Reference


### Sheet

The root provider that manages open state, drag behavior, snap points, and nested sheets.

PropTypeDefaultDescription`isOpen``boolean`—Controlled open state.`defaultOpen``boolean``false`Initial open state (uncontrolled).`onOpenChange``(open: boolean) => void`—Callback when open state changes.`placement``"top" | "bottom" | "left" | "right"``"bottom"`Which edge the sheet slides from.`isDismissable``boolean``true`Whether clicking outside or dragging can close the sheet.`isDetached``boolean``false`Float the sheet away from the viewport edge with rounded corners on all sides.`isModal``boolean``true`Whether the sheet renders as a modal overlay.`isNested``boolean`—Whether this sheet is nested inside another sheet.`isHandleOnly``boolean``false`Restrict dragging to the handle element only.`snapPoints``(number | string)[]`—Array of snap point heights.`activeSnapPoint``number | string | null`—Controlled active snap point.`onActiveSnapPointChange``(snapPoint: number | string | null) => void`—Callback when active snap point changes.`fadeFromIndex``number`Last snap indexIndex from which backdrop begins fading.`closeThreshold``number``0.25`Fraction of visible height that triggers close on release.`shouldScaleBackground``boolean``false`Scale the page background when the sheet opens.`onDrag``(event: PointerEvent, percentageDragged: number) => void`—Callback during drag.`onRelease``(event: PointerEvent, open: boolean) => void`—Callback when drag ends.`onClose``() => void`—Callback when the sheet closes.`onAnimationEnd``(open: boolean) => void`—Callback after open/close animation completes.`shouldAutoFocus``boolean``false`Whether to auto-focus the first focusable element.

### Sheet.Trigger


Renders its child element and opens the sheet when pressed.

PropTypeDefaultDescription`children``ReactElement`—A single pressable element. Receives an injected `onPress` handler.

### Sheet.Close


Renders its child element and closes the sheet when pressed.

PropTypeDefaultDescription`children``ReactElement`—A single pressable element. Receives an injected `onPress` handler.

### Sheet.Backdrop


The fullscreen overlay behind the sheet. Must wrap `Sheet.Content`.

PropTypeDefaultDescription`variant``"opaque" | "blur" | "transparent"``"opaque"`Backdrop visual style.

Also supports all RAC ModalOverlay props (except `isOpen` and `onOpenChange`, which are managed by `Sheet`).


### Sheet.Content


The sliding panel element. Must be placed inside `Sheet.Backdrop`.


Also supports all RAC Modal props (except `isOpen` and `onOpenChange`).


### Sheet.Dialog


The visible dialog surface inside the content panel. Provides `aria-labelledby` wiring with `Sheet.Heading`.


Also supports all RAC Dialog props.


### Sheet.Header


Flex column container for the heading area. Renders a plain `<div>`.


### Sheet.Heading


Title text with automatic `aria-labelledby` wiring to the parent `Sheet.Dialog`.


Also supports all RAC Heading props.


### Sheet.Body


Scrollable content area with flex-grow and `overflow-y: auto`. Renders a plain `<div>`.


### Sheet.Footer


Bottom action bar. Renders a flex row `<div>` with end-aligned items.


### Sheet.Handle


A draggable handle element for swipe interactions. Clicking it cycles through snap points or closes the sheet.

PropTypeDefaultDescription`preventCycle``boolean``false`Disable snap-point cycling on click.

### Sheet.CloseTrigger


An `×` close button absolutely positioned in the top-right corner.


Also supports all HeroUI CloseButton props.


### Sheet.NestedRoot


A nested sheet that must be placed inside another `Sheet`. Automatically manages parent scaling and displacement animations.


Accepts the same props as `Sheet` (the root provider).

Emoji Picker

A searchable emoji picker with virtualized list, category navigation, skin tone selection, and recent emoji tracking.