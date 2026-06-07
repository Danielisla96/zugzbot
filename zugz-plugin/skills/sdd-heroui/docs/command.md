# Command

Copy MarkdownA command palette with fuzzy search, keyboard navigation, and nested groups for quick actions.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Command component and access all parts using dot notation.



```tsx
import {Command} from "@heroui-pro/react";

<Command>
  <Command.Backdrop>
    <Command.Container>
      <Command.Dialog>
        <Command.Header />
        <Command.InputGroup>
          <Command.InputGroup.Prefix />
          <Command.InputGroup.Input />
          <Command.InputGroup.ClearButton />
          <Command.InputGroup.Suffix />
        </Command.InputGroup>
        <Command.List>
          <Command.Group />
          <Command.Item />
          <Command.Separator />
        </Command.List>
        <Command.Footer />
      </Command.Dialog>
    </Command.Container>
  </Command.Backdrop>
</Command>
```


## Clean

MobileTabletDesktop

## Dev Toolbar

MobileTabletDesktop

## Launcher

MobileTabletDesktop

## Minimal

MobileTabletDesktop

## Split View

MobileTabletDesktop

## Multiple Search Terms

MobileTabletDesktop

## Sizes

MobileTabletDesktop

## Backdrop Variants

MobileTabletDesktop

## CSS Classes


### Base & Variant Classes



- `.command__backdrop` — Fixed fullscreen overlay behind the command palette. Centered flex layout with enter/exit animations.

- `.command__backdrop--transparent` — Fully transparent backdrop.

- `.command__backdrop--opaque` — Dark semi-transparent backdrop (`bg-black/50`).

- `.command__backdrop--blur` — Dark backdrop with `backdrop-blur-md`.


### Size Modifier Classes



- `.command__dialog--sm` — Small dialog (`max-w-sm`, max-height `300px`).

- `.command__dialog--md` — Medium dialog (`max-w-lg`, max-height `356px`). Default.

- `.command__dialog--lg` — Large dialog (`max-w-xl`, max-height `440px`).


### Element Classes



- `.command__container` — Positioning wrapper centering the dialog at `15vh` from top. Has slide + zoom enter/exit animations.

- `.command__dialog` — The command palette box. Rounded with `bg-overlay`, `shadow-overlay`, and animated height transitions.

- `.command__input-group` — Search field container with bottom border. Flex row holding prefix, input, and suffix.

- `.command__input-group-prefix` — Leading content area (e.g., search icon) with muted color.

- `.command__input-group-suffix` — Trailing content area with muted color.

- `.command__input-group-clear-button` — Clear button that hides when input is empty.

- `.command__header` — Content area above the input (e.g., breadcrumbs or tabs).

- `.command__list` — Scrollable command list with `overflow-y: auto` and `overscroll-contain`.

- `.command__item` — Individual command entry. Rounded with gap for icon and keyboard shortcut.

- `.command__group` — Section grouping with top margin between groups.

- `.command__group-heading` — Section label with muted color and small font.

- `.command__separator` — Horizontal divider between groups (`bg-separator`).

- `.command__footer` — Bottom bar with border-top, muted text, and `bg-default/50` background.

- `.command__empty` — Empty state centered text shown when no results match.


### Interactive States



- Entering: `[data-entering="true"]` on `.command__backdrop` — `fade-in` animation (150ms). On `.command__container` — `fade-in` + `zoom-in-95` + `slide-in-from-top` (200ms).

- Exiting: `[data-exiting="true"]` on `.command__backdrop` — `fade-out` (100ms). On `.command__container` — `fade-out` + `zoom-out-95` (100ms).

- Item hover: `[data-hovered="true"]` on `.command__item` — applies `bg-default`.

- Item focused: `[data-focused="true"]` on `.command__item` — applies `bg-default`.

- Item pressed: `[data-pressed="true"]` on `.command__item` — applies `bg-default-hover`.

- Item disabled: `[data-disabled="true"]` on `.command__item` — reduced opacity, default cursor.

- Clear button hidden: `[data-empty="true"]` on `.command__input-group` — hides the clear button.

- Reduced motion: `motion-reduce:animate-none` on all animated elements.


## API Reference


### Command

The root provider. Sets up the component context.

PropTypeDefaultDescription`children``ReactNode`—Content of the command palette.

### Command.Backdrop


The fullscreen overlay. Must wrap `Command.Container`.

PropTypeDefaultDescription`isDismissable``boolean``true`Whether clicking the backdrop closes the palette.`variant``"opaque" | "blur" | "transparent"``"opaque"`Backdrop visual style.

Also supports all RAC ModalOverlay props.


### Command.Container


Positioning wrapper centering the dialog. Must be placed inside `Command.Backdrop`.

PropTypeDefaultDescription`size``"sm" | "md" | "lg"``"md"`Size of the command dialog.

Also supports all RAC Modal props.


### Command.Dialog


The command palette box. Wraps an internal `Autocomplete` for filtering.

PropTypeDefaultDescription`defaultInputValue``string`—Default search input value (uncontrolled).`inputValue``string`—Controlled search input value.`onInputChange``(value: string) => void`—Callback when search input changes.`filter``(textValue: string, inputValue: string) => boolean`Case-insensitive containsCustom filter function.

Also supports all RAC Dialog props.


### Command.Header


Content area above the input (e.g., breadcrumbs or navigation tabs). Renders a plain `<div>`.


### Command.InputGroup


The search field container wrapping prefix, input, and suffix elements.

PropTypeDefaultDescription`autoFocus``boolean``true`Whether the input is focused when the palette opens.

Also supports all RAC SearchField props.


### Command.InputGroup.Prefix


Leading content inside the input group (e.g., a search icon). Renders a plain `<div>`.


### Command.InputGroup.Input


The text input element for searching commands.

PropTypeDefaultDescription`placeholder``string``"Search commands..."`Placeholder text.

Also supports all RAC Input props.


### Command.InputGroup.Suffix


Trailing content inside the input group. Renders a plain `<div>`.


### Command.InputGroup.ClearButton


A close button that clears the search input. Automatically hidden when the input is empty.


Also supports all HeroUI CloseButton props.


### Command.List


The scrollable list of command items. Backed by RAC `Menu`.

PropTypeDefaultDescription`renderEmptyState``() => ReactNode`—Custom empty state content when no items match.

Also supports all RAC Menu props.


### Command.Item


An individual command entry. Supports icons, labels, and keyboard shortcuts.


Also supports all RAC MenuItem props.


### Command.Group


Groups related command items under a heading.

PropTypeDefaultDescription`heading``ReactNode`—Heading label for the group.

Also supports all RAC MenuSection props.


### Command.Separator


A horizontal divider between groups.


Also supports all RAC Separator props.


### Command.Footer


Content area below the list (e.g., keyboard shortcut hints). Renders a plain `<div>`.

AppLayout

A scaffold layout that composes a full-height sidebar, a sticky navbar, a main content area, and an optional right-side aside panel.

Context Menu

A right-click context menu with nested submenus, selection state, and long-press support for touch.