# ButtonGroup

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/button-group
> Group related buttons together with consistent styling and spacing


## Import

```tsx
import { ButtonGroup, Button } from '@heroui/react';

```

### Usage

```tsx
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CodeFork,
  Ellipsis,
  Picture,
  Pin,
  QrCode,
  Star,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  ThumbsDown,
  ThumbsUp,
  Video,
} from "@gravity-ui/icons";
import {Button, ButtonGroup, Chip, Description, Dropdown, Label} from "@heroui/react";

export function Basic() {
  return (
    <div className="flex flex-col items-start gap-6">
      {/* Single button with dropdown */}
      <div className="flex flex-col gap-2">
        <ButtonGroup>
          <Button>Merge pull request</Button>
          <Dropdown>
            <Button isIconOnly aria-label="More options">
              <ButtonGroup.Separator />
              <ChevronDown />
            </Button>
            <Dropdown.Popover className="max-w-[290px]" placement="bottom end">
              <Dropdown.Menu>
                <Dropdown.Item
                  className="flex flex-col items-start gap-1"
                  id="merge"
                  textValue="Create a merge commit"
                >
                  <Label>Create a merge commit</Label>
                  <Description>
                    All commits from this branch will be added to the base branch
                  </Description>
                </Dropdown.Item>
                <Dropdown.Item
                  className="flex flex-col items-start gap-1"
                  id="squash-and-merge"
                  textValue="Squash and merge"
                >
                  <Label>Squash and merge</Label>
                  <Description>
                    The 14 commits from this branch will be combined into one commit in the base
                    branch
                  </Description>
                </Dropdown.Item>
                <Dropdown.Item
                  className="flex flex-col items-start gap-1"
                  id="rebase-and-merge"
                  textValue="Rebase and merge"
                >
                  <Label>Rebase and merge</Label>
                  <Description>
                    The 14 commits from this branch will be rebased and added to the base branch
                  </Description>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </ButtonGroup>
      </div>

      {/* Individual buttons */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-x-2 gap-y-4">
          <ButtonGroup variant="tertiary">
            <Button>
              <CodeFork className="size-3.5" />
              Fork
              <Chip color="accent" size="sm" variant="soft">
                24
              </Chip>
            </Button>
            <Button isIconOnly>
              <ButtonGroup.Separator />
              <ChevronDown />
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button isIconOnly>
              <QrCode />
            </Button>
            <Button>
              <ButtonGroup.Separator />
              Scan to pay
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <ThumbsUp />
              <span className="text-xs font-semibold">2.4K</span>
            </Button>
            <Button isIconOnly>
              <ButtonGroup.Separator />
              <ThumbsDown />
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <Star className="size-3.5" />
              Star
            </Button>
            <Button className="px-2">
              <ButtonGroup.Separator />
              <Chip color="accent" size="sm" variant="soft">
                104
              </Chip>
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <Pin />
              Pinned
            </Button>
            <Button isIconOnly>
              <ButtonGroup.Separator />
              <ChevronDown />
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {/* Previous/Next Button Group */}
      <div className="flex flex-col gap-2">
        <ButtonGroup variant="tertiary">
          <Button>
            <ChevronLeft />
            Previous
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Next
            <ChevronRight />
          </Button>
        </ButtonGroup>
      </div>

      {/* Content Selection Button Group */}
      <div className="flex flex-col gap-2">
        <ButtonGroup variant="tertiary">
          <Button>
            <Picture />
            Photos
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <Video />
            Videos
          </Button>
          <Button isIconOnly aria-label="More options">
            <ButtonGroup.Separator />
            <Ellipsis />
          </Button>
        </ButtonGroup>
      </div>

      {/* Text Alignment Button Group */}
      <div className="flex flex-col gap-2">
        <ButtonGroup variant="tertiary">
          <Button>Left</Button>
          <Button>
            <ButtonGroup.Separator />
            Center
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Right
          </Button>
        </ButtonGroup>
      </div>

      {/* Icon-Only Alignment Button Group */}
      <div className="flex flex-col gap-2">
        <ButtonGroup variant="tertiary">
          <Button isIconOnly>
            <TextAlignLeft />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TextAlignCenter />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TextAlignRight />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TextAlignJustify />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

```

### Anatomy

Import the ButtonGroup component and access all parts using dot notation.

```tsx
import { ButtonGroup, Button } from '@heroui/react';

export default () => (
  <ButtonGroup>
    <Button>First</Button>
    <Button>
      <ButtonGroup.Separator />
      Second
    </Button>
    <Button>
      <ButtonGroup.Separator />
      Third
    </Button>
  </ButtonGroup>
);

```

> **ButtonGroup** wraps multiple Button components together, applying consistent styling, spacing, and automatic border radius handling. It uses React Context to pass `size`, `variant`, and `isDisabled` props to all child buttons.

### Variants

```tsx
import {Button, ButtonGroup} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">Primary</p>
        <ButtonGroup variant="primary">
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">Secondary</p>
        <ButtonGroup variant="secondary">
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">Tertiary</p>
        <ButtonGroup variant="tertiary">
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">Outline</p>
        <ButtonGroup variant="outline">
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">Ghost</p>
        <ButtonGroup variant="ghost">
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">Danger</p>
        <ButtonGroup variant="danger">
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

```

### Sizes

```tsx
import {Button, ButtonGroup} from "@heroui/react";

export function Sizes() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted">Small</p>
        <ButtonGroup size="sm" variant="secondary">
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted">Medium (default)</p>
        <ButtonGroup size="md" variant="secondary">
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted">Large</p>
        <ButtonGroup size="lg" variant="secondary">
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

```

### Orientation

Use the `orientation` prop to arrange buttons horizontally or vertically.

```tsx
import {TextAlignCenter, TextAlignJustify, TextAlignLeft, TextAlignRight} from "@gravity-ui/icons";
import {Button, ButtonGroup} from "@heroui/react";

export function Orientation() {
  return (
    <div className="flex items-start gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">Horizontal</span>
        <ButtonGroup orientation="horizontal" variant="tertiary">
          <Button isIconOnly>
            <TextAlignLeft />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TextAlignCenter />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TextAlignRight />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TextAlignJustify />
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">Vertical</span>
        <ButtonGroup orientation="vertical" variant="tertiary">
          <Button isIconOnly>
            <TextAlignLeft />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TextAlignCenter />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TextAlignRight />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TextAlignJustify />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

```

### With Icons

```tsx
import {Globe, Plus, TrashBin} from "@gravity-ui/icons";
import {Button, ButtonGroup} from "@heroui/react";

export function WithIcons() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted">With icons</p>
        <ButtonGroup variant="secondary">
          <Button>
            <Globe />
            Search
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <Plus />
            Add
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <TrashBin />
            Delete
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted">Icon only buttons</p>
        <ButtonGroup variant="tertiary">
          <Button isIconOnly>
            <Globe />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <Plus />
          </Button>
          <Button isIconOnly>
            <ButtonGroup.Separator />
            <TrashBin />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

```

### Full Width

```tsx
import {TextAlignCenter, TextAlignLeft, TextAlignRight} from "@gravity-ui/icons";
import {Button, ButtonGroup} from "@heroui/react";

export function FullWidth() {
  return (
    <div className="w-[400px] space-y-3">
      <ButtonGroup fullWidth>
        <Button>First</Button>
        <Button>
          <ButtonGroup.Separator />
          Second
        </Button>
        <Button>
          <ButtonGroup.Separator />
          Third
        </Button>
      </ButtonGroup>
      <ButtonGroup fullWidth>
        <Button isIconOnly>
          <TextAlignLeft />
        </Button>
        <Button isIconOnly>
          <ButtonGroup.Separator />
          <TextAlignCenter />
        </Button>
        <Button isIconOnly>
          <ButtonGroup.Separator />
          <TextAlignRight />
        </Button>
      </ButtonGroup>
    </div>
  );
}

```

### Disabled State

```tsx
import {Button, ButtonGroup} from "@heroui/react";

export function Disabled() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted">All buttons disabled</p>
        <ButtonGroup isDisabled>
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Third
          </Button>
        </ButtonGroup>
      </div>
      <div className="flex flex-col items-start gap-2">
        <p className="text-sm text-muted">Group disabled, but one button overrides</p>
        <ButtonGroup isDisabled>
          <Button>First</Button>
          <Button>
            <ButtonGroup.Separator />
            Second
          </Button>
          <Button isDisabled={false}>
            <ButtonGroup.Separator />
            Third (enabled)
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

```

### Without Separator

Simply omit the `<ButtonGroup.Separator />` component from your buttons.

```tsx
import {Button, ButtonGroup} from "@heroui/react";

export function WithoutSeparator() {
  return (
    <ButtonGroup>
      <Button>First</Button>
      <Button>Second</Button>
      <Button>Third</Button>
    </ButtonGroup>
  );
}

```

## Related Components

* **Button**: Allows a user to perform an action
* **Dropdown**: Context menu with actions and options
* **Chip**: Compact elements for tags and filters

## Styling

### Passing Tailwind CSS classes

```tsx
import { ButtonGroup, Button } from '@heroui/react';

function CustomButtonGroup() {
  return (
    <ButtonGroup className="gap-2">
      <Button>First</Button>
      <Button>
        <ButtonGroup.Separator />
        Second
      </Button>
      <Button>
        <ButtonGroup.Separator />
        Third
      </Button>
    </ButtonGroup>
  );
}

```

### Customizing the component classes

To customize the ButtonGroup component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .button-group {
    @apply gap-2 rounded-lg;
  }

  .button-group__separator {
    @apply opacity-25;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The ButtonGroup component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/button-group.css)):

#### Base Classes

* `.button-group` - Base button group container
* `.button-group--full-width` - Full width modifier
* `.button-group__separator` - Separator element between buttons

The ButtonGroup component automatically applies border radius to buttons:

* First button gets rounded left/start edge
* Last button gets rounded right/end edge
* Middle buttons have no border radius
* Single button gets full border radius on all edges

Add `<ButtonGroup.Separator />` inside each Button (except the first) to show dividers between buttons.

## API Reference

### ButtonGroup Props

| Prop          | Type                                                            | Default        | Description                                                                             |
| ------------- | --------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| `variant`     | `'primary' \| 'secondary' \| 'tertiary' \| 'ghost' \| 'danger'` | -              | Visual style variant applied to all buttons in the group                                |
| `size`        | `'sm' \| 'md' \| 'lg'`                                          | -              | Size applied to all buttons in the group                                                |
| `orientation` | `'horizontal' \| 'vertical'`                                    | `'horizontal'` | The orientation of the button group                                                     |
| `fullWidth`   | `boolean`                                                       | `false`        | Whether the button group should take full width of its container                        |
| `isDisabled`  | `boolean`                                                       | `false`        | Whether all buttons in the group are disabled (can be overridden on individual buttons) |
| `className`   | `string`                                                        | -              | Additional CSS classes                                                                  |
| `children`    | `React.ReactNode`                                               | -              | Button components to group together                                                     |

### ButtonGroup.Separator Props

| Prop        | Type     | Default | Description            |
| ----------- | -------- | ------- | ---------------------- |
| `className` | `string` | -       | Additional CSS classes |

### Notes

* ButtonGroup uses React Context to pass `size`, `variant`, and `isDisabled` props to all child Button components
* **Only direct child buttons receive the ButtonGroup props** - Buttons nested inside other components (like Modal, Dropdown, etc.) will not inherit the group's props even if they are descendants of the ButtonGroup
* Individual Button components can override the group's `isDisabled` prop by setting `isDisabled={false}`
* The component automatically handles border radius between buttons
* Add `<ButtonGroup.Separator />` inside each Button (except the first) to show dividers between buttons
* Buttons in a group have their active/pressed scale transform removed for a more cohesive appearance
