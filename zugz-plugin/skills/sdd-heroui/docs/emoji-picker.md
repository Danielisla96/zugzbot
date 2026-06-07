# Emoji Picker

Copy MarkdownA searchable emoji picker with virtualized list, category navigation, skin tone selection, and recent emoji tracking.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the EmojiPicker component and access all parts using dot notation.



```tsx
import {EmojiPicker} from "@heroui-pro/react";

<EmojiPicker>
  <EmojiPicker.Trigger>
    <EmojiPicker.Value />
  </EmojiPicker.Trigger>
  <EmojiPicker.Popover>
    <EmojiPicker.Content>
      <EmojiPicker.SkinTonePicker>
        <EmojiPicker.SkinToneTrigger />
        <EmojiPicker.SkinToneContent>
          <EmojiPicker.SkinToneOption />
        </EmojiPicker.SkinToneContent>
      </EmojiPicker.SkinTonePicker>
      <EmojiPicker.Grid>
        <EmojiPicker.Item />
      </EmojiPicker.Grid>
      <EmojiPicker.Footer />
    </EmojiPicker.Content>
  </EmojiPicker.Popover>
</EmojiPicker>
```


## Custom Categories

MobileTabletDesktop

## Inline

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.emoji-picker__popover` — Floating panel containing the picker. Has `bg-overlay`, `shadow-overlay`, and `rounded-2xl` with enter/exit animations.

- `.emoji-picker__popover--sm` — Small popover (`240px × 280px`).

- `.emoji-picker__popover--md` — Medium popover (`280px × 350px`). Default.

- `.emoji-picker__popover--lg` — Large popover (`320px × 420px`).

- `.emoji-picker__item--sm` — Small emoji item (`font-size: 20px`).

- `.emoji-picker__item--md` — Medium emoji item (`font-size: 24px`). Default.

- `.emoji-picker__item--lg` — Large emoji item (`font-size: 28px`).


### Element Classes



- `.emoji-picker__trigger` — Unstyled trigger button with press-scale animation and interactive cursor.

- `.emoji-picker__value` — Displays the currently selected emoji inside the trigger.

- `.emoji-picker__content` — Flex wrapper inside the popover holding the search input and grid.

- `.emoji-picker__grid` — Virtualized scrollable emoji grid with `overflow-auto` and `scroll-padding`.

- `.emoji-picker__item` — Individual emoji cell in the grid. Centered flex with rounded hover/focus states.

- `.emoji-picker__footer` — Absolutely positioned bottom bar with `bg-surface`, `border-top`, and muted text.

- `.emoji-picker__empty` — Empty state centered text shown when no emojis match the search.

- `.emoji-picker__skin-tone-picker` — Trigger button for the skin tone selector (`size-6`, rounded).

- `.emoji-picker__skin-tone-options` — Row of skin tone swatches inside a popover dialog.

- `.emoji-picker__skin-tone-option` — Individual skin tone swatch button with selection highlight.


### Interactive States



- Entering: `[data-entering="true"]` on `.emoji-picker__popover` — `fade-in` + `zoom-in-95` (150ms).

- Exiting: `[data-exiting="true"]` on `.emoji-picker__popover` — `fade-out` + `zoom-out-95` (100ms).

- Trigger pressed: `[data-pressed="true"]` on `.emoji-picker__trigger` — `scale(0.97)`.

- Trigger focus visible: `[data-focus-visible="true"]` on `.emoji-picker__trigger` — applies focus ring.

- Trigger disabled: `[aria-disabled="true"]` on `.emoji-picker__trigger` — applies disabled styles.

- Item hover: `[data-hovered="true"]` on `.emoji-picker__item` — applies `bg-default`.

- Item focused: `[data-focused="true"]` on `.emoji-picker__item` — applies `bg-default`.

- Item pressed: `[data-pressed="true"]` on `.emoji-picker__item` — applies `bg-default-hover`.

- Item selected: `[data-selected="true"]` on `.emoji-picker__item` — applies `bg-default-hover`.

- Item focus visible: `[data-focus-visible="true"]` on `.emoji-picker__item` — applies focus ring.

- Skin tone selected: `[data-selected="true"]` on `.emoji-picker__skin-tone-option` — applies `bg-default-hover`.

- Reduced motion: `motion-reduce:animate-none` and `motion-reduce:transition-none` on animated elements.


## API Reference


### EmojiPicker

The root provider. Wraps a RAC `Select` internally.

PropTypeDefaultDescription`size``"sm" | "md" | "lg"``"md"`Size variant controlling trigger, popover, and emoji dimensions.

Also supports all RAC Select props.


### EmojiPicker.Trigger


Button that opens the emoji popover.


Also supports all RAC Button props.


### EmojiPicker.Value


Displays the currently selected emoji inside the trigger.


Also supports all RAC SelectValue props.


### EmojiPicker.Popover


The floating panel containing the picker content.

PropTypeDefaultDescription`offset``number``4`Distance from the trigger in pixels.`placement``Placement``"bottom"`Preferred placement relative to the trigger.

Also supports all RAC Popover props.


### EmojiPicker.Content


Flex wrapper inside the popover. Wraps an internal `Autocomplete` for search filtering.

PropTypeDefaultDescription`filter``(textValue: string, inputValue: string) => boolean`Case-insensitive containsCustom filter function for emoji search.

### EmojiPicker.Grid


Virtualized scrollable emoji grid using RAC `Virtualizer` with `GridLayout`.

PropTypeDefaultDescription`layoutOptions``{ minItemSize?, maxItemSize?, minSpace?, preserveAspectRatio? }``36×36` cells, `2×2` spacingVirtualizer grid layout options for item sizing and spacing.`renderEmptyState``() => ReactNode`—Custom empty state when no emojis match.

Also supports all RAC ListBox props (except `layout`).


### EmojiPicker.Item


An individual emoji cell in the grid.


Also supports all RAC ListBoxItem props.


### EmojiPicker.Footer


Content area below the grid (e.g., selected emoji preview or skin tone picker). Renders a `<div>`.


### EmojiPicker.SkinTonePicker


Root provider for the skin tone selector. Manages a `Popover` internally.

PropTypeDefaultDescription`value``string`—Controlled skin tone value.`defaultValue``string``"default"`Default skin tone (uncontrolled).`onChange``(value: string) => void`—Callback when the skin tone changes.

### EmojiPicker.SkinToneTrigger


Button that opens the skin tone popover. Shows the current skin tone emoji.

PropTypeDefaultDescription`tones``EmojiSkinToneItem[]``EMOJI_SKIN_TONES`Skin tone data for resolving the current value's emoji.`aria-label``string``"Select skin tone"`Accessible label.

### EmojiPicker.SkinToneContent


Popover content for the skin tone selector.

PropTypeDefaultDescription`offset``number``4`Distance from the trigger.`placement``Placement``"bottom end"`Popover placement.

### EmojiPicker.SkinToneOption


An individual skin tone swatch button.

PropTypeDefaultDescription`id``string`—Skin tone identifier (e.g., `"default"`, `"light"`, `"dark"`). Required.
Stepper

A step-by-step progress indicator with numbered, icon, and bullet variants in horizontal or vertical layouts.

Sheet

A bottom sheet overlay with snap points, swipe-to-dismiss, and placement options for mobile-friendly dialogs.