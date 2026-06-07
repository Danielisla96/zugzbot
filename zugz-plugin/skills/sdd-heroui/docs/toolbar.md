# Toolbar

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/toolbar
> A container for interactive controls with arrow key navigation.


## Import

```tsx
import { Toolbar } from '@heroui/react';

```

### Usage

```tsx
import {Bold, Copy, Italic, Scissors, Underline} from "@gravity-ui/icons";
import {
  Button,
  ButtonGroup,
  Separator,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from "@heroui/react";

export function Basic() {
  return (
    <Toolbar aria-label="Text formatting">
      <ToggleButtonGroup aria-label="Text style" selectionMode="multiple">
        <ToggleButton isIconOnly aria-label="Bold" id="bold">
          <Bold />
        </ToggleButton>
        <ToggleButton isIconOnly aria-label="Italic" id="italic">
          <ToggleButtonGroup.Separator />
          <Italic />
        </ToggleButton>
        <ToggleButton isIconOnly aria-label="Underline" id="underline">
          <ToggleButtonGroup.Separator />
          <Underline />
        </ToggleButton>
      </ToggleButtonGroup>
      <Separator />
      <ButtonGroup variant="tertiary">
        <Button isIconOnly aria-label="Copy">
          <Copy />
        </Button>
        <Button isIconOnly aria-label="Cut">
          <ButtonGroup.Separator />
          <Scissors />
        </Button>
      </ButtonGroup>
    </Toolbar>
  );
}

```

### Vertical

```tsx
import {ArrowUturnCcwLeft, ArrowUturnCwRight, Bold, Italic, Underline} from "@gravity-ui/icons";
import {
  Button,
  ButtonGroup,
  Separator,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from "@heroui/react";

export function Vertical() {
  return (
    <Toolbar aria-label="Tools" orientation="vertical">
      <ToggleButtonGroup aria-label="Text style" selectionMode="multiple">
        <ToggleButton isIconOnly aria-label="Bold" id="bold">
          <Bold />
        </ToggleButton>
        <ToggleButton isIconOnly aria-label="Italic" id="italic">
          <ToggleButtonGroup.Separator />
          <Italic />
        </ToggleButton>
        <ToggleButton isIconOnly aria-label="Underline" id="underline">
          <ToggleButtonGroup.Separator />
          <Underline />
        </ToggleButton>
      </ToggleButtonGroup>
      <Separator />
      <ButtonGroup variant="tertiary">
        <Button isIconOnly aria-label="Undo">
          <ArrowUturnCcwLeft />
        </Button>
        <Button isIconOnly aria-label="Redo">
          <ButtonGroup.Separator />
          <ArrowUturnCwRight />
        </Button>
      </ButtonGroup>
    </Toolbar>
  );
}

```

### With ButtonGroup

```tsx
import {
  ArrowUturnCcwLeft,
  ArrowUturnCwRight,
  Bold,
  Italic,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  Underline,
} from "@gravity-ui/icons";
import {
  Button,
  ButtonGroup,
  Separator,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from "@heroui/react";

export function WithButtonGroup() {
  return (
    <Toolbar aria-label="Editor toolbar">
      <ButtonGroup variant="tertiary">
        <Button>
          <ArrowUturnCcwLeft />
          Undo
        </Button>
        <Button>
          <ButtonGroup.Separator />
          <ArrowUturnCwRight />
          Redo
        </Button>
      </ButtonGroup>
      <Separator />
      <ToggleButtonGroup aria-label="Text style" selectionMode="multiple">
        <ToggleButton isIconOnly aria-label="Bold" id="bold">
          <Bold />
        </ToggleButton>
        <ToggleButton isIconOnly aria-label="Italic" id="italic">
          <ToggleButtonGroup.Separator />
          <Italic />
        </ToggleButton>
        <ToggleButton isIconOnly aria-label="Underline" id="underline">
          <ToggleButtonGroup.Separator />
          <Underline />
        </ToggleButton>
      </ToggleButtonGroup>
      <Separator />
      <ButtonGroup variant="tertiary">
        <Button isIconOnly aria-label="Align left">
          <TextAlignLeft />
        </Button>
        <Button isIconOnly aria-label="Align center">
          <ButtonGroup.Separator />
          <TextAlignCenter />
        </Button>
        <Button isIconOnly aria-label="Align right">
          <ButtonGroup.Separator />
          <TextAlignRight />
        </Button>
      </ButtonGroup>
    </Toolbar>
  );
}

```

### Attached

```tsx
import {Bold, Copy, Italic, Scissors, Underline} from "@gravity-ui/icons";
import {
  Button,
  ButtonGroup,
  Separator,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from "@heroui/react";

export function Attached() {
  return (
    <Toolbar isAttached aria-label="Text formatting">
      <ToggleButtonGroup aria-label="Text style" selectionMode="multiple">
        <ToggleButton isIconOnly aria-label="Bold" id="bold">
          <Bold />
        </ToggleButton>
        <ToggleButton isIconOnly aria-label="Italic" id="italic">
          <ToggleButtonGroup.Separator />
          <Italic />
        </ToggleButton>
        <ToggleButton isIconOnly aria-label="Underline" id="underline">
          <ToggleButtonGroup.Separator />
          <Underline />
        </ToggleButton>
      </ToggleButtonGroup>
      <Separator />
      <ButtonGroup variant="tertiary">
        <Button isIconOnly aria-label="Copy">
          <Copy />
        </Button>
        <Button isIconOnly aria-label="Cut">
          <ButtonGroup.Separator />
          <Scissors />
        </Button>
      </ButtonGroup>
    </Toolbar>
  );
}

```

## Related Components

* **ButtonGroup**: Group related buttons together
* **ToggleButtonGroup**: Group multiple toggle buttons into a unified control
* **Separator**: Visual divider between content

## Styling

### Passing Tailwind CSS classes

```tsx
import { Toolbar } from '@heroui/react';

function CustomToolbar() {
  return (
    <Toolbar
      aria-label="Actions"
      className="rounded-xl border border-default bg-surface p-2"
    >
      {/* toolbar content */}
    </Toolbar>
  );
}

```

### Customizing the component classes

To customize the Toolbar component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .toolbar {
    @apply gap-4 rounded-lg bg-surface p-3;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Toolbar component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/toolbar.css)):

* `.toolbar` - Base container
* `.toolbar--horizontal` - Horizontal orientation (default)
* `.toolbar--vertical` - Vertical orientation
* `.toolbar--attached` - Attached variant with surface background and full rounding

## API Reference

### Toolbar Props

Inherits from [React Aria Toolbar](https://react-spectrum.adobe.com/react-aria/Toolbar.html).

| Prop              | Type                                                                 | Default        | Description                                                     |
| ----------------- | -------------------------------------------------------------------- | -------------- | --------------------------------------------------------------- |
| `isAttached`      | `boolean`                                                            | `false`        | Whether the toolbar has a surface background with full rounding |
| `orientation`     | `"horizontal" \| "vertical"`                                         | `"horizontal"` | The orientation of the toolbar                                  |
| `aria-label`      | `string`                                                             | -              | An accessible label for the toolbar                             |
| `aria-labelledby` | `string`                                                             | -              | The id of an element that labels the toolbar                    |
| `children`        | `React.ReactNode \| (values: ToolbarRenderProps) => React.ReactNode` | -              | Content or render prop                                          |
| `className`       | `string \| (values: ToolbarRenderProps) => string`                   | -              | Additional CSS classes                                          |

### ToolbarRenderProps

When using the render prop pattern, these values are provided:

| Prop          | Type                         | Description                            |
| ------------- | ---------------------------- | -------------------------------------- |
| `orientation` | `"horizontal" \| "vertical"` | The current orientation of the toolbar |
