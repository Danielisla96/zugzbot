# Popover

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/popover
> Displays rich content in a portal triggered by a button or any custom element


## Import

```tsx
import { Popover } from '@heroui/react';

```

### Usage

```tsx
import {Button, Popover} from "@heroui/react";

export function PopoverBasic() {
  return (
    <div className="flex items-center gap-4">
      <Popover>
        <Button>Click me</Button>
        <Popover.Content className="max-w-64">
          <Popover.Dialog>
            <Popover.Heading>Popover Title</Popover.Heading>
            <p className="mt-2 text-sm text-muted">
              This is the popover content. You can put any content here.
            </p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
}

```

### Anatomy

Import the Popover component and access all parts using dot notation.

```tsx
import { Popover } from '@heroui/react';

export default () => (
  <Popover>
    <Popover.Trigger/>
    <Popover.Content>
      <Popover.Arrow />
      <Popover.Dialog>
        <Popover.Heading/>
        {/* content goes here */}
      </Popover.Dialog>
    </Popover.Content>
  </Popover>
)

```

### With Arrow

```tsx
import {Ellipsis} from "@gravity-ui/icons";
import {Button, Popover} from "@heroui/react";

export function PopoverWithArrow() {
  return (
    <div className="flex items-center gap-4">
      <Popover>
        <Button variant="secondary">With Arrow</Button>
        <Popover.Content className="max-w-64">
          <Popover.Dialog>
            <Popover.Arrow />
            <Popover.Heading>Popover with Arrow</Popover.Heading>
            <p className="mt-2 text-sm text-muted">
              The arrow shows which element triggered the popover.
            </p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>

      <Popover>
        <Button isIconOnly variant="tertiary">
          <Ellipsis />
        </Button>
        <Popover.Content className="max-w-64" offset={10}>
          <Popover.Dialog>
            <Popover.Arrow />
            <Popover.Heading>Popover with Arrow</Popover.Heading>
            <p className="mt-2 text-sm text-muted">
              The arrow shows which element triggered the popover.
            </p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
}

```

### Placement

```tsx
import {Button, Popover} from "@heroui/react";

export function PopoverPlacement() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div />
      <Popover>
        <Button className="w-full" variant="tertiary">
          Top
        </Button>
        <Popover.Content placement="top">
          <Popover.Dialog>
            <Popover.Arrow />
            <p className="text-sm">Top placement</p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
      <div />

      <Popover>
        <Button className="w-full" variant="tertiary">
          Left
        </Button>
        <Popover.Content placement="left">
          <Popover.Dialog>
            <Popover.Arrow />
            <p className="text-sm">Left placement</p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>

      <div className="flex items-center justify-center">
        <span className="text-sm text-muted">Click buttons</span>
      </div>

      <Popover>
        <Button className="w-full" variant="tertiary">
          Right
        </Button>
        <Popover.Content placement="right">
          <Popover.Dialog>
            <Popover.Arrow />
            <p className="text-sm">Right placement</p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>

      <div />
      <Popover>
        <Button className="w-full" variant="tertiary">
          Bottom
        </Button>
        <Popover.Content placement="bottom">
          <Popover.Dialog>
            <Popover.Arrow />
            <p className="text-sm">Bottom placement</p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
      <div />
    </div>
  );
}

```

### Interactive Content

```tsx
"use client";

import {Avatar, Button, Popover} from "@heroui/react";
import {useState} from "react";

export function PopoverInteractive() {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="flex items-center gap-6">
      <Popover>
        <Popover.Trigger aria-label="User profile">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <Avatar.Image
                alt="Sarah Johnson"
                src="https://img.heroui.chat/image/avatar?w=400&h=400&u=1"
              />
              <Avatar.Fallback>SJ</Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium">Sarah Johnson</p>
              <p className="text-xs text-muted">@sarahj</p>
            </div>
          </div>
        </Popover.Trigger>
        <Popover.Content className="w-[320px]">
          <Popover.Dialog>
            <Popover.Heading>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar size="md">
                    <Avatar.Image
                      alt="Sarah Johnson"
                      src="https://img.heroui.chat/image/avatar?w=400&h=400&u=1"
                    />
                    <Avatar.Fallback>SJ</Avatar.Fallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted">@sarahj</p>
                  </div>
                </div>
                <Button
                  className="rounded-full"
                  size="sm"
                  variant={isFollowing ? "tertiary" : "primary"}
                  onPress={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            </Popover.Heading>
            <p className="mt-3 text-sm text-muted">
              Product designer and creative director. Building beautiful experiences that matter.
            </p>
            <div className="mt-3 flex gap-4">
              <div>
                <span className="font-semibold">892</span>
                <span className="ml-1 text-sm text-muted">Following</span>
              </div>
              <div>
                <span className="font-semibold">12.5K</span>
                <span className="ml-1 text-sm text-muted">Followers</span>
              </div>
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
}

```

## Related Components

* **Button**: Allows a user to perform an action
* **Tooltip**: Contextual information on hover or focus
* **Select**: Dropdown select control

### Custom Render Function

```tsx
"use client";

import {Button, Popover} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <div className="flex items-center gap-4">
      <Popover>
        <Button>Click me</Button>
        <Popover.Content
          className="max-w-64"
          render={(props) => <div {...props} data-custom="foo" />}
        >
          <Popover.Dialog>
            <Popover.Heading>Popover Title</Popover.Heading>
            <p className="mt-2 text-sm text-muted">
              This is the popover content. You can put any content here.
            </p>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </div>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import { Popover, Button } from '@heroui/react';

function CustomPopover() {
  return (
    <Popover>
      <Popover.Trigger>
        <Button>Open</Button>
      </Popover.Trigger>
      <Popover.Content className="bg-accent text-accent-foreground">
        <Popover.Dialog>
          <h3>Custom Styled</h3>
          <p>This popover has custom styling</p>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

```

### Customizing the component classes

To customize the Popover component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .popover {
    @apply rounded-xl shadow-2xl;
  }

  .popover__dialog {
    @apply p-4;
  }

  .popover__heading {
    @apply text-lg font-bold;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Popover component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/popover.css)):

#### Base Classes

* `.popover` - Base popover container styles
* `.popover__dialog` - Dialog content wrapper
* `.popover__heading` - Heading text styles
* `.popover__trigger` - Trigger element styles

### Interactive States

The component supports animation states:

* **Entering**: `[data-entering]` - Applied during popover appearance
* **Exiting**: `[data-exiting]` - Applied during popover disappearance
* **Placement**: `[data-placement="*"]` - Applied based on popover position
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]`

## API Reference

### Popover Props

| Prop           | Type                        | Default | Description                              |
| -------------- | --------------------------- | ------- | ---------------------------------------- |
| `children`     | `React.ReactNode`           | -       | Trigger and content elements             |
| `isOpen`       | `boolean`                   | -       | Controls popover visibility (controlled) |
| `defaultOpen`  | `boolean`                   | `false` | Initial open state (uncontrolled)        |
| `onOpenChange` | `(isOpen: boolean) => void` | -       | Called when open state changes           |

### Popover.Content Props

| Prop         | Type                                                                       | Default    | Description                                                      |
| ------------ | -------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| `children`   | `React.ReactNode`                                                          | -          | Content to display in the popover                                |
| `placement`  | `"top" \| "bottom" \| "left" \| "right"` (and variants)                    | `"bottom"` | Placement of the popover                                         |
| `offset`     | `number`                                                                   | `8`        | Distance from the trigger element                                |
| `shouldFlip` | `boolean`                                                                  | `true`     | Whether popover can change orientation to fit                    |
| `className`  | `string`                                                                   | -          | Additional CSS classes                                           |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, PopoverRenderProps>` | -          | Overrides the default DOM element with a custom render function. |

### Popover.Dialog Props

| Prop        | Type              | Default | Description            |
| ----------- | ----------------- | ------- | ---------------------- |
| `children`  | `React.ReactNode` | -       | Dialog content         |
| `className` | `string`          | -       | Additional CSS classes |

### Popover.Trigger Props

| Prop        | Type              | Default | Description                       |
| ----------- | ----------------- | ------- | --------------------------------- |
| `children`  | `React.ReactNode` | -       | Element that triggers the popover |
| `className` | `string`          | -       | Additional CSS classes            |

### Popover.Arrow Props

| Prop        | Type                                                                            | Default | Description                                                      |
| ----------- | ------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `children`  | `React.ReactNode`                                                               | -       | Custom arrow element                                             |
| `className` | `string`                                                                        | -       | Additional CSS classes                                           |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, OverlayArrowRenderProps>` | -       | Overrides the default DOM element with a custom render function. |
