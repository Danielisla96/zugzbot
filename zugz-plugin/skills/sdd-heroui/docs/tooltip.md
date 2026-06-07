# Tooltip

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/tooltip
> Displays informative text when users hover over or focus on an element


## Import

```tsx
import { Tooltip } from '@heroui/react';

```

### Usage

```tsx
import {CircleInfo} from "@gravity-ui/icons";
import {Button, Tooltip} from "@heroui/react";

export function TooltipBasic() {
  return (
    <div className="flex items-center gap-4">
      <Tooltip delay={0}>
        <Button variant="secondary">Hover me</Button>
        <Tooltip.Content>
          <p>This is a tooltip</p>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip delay={0}>
        <Button isIconOnly variant="tertiary">
          <CircleInfo />
        </Button>
        <Tooltip.Content>
          <p>More information</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

```

### Anatomy

Import the Tooltip component and access all parts using dot notation.

```tsx
import { Tooltip, Button } from '@heroui/react';

export default () => (
  <Tooltip>
    <Tooltip.Trigger>
      <Button>Hover for tooltip</Button>
    </Tooltip.Trigger>
    <Tooltip.Content>
      <Tooltip.Arrow />
      Helpful information about this element
    </Tooltip.Content>
  </Tooltip>
)

```

### With Arrow

```tsx
import {Button, Tooltip} from "@heroui/react";

export function TooltipWithArrow() {
  return (
    <div className="flex items-center gap-4">
      <Tooltip delay={0}>
        <Button variant="secondary">With Arrow</Button>
        <Tooltip.Content showArrow>
          <Tooltip.Arrow />
          <p>Tooltip with arrow indicator</p>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip delay={0}>
        <Button variant="primary">Custom Offset</Button>
        <Tooltip.Content showArrow offset={12}>
          <Tooltip.Arrow />
          <p>Custom offset from trigger</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

```

### Placement

```tsx
import {Button, Tooltip} from "@heroui/react";

export function TooltipPlacement() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div />
      <Tooltip delay={0}>
        <Button className="w-full" variant="tertiary">
          Top
        </Button>
        <Tooltip.Content showArrow placement="top">
          <Tooltip.Arrow />
          <p>Top placement</p>
        </Tooltip.Content>
      </Tooltip>
      <div />

      <Tooltip delay={0}>
        <Button className="w-full" variant="tertiary">
          Left
        </Button>
        <Tooltip.Content showArrow placement="left">
          <Tooltip.Arrow />
          <p>Left placement</p>
        </Tooltip.Content>
      </Tooltip>

      <div className="flex items-center justify-center">
        <span className="text-sm text-muted">Hover buttons</span>
      </div>

      <Tooltip delay={0}>
        <Button className="w-full" variant="tertiary">
          Right
        </Button>
        <Tooltip.Content showArrow placement="right">
          <Tooltip.Arrow />
          <p>Right placement</p>
        </Tooltip.Content>
      </Tooltip>

      <div />
      <Tooltip delay={0}>
        <Button className="w-full" variant="tertiary">
          Bottom
        </Button>
        <Tooltip.Content showArrow placement="bottom">
          <Tooltip.Arrow />
          <p>Bottom placement</p>
        </Tooltip.Content>
      </Tooltip>
      <div />
    </div>
  );
}

```

### Custom Triggers

```tsx
import {CircleCheckFill, CircleQuestion} from "@gravity-ui/icons";
import {Avatar, Chip, Tooltip} from "@heroui/react";

export function TooltipCustomTrigger() {
  return (
    <div className="flex items-center gap-6">
      <Tooltip delay={0}>
        <Tooltip.Trigger aria-label="User avatar">
          <Avatar size="sm">
            <Avatar.Image
              alt="Jane Doe"
              src="https://img.heroui.chat/image/avatar?w=400&h=400&u=4"
            />
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>
        </Tooltip.Trigger>
        <Tooltip.Content showArrow>
          <Tooltip.Arrow />
          <div className="flex flex-col gap-0 py-1">
            <p className="font-semibold">Jane Doe</p>
            <p className="text-xs text-muted">jane@example.com</p>
          </div>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip delay={0}>
        <Tooltip.Trigger aria-label="Status chip">
          <Chip color="success">
            <CircleCheckFill width={12} />
            <Chip.Label>Active</Chip.Label>
          </Chip>
        </Tooltip.Trigger>
        <Tooltip.Content className="flex items-center gap-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          <p>Jane is currently online</p>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip delay={0}>
        <Tooltip.Trigger aria-label="Info icon">
          <div className="rounded-full bg-accent-soft p-2">
            <CircleQuestion className="text-accent-soft-foreground" />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content showArrow>
          <Tooltip.Arrow />
          <div className="max-w-xs px-1 py-1.5">
            <p className="mb-1 font-semibold">Help Information</p>
            <p className="text-sm text-muted">
              This is a helpful tooltip with more detailed information about this feature.
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

```

## Related Components

* **Button**: Allows a user to perform an action
* **Popover**: Displays content in context with a trigger

### Custom Render Function

```tsx
"use client";

import {CircleInfo} from "@gravity-ui/icons";
import {Button, Tooltip} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <div className="flex items-center gap-4">
      <Tooltip delay={0}>
        <Button variant="secondary">Hover me</Button>
        <Tooltip.Content render={(props) => <div {...props} data-custom="foo" />}>
          <p>This is a tooltip</p>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip delay={0}>
        <Button isIconOnly variant="tertiary">
          <CircleInfo />
        </Button>
        <Tooltip.Content render={(props) => <div {...props} data-custom="foo" />}>
          <p>More information</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import { Tooltip, Button } from '@heroui/react';

function CustomTooltip() {
  return (
    <Tooltip>
      <Tooltip.Trigger>
        <Button>Hover me</Button>
      </Tooltip.Trigger>
      <Tooltip.Content className="bg-accent text-accent-foreground">
        <p>Custom styled tooltip</p>
      </Tooltip.Content>
    </Tooltip>
  );
}

```

### Customizing the component classes

To customize the Tooltip component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .tooltip {
    @apply rounded-xl shadow-lg;
  }

  .tooltip__trigger {
    @apply cursor-help;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Tooltip component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/tooltip.css)):

#### Base Classes

* `.tooltip` - Base tooltip styles with animations
* `.tooltip__trigger` - Trigger element styles

### Interactive States

The component supports animation states:

* **Entering**: `[data-entering]` - Applied during tooltip appearance
* **Exiting**: `[data-exiting]` - Applied during tooltip disappearance
* **Placement**: `[data-placement="*"]` - Applied based on tooltip position

## API Reference

### Tooltip Props

| Prop         | Type                 | Default   | Description                                  |
| ------------ | -------------------- | --------- | -------------------------------------------- |
| `children`   | `React.ReactNode`    | -         | Trigger element and content                  |
| `delay`      | `number`             | `700`     | Delay in milliseconds before showing tooltip |
| `closeDelay` | `number`             | `0`       | Delay in milliseconds before hiding tooltip  |
| `trigger`    | `"hover" \| "focus"` | `"hover"` | How the tooltip is triggered                 |
| `isDisabled` | `boolean`            | `false`   | Whether the tooltip is disabled              |

### Tooltip.Content Props

| Prop        | Type                                                                       | Default            | Description                                                      |
| ----------- | -------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| `children`  | `React.ReactNode`                                                          | -                  | Content to display in the tooltip                                |
| `showArrow` | `boolean`                                                                  | `false`            | Whether to show the arrow indicator                              |
| `offset`    | `number`                                                                   | `3` (7 with arrow) | Distance from the trigger element                                |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` (and variants)                    | `"top"`            | Placement of the tooltip                                         |
| `className` | `string`                                                                   | -                  | Additional CSS classes                                           |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, TooltipRenderProps>` | -                  | Overrides the default DOM element with a custom render function. |

### Tooltip.Trigger Props

| Prop        | Type              | Default | Description                       |
| ----------- | ----------------- | ------- | --------------------------------- |
| `children`  | `React.ReactNode` | -       | Element that triggers the tooltip |
| `className` | `string`          | -       | Additional CSS classes            |

### Tooltip.Arrow Props

| Prop        | Type                                                                            | Default | Description                                                      |
| ----------- | ------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `children`  | `React.ReactNode`                                                               | -       | Custom arrow element                                             |
| `className` | `string`                                                                        | -       | Additional CSS classes                                           |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, OverlayArrowRenderProps>` | -       | Overrides the default DOM element with a custom render function. |
