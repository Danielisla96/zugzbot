# Emoji Reaction Button

Copy MarkdownAn animated emoji reaction button with count display and toggle state for social interactions.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the EmojiReactionButton component and access all parts using dot notation.



```tsx
import {EmojiReactionButton} from "@heroui-pro/react";

<EmojiReactionButton>
  <EmojiReactionButton.Emoji />
  <EmojiReactionButton.Count />
</EmojiReactionButton>
```


## Disabled

MobileTabletDesktop

## Read-only

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.emoji-reaction-button` - Base toggle button with rounded-full shape

- `.emoji-reaction-button--sm` - Small size

- `.emoji-reaction-button--md` - Medium size (default)

- `.emoji-reaction-button--lg` - Large size


### Element Classes



- `.emoji-reaction-button__emoji` - The emoji character

- `.emoji-reaction-button__count` - The reaction count


### Interactive States



- Selected: `[data-selected="true"]` on root (accent border and background tint; count text turns accent)

- Hover: `:hover` or `[data-hovered="true"]` (background change)

- Focus visible: `:focus-visible` or `[data-focus-visible="true"]` (focus ring)

- Pressed: `:active` or `[data-pressed="true"]` (scale down)

- Read-only: `[data-readonly="true"]` on root (default cursor, no press scale, no pointer interaction)

- Disabled: `:disabled` or `[aria-disabled="true"]` (reduced opacity)


## API Reference


### EmojiReactionButton

The root component. Wraps RAC ToggleButton.

PropTypeDefaultDescription`size``'sm' | 'md' | 'lg'``'md'`Size variant`isSelected``boolean`-Whether the button is selected (controlled)`defaultSelected``boolean`-Default selected state (uncontrolled)`onChange``(isSelected: boolean) => void`-Handler called when the selected state changes`isReadOnly``boolean`-Whether the button is read-only and should not respond to user interaction`isDisabled``boolean`-Whether the button is disabled`children``ReactNode | ((renderProps) => ReactNode)`-Emoji and Count elements

Also supports all RAC ToggleButton props.


### EmojiReactionButton.Emoji


The emoji character display.


Also supports all native `span` HTML attributes.


### EmojiReactionButton.Count


The reaction count display.


Also supports all native `span` HTML attributes.

Text Shimmer

Animated shimmer text for streaming, thinking, and loading labels.

Number Value

A formatted number display with locale-aware rendering for currency, percentages, and compact notation.