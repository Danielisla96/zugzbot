# Segment

Copy MarkdownA segmented control for toggling between a small set of mutually exclusive options.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Segment component and access all parts using dot notation.



```tsx
import {Segment} from "@heroui-pro/react";

<Segment>
  <Segment.Item />
  <Segment.Separator />
</Segment>
```


## Ghost

Use `variant="ghost"` for a transparent container with an accent-colored selection indicator — ideal for inline or minimal UI contexts where the segment shouldn't draw attention to itself.


MobileTabletDesktop

## Without Separators

MobileTabletDesktop

## Controlled

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Disabled Item

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## Theme Switcher

MobileTabletDesktop

## Two Items

MobileTabletDesktop

## With Icons

MobileTabletDesktop

## Icon Expand

Use render props on `Segment.Item` to show only icons for unselected items and icon + label for the selected item. Combine with `variant="ghost"` and `className="w-auto"` on each item so they size to their content.


MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.segment` - Base container with inline-flex layout and rounded corners

- `.segment--sm` - Small size (28px height, smaller padding)

- `.segment--md` - Medium size (32px height, default)

- `.segment--lg` - Large size (40px height, larger padding)


### Variant Classes



- `.segment--ghost` - Ghost variant (transparent container, accent-colored indicator)

- `.segment__item--ghost` - Ghost item (accent-foreground text when selected)

- `.segment__indicator--ghost` - Ghost indicator (accent background, no shadow)


### Element Classes



- `.segment__item` - Individual toggle button

- `.segment__item--sm` / `.segment__item--md` / `.segment__item--lg` - Item size variants

- `.segment__indicator` - Animated selection indicator (positioned behind the selected item)

- `.segment__separator` - Decorative divider between items (auto-hidden when adjacent to selected item)


### Interactive States



- Selected: `[data-selected="true"]` on `.segment__item` (foreground color change)

- Hover: `:hover` or `[data-hovered="true"]` on unselected `.segment__item` (opacity reduction)

- Focus visible: `:focus-visible` or `[data-focus-visible="true"]` on `.segment__item` (focus ring)

- Disabled: `:disabled` or `[data-disabled="true"]` or `[aria-disabled="true"]` on `.segment__item` (reduced opacity)


## API Reference


### Segment

The root component. Wraps RAC ToggleButtonGroup with a single-selection API.

PropTypeDefaultDescription`variant``'default' | 'ghost'``'default'`Visual variant`size``'sm' | 'md' | 'lg'``'md'`Size variant`selectedKey``Key | null`-The key of the currently selected item (controlled)`defaultSelectedKey``Key`-The key of the initially selected item (uncontrolled)`onSelectionChange``(key: Key) => void`-Handler called when the selected item changes`isDisabled``boolean`-Whether all items are disabled`children``ReactNode`-Segment items

Also supports all RAC ToggleButtonGroup props except `selectionMode`, `selectedKeys`, `defaultSelectedKeys`, and `onSelectionChange`.


### Segment.Item


An individual option wrapping RAC ToggleButton. Automatically renders a `SelectionIndicator` inside.

PropTypeDefaultDescription`id``Key`-Unique key for this item`children``ReactNode | ((renderProps) => ReactNode)`-Item label or render function

Also supports all RAC ToggleButton props.


### Segment.Separator


Decorative divider between items. Automatically hidden adjacent to the selected item.


Also supports all native `span` HTML attributes.

Navbar

A composable top navigation bar with hide-on-scroll, responsive mobile menu, and client-side routing support.

Sidebar

A responsive sidebar navigation component with collapsible groups, rail mode, and mobile sheet support.