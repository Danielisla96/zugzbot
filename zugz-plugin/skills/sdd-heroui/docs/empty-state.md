# Empty State

Copy MarkdownA placeholder for empty views with icon, title, description, and call-to-action to guide users.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the EmptyState component and access all parts using dot notation.



```tsx
import {EmptyState} from "@heroui-pro/react";

<EmptyState>
  <EmptyState.Media />
  <EmptyState.Header>
    <EmptyState.Title />
    <EmptyState.Description />
  </EmptyState.Header>
  <EmptyState.Content />
</EmptyState>
```


## Minimal

MobileTabletDesktop

## Outline

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## Full Height

MobileTabletDesktop

## With Avatar

MobileTabletDesktop

## With Avatar Group

MobileTabletDesktop

## With Background

MobileTabletDesktop

## CSS Classes


### Base & Size Classes



- `.empty-state` - Base centered column layout

- `.empty-state--sm` - Small size (less padding and gap)

- `.empty-state--md` - Medium size (default)

- `.empty-state--lg` - Large size (more padding and gap)


### Element Classes



- `.empty-state__header` - Groups media, title, and description

- `.empty-state__media` - Icon or avatar container

- `.empty-state__title` - Primary heading text

- `.empty-state__description` - Secondary descriptive text

- `.empty-state__content` - Action area for buttons, inputs, or links


### Data Attributes



- `[data-variant="icon"]` on `.empty-state__media` - Adds circular muted background for icon display

- `[data-variant="default"]` on `.empty-state__media` - Default media styling (no background)


## API Reference


### EmptyState

The root component. Renders a centered container for empty state content.

PropTypeDefaultDescription`size``'sm' | 'md' | 'lg'``'md'`Size variant controlling padding and spacing`children``ReactNode`-Empty state content`className``string`-Additional CSS class`render``DOMRenderFunction`-Custom render function to override the default `div` element

Also supports all native `div` HTML attributes.


### EmptyState.Header


Groups the media, title, and description elements.

PropTypeDefaultDescription`children``ReactNode`-Header content

Also supports all native `div` HTML attributes.


### EmptyState.Media


Container for icons, avatars, or images.

PropTypeDefaultDescription`variant``'default' | 'icon'``'default'``"icon"` adds a circular muted background`children``ReactNode`-Media content

Also supports all native `div` HTML attributes.


### EmptyState.Title


Primary heading rendered as an `h3`.

PropTypeDefaultDescription`children``ReactNode`-Title text

Also supports all native `h3` HTML attributes.


### EmptyState.Description


Secondary descriptive text rendered as a `p`.

PropTypeDefaultDescription`children``ReactNode`-Description text

Also supports all native `p` HTML attributes.


### EmptyState.Content


Action area for buttons, links, or other interactive elements.

PropTypeDefaultDescription`children``ReactNode`-Action content

Also supports all native `div` HTML attributes.

Data Grid

A full-featured data grid with sorting, selection, column resizing, pinned columns, drag-and-drop row reorder, virtualization, and async loading — built on the HeroUI Table.

File Tree

A hierarchical file explorer with expand/collapse, drag-and-drop, icons, and multi-selection support.