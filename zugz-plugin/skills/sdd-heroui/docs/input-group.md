# InputGroup

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/input-group
> Group related input controls with prefix and suffix elements for enhanced form fields


## Import

```tsx
import { InputGroup } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {Envelope} from "@gravity-ui/icons";
import {InputGroup, Label, TextField} from "@heroui/react";

export function Default() {
  return (
    <TextField className="w-full max-w-[280px]" name="email">
      <Label>Email address</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Envelope className="size-4 text-muted" />
        </InputGroup.Prefix>
        <InputGroup.Input className="w-full max-w-[280px]" placeholder="name@email.com" />
      </InputGroup>
    </TextField>
  );
}

```

### Anatomy

```tsx
import {InputGroup, TextField, Label} from '@heroui/react';

export default () => (
  <TextField>
    <Label />
    <InputGroup>
      <InputGroup.Prefix />
      <InputGroup.Input /> {/* Or use InputGroup.TextArea for multiline input */}
      <InputGroup.Suffix />
    </InputGroup>
  </TextField>
)

```

> **InputGroup** wraps an input field with optional prefix and suffix elements, creating a visually cohesive group. It's typically used within **[TextField](/docs/components/text-field)** to add icons, text, buttons, or other elements before or after the input. Use **InputGroup.Input** for single-line inputs or **InputGroup.TextArea** for multiline text inputs.

### With Prefix Icon

Add an icon before the input field.

```tsx
"use client";

import {Envelope} from "@gravity-ui/icons";
import {Description, InputGroup, Label, TextField} from "@heroui/react";

export function WithPrefixIcon() {
  return (
    <TextField className="w-full max-w-[280px]" name="email">
      <Label>Email address</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Envelope className="size-4 text-muted" />
        </InputGroup.Prefix>
        <InputGroup.Input className="w-full max-w-[280px]" placeholder="name@email.com" />
      </InputGroup>
      <Description>We'll never share this with anyone else</Description>
    </TextField>
  );
}

```

### With Suffix Icon

Add an icon after the input field.

```tsx
"use client";

import {Envelope} from "@gravity-ui/icons";
import {Description, InputGroup, Label, TextField} from "@heroui/react";

export function WithSuffixIcon() {
  return (
    <TextField className="w-full max-w-[280px]" name="email">
      <Label>Email address</Label>
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" placeholder="name@email.com" />
        <InputGroup.Suffix>
          <Envelope className="size-4 text-muted" />
        </InputGroup.Suffix>
      </InputGroup>
      <Description>We don't send spam</Description>
    </TextField>
  );
}

```

### With Prefix and Suffix

Combine both prefix and suffix elements.

```tsx
"use client";

import {Description, InputGroup, Label, TextField} from "@heroui/react";

export function WithPrefixAndSuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="10" name="price">
      <Label>Set a price</Label>
      <InputGroup>
        <InputGroup.Prefix>$</InputGroup.Prefix>
        <InputGroup.Input className="w-full max-w-[200px]" type="number" />
        <InputGroup.Suffix>USD</InputGroup.Suffix>
      </InputGroup>
      <Description>What customers would pay</Description>
    </TextField>
  );
}

```

### Text Prefix

Use text as a prefix, such as currency symbols or protocol prefixes.

```tsx
"use client";

import {InputGroup, Label, TextField} from "@heroui/react";

export function WithTextPrefix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="heroui.com" name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Prefix>https://</InputGroup.Prefix>
        <InputGroup.Input className="w-full max-w-[280px]" />
      </InputGroup>
    </TextField>
  );
}

```

### Text Suffix

Use text as a suffix, such as domain extensions or units.

```tsx
"use client";

import {InputGroup, Label, TextField} from "@heroui/react";

export function WithTextSuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="heroui" name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" />
        <InputGroup.Suffix>.com</InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### Icon Prefix and Text Suffix

Combine an icon prefix with a text suffix.

```tsx
"use client";

import {Globe} from "@gravity-ui/icons";
import {InputGroup, Label, TextField} from "@heroui/react";

export function WithIconPrefixAndTextSuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="heroui" name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Globe className="size-4 text-muted" />
        </InputGroup.Prefix>
        <InputGroup.Input className="w-full max-w-[280px]" />
        <InputGroup.Suffix>.com</InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### Copy Button Suffix

Add an interactive button in the suffix, such as a copy button.

```tsx
"use client";

import {Copy} from "@gravity-ui/icons";
import {Button, InputGroup, Label, TextField} from "@heroui/react";

export function WithCopySuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="heroui.com" name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" />
        <InputGroup.Suffix className="pr-0">
          <Button isIconOnly aria-label="Copy" size="sm" variant="ghost">
            <Copy className="size-4" />
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### Icon Prefix and Copy Button

Combine an icon prefix with an interactive button suffix.

```tsx
"use client";

import {Copy, Globe} from "@gravity-ui/icons";
import {Button, InputGroup, Label, TextField} from "@heroui/react";

export function WithIconPrefixAndCopySuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="heroui.com" name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Globe className="size-4 text-muted" />
        </InputGroup.Prefix>
        <InputGroup.Input className="w-full max-w-[280px]" />
        <InputGroup.Suffix className="pr-0">
          <Button isIconOnly aria-label="Copy" size="sm" variant="ghost">
            <Copy className="size-4" />
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### Password Toggle

Use a button in the suffix to toggle password visibility.

```tsx
"use client";

import {Eye, EyeSlash} from "@gravity-ui/icons";
import {Button, InputGroup, Label, TextField} from "@heroui/react";
import {useState} from "react";

export function PasswordWithToggle() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField className="w-full max-w-[280px]" name="password">
      <Label>Password</Label>
      <InputGroup>
        <InputGroup.Input
          className="w-full max-w-[280px]"
          type={isVisible ? "text" : "password"}
          value={isVisible ? "87$2h.3diua" : "••••••••"}
        />
        <InputGroup.Suffix className="pr-0">
          <Button
            isIconOnly
            aria-label={isVisible ? "Hide password" : "Show password"}
            size="sm"
            variant="ghost"
            onPress={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <Eye className="size-4" /> : <EyeSlash className="size-4" />}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### Loading State

Show a loading spinner in the suffix to indicate processing.

```tsx
"use client";

import {InputGroup, Spinner, TextField} from "@heroui/react";

export function WithLoadingSuffix() {
  return (
    <TextField className="w-full max-w-[280px]" defaultValue="Sending..." name="status">
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" />
        <InputGroup.Suffix>
          <Spinner className="size-4" />
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### Keyboard Shortcut

Display keyboard shortcuts using the [Kbd](/docs/components/kbd) component.

```tsx
"use client";

import {InputGroup, Kbd, TextField} from "@heroui/react";

export function WithKeyboardShortcut() {
  return (
    <TextField aria-label="Command" className="w-full max-w-[280px]" name="command">
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" placeholder="Command" />
        <InputGroup.Suffix className="pr-2">
          <Kbd>
            <Kbd.Abbr keyValue="command" />
            <Kbd.Content>K</Kbd.Content>
          </Kbd>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### Badge Suffix

Add a badge or chip in the suffix to show status or labels.

```tsx
"use client";

import {Chip, InputGroup, TextField} from "@heroui/react";

export function WithBadgeSuffix() {
  return (
    <TextField aria-label="Email address" className="w-full max-w-[280px]" name="email">
      <InputGroup>
        <InputGroup.Input className="w-full max-w-[280px]" placeholder="Email address" />
        <InputGroup.Suffix className="pr-2">
          <Chip color="accent" size="md" variant="soft">
            Pro
          </Chip>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### Required Field

InputGroup respects the required state from its parent TextField.

```tsx
"use client";

import {Envelope} from "@gravity-ui/icons";
import {Description, InputGroup, Label, TextField} from "@heroui/react";

export function Required() {
  return (
    <div className="flex flex-col gap-4">
      <TextField isRequired className="w-full max-w-[280px]" name="email">
        <Label>Email address</Label>
        <InputGroup>
          <InputGroup.Prefix>
            <Envelope className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input className="w-full max-w-[280px]" placeholder="name@email.com" />
        </InputGroup>
      </TextField>
      <TextField isRequired className="w-full max-w-[280px]" name="price">
        <Label>Set a price</Label>
        <InputGroup>
          <InputGroup.Prefix>$</InputGroup.Prefix>
          <InputGroup.Input className="w-full max-w-[200px]" placeholder="0" type="number" />
          <InputGroup.Suffix>USD</InputGroup.Suffix>
        </InputGroup>
        <Description>What customers would pay</Description>
      </TextField>
    </div>
  );
}

```

### Validation

InputGroup automatically reflects invalid state from its parent TextField.

```tsx
"use client";

import {Envelope} from "@gravity-ui/icons";
import {FieldError, InputGroup, Label, TextField} from "@heroui/react";

export function Invalid() {
  return (
    <div className="flex flex-col gap-4">
      <TextField isInvalid isRequired className="w-full max-w-[280px]" name="email">
        <Label>Email address</Label>
        <InputGroup>
          <InputGroup.Prefix>
            <Envelope className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input className="w-full max-w-[280px]" placeholder="name@email.com" />
        </InputGroup>
        <FieldError>Please enter a valid email address</FieldError>
      </TextField>
      <TextField isInvalid isRequired className="w-full max-w-[280px]" name="price">
        <Label>Set a price</Label>
        <InputGroup>
          <InputGroup.Prefix>$</InputGroup.Prefix>
          <InputGroup.Input className="w-full max-w-[200px]" placeholder="0" type="number" />
          <InputGroup.Suffix>USD</InputGroup.Suffix>
        </InputGroup>
        <FieldError>Price must be greater than 0</FieldError>
      </TextField>
    </div>
  );
}

```

### Disabled State

InputGroup respects the disabled state from its parent TextField.

```tsx
"use client";

import {Envelope} from "@gravity-ui/icons";
import {InputGroup, Label, TextField} from "@heroui/react";

export function Disabled() {
  return (
    <div className="flex flex-col gap-4">
      <TextField
        isDisabled
        className="w-full max-w-[280px]"
        defaultValue="name@email.com"
        name="email"
      >
        <Label>Email address</Label>
        <InputGroup>
          <InputGroup.Prefix>
            <Envelope className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input className="w-full max-w-[280px]" />
        </InputGroup>
      </TextField>
      <TextField isDisabled className="w-full max-w-[280px]" defaultValue="10" name="price">
        <Label>Set a price</Label>
        <InputGroup>
          <InputGroup.Prefix>$</InputGroup.Prefix>
          <InputGroup.Input className="w-full max-w-[200px]" type="number" />
          <InputGroup.Suffix>USD</InputGroup.Suffix>
        </InputGroup>
      </TextField>
    </div>
  );
}

```

### Full Width

```tsx
import {Envelope, Eye} from "@gravity-ui/icons";
import {InputGroup, Label, TextField} from "@heroui/react";

export function FullWidth() {
  return (
    <div className="w-[400px] space-y-4">
      <TextField fullWidth name="email">
        <Label>Email address</Label>
        <InputGroup fullWidth>
          <InputGroup.Prefix>
            <Envelope className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="name@email.com" />
        </InputGroup>
      </TextField>
      <TextField fullWidth name="password">
        <Label>Password</Label>
        <InputGroup fullWidth>
          <InputGroup.Input placeholder="Enter password" type="password" />
          <InputGroup.Suffix>
            <Eye className="size-4 text-muted" />
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>
    </div>
  );
}

```

### Variants

The InputGroup component supports two visual variants:

* **`primary`** (default) - Standard styling with shadow, suitable for most use cases
* **`secondary`** - Lower emphasis variant without shadow, suitable for use in Surface components

```tsx
import {Envelope} from "@gravity-ui/icons";
import {InputGroup, Label, TextField} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-col gap-4">
      <TextField className="w-[280px]" name="primary">
        <Label>Primary variant</Label>
        <InputGroup variant="primary">
          <InputGroup.Prefix>
            <Envelope className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="name@email.com" />
        </InputGroup>
      </TextField>
      <TextField className="w-[280px]" name="secondary">
        <Label>Secondary variant</Label>
        <InputGroup variant="secondary">
          <InputGroup.Prefix>
            <Envelope className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="name@email.com" />
        </InputGroup>
      </TextField>
    </div>
  );
}

```

### In Surface

When used inside a [Surface](/docs/components/surface) component, use `variant="secondary"` to apply the lower emphasis variant suitable for surface backgrounds.

```tsx
"use client";

import {Envelope} from "@gravity-ui/icons";
import {Description, InputGroup, Label, Surface, TextField} from "@heroui/react";

export function OnSurface() {
  return (
    <Surface className="rounded-2xl p-6">
      <TextField className="w-full max-w-[280px]" name="email">
        <Label>Email address</Label>
        <InputGroup variant="secondary">
          <InputGroup.Prefix>
            <Envelope className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input className="w-full max-w-[280px]" placeholder="name@email.com" />
        </InputGroup>
        <Description>We'll never share this with anyone else</Description>
      </TextField>
    </Surface>
  );
}

```

### With TextArea

Use **InputGroup.TextArea** for multiline text inputs with prefix and suffix elements. When a textarea is present, the container automatically adjusts its height to accommodate the content and aligns prefix/suffix elements to the top.

```tsx
"use client";

import {ArrowUp, At, Microphone, PlugConnection, Plus} from "@gravity-ui/icons";
import {Button, InputGroup, Kbd, Spinner, TextField, Tooltip} from "@heroui/react";
import {useState} from "react";

export function WithTextArea() {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!value.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setValue("");
    }, 1000);
  };

  return (
    <TextField
      fullWidth
      aria-label="Prompt input"
      className="flex w-sm flex-col sm:w-lg"
      name="prompt"
    >
      <InputGroup fullWidth className="flex flex-col gap-2 rounded-3xl py-2">
        <InputGroup.Prefix className="px-3 py-0">
          <Button aria-label="Add context" size="sm" variant="outline">
            <At />
            Add Context
          </Button>
        </InputGroup.Prefix>
        <InputGroup.TextArea
          className="w-full resize-none px-3.5 py-0"
          placeholder="Assign tasks or ask anything..."
          rows={5}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <InputGroup.Suffix className="flex w-full items-center gap-1.5 px-3 py-0">
          <Tooltip delay={0}>
            <Button isIconOnly aria-label="Attach file" size="sm" variant="tertiary">
              <Plus />
            </Button>
            <Tooltip.Content>
              <p className="text-xs">Add a files and more</p>
            </Tooltip.Content>
          </Tooltip>
          <Tooltip delay={0}>
            <Button isIconOnly aria-label="Connect Apps" size="sm" variant="tertiary">
              <PlugConnection />
            </Button>
            <Tooltip.Content>
              <p className="text-xs">Connect apps</p>
            </Tooltip.Content>
          </Tooltip>
          <div className="ml-auto flex items-center gap-1.5">
            <Tooltip delay={0}>
              <Button isIconOnly aria-label="Voice input" size="sm" variant="ghost">
                <Microphone />
              </Button>
              <Tooltip.Content>
                <p className="text-xs">Voice input</p>
              </Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Button
                isIconOnly
                aria-label="Send prompt"
                isDisabled={!value.trim()}
                isPending={isSubmitting}
                onPress={handleSubmit}
              >
                {({isPending}) => (isPending ? <Spinner color="current" size="sm" /> : <ArrowUp />)}
              </Button>
              <Tooltip.Content className="flex items-center gap-1">
                <p className="text-xs">Send</p>
                <Kbd className="h-4 rounded-sm px-1">
                  <Kbd.Abbr keyValue="enter" />
                </Kbd>
              </Tooltip.Content>
            </Tooltip>
          </div>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

## Related Components

* **TextField**: Composition-friendly fields with labels and validation
* **Input**: Single-line text input built on React Aria
* **Label**: Accessible label for form controls



## Styling

### Passing Tailwind CSS classes

```tsx
import {InputGroup, TextField, Label} from '@heroui/react';

function CustomInputGroup() {
  return (
    <TextField>
      <Label>Website</Label>
      <InputGroup className="rounded-xl border-2 border-primary">
        <InputGroup.Prefix className="bg-primary/10 text-primary">
          https://
        </InputGroup.Prefix>
        <InputGroup.Input className="font-medium" />
        <InputGroup.Suffix className="bg-primary/10 text-primary">
          .com
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### Customizing the component classes

InputGroup uses CSS classes that can be customized. Override the component classes to match your design system.

```css
@layer components {
  .input-group {
    @apply bg-field text-field-foreground shadow-field rounded-field inline-flex min-h-9 items-center overflow-hidden border text-sm outline-none;
  }

  .input-group__input {
    @apply flex-1 rounded-none border-0 bg-transparent px-3 py-2 shadow-none outline-none;
  }

  .input-group__prefix {
    @apply text-field-placeholder rounded-l-field flex h-full items-center justify-center rounded-r-none bg-transparent px-3;
  }

  .input-group__suffix {
    @apply text-field-placeholder rounded-r-field flex h-full items-center justify-center rounded-l-none bg-transparent px-3;
  }

  /* Secondary variant */
  .input-group--secondary {
    @apply shadow-none;
    background-color: var(--color-default);
  }
}

```

### CSS Classes

* `.input-group` – Root container with border, background, and flex layout. Uses `min-h-9` for flexible height and `items-center` by default, switching to `items-start` when a textarea is present.
* `.input-group__input` – Input element with transparent background and no border. Also used as the base class for textarea elements.
* `.input-group__prefix` – Prefix container with left border radius. Aligns to top when used with textarea.
* `.input-group__suffix` – Suffix container with right border radius. Aligns to top when used with textarea.
* `.input-group--primary` – Primary variant with shadow (default)
* `.input-group--secondary` – Secondary variant without shadow, suitable for use in surfaces

**Note**: When using `InputGroup.TextArea`, the container automatically switches from `items-center` to `items-start` alignment and uses `height: auto` instead of a fixed height. Prefix and suffix elements align to the top with additional padding to match the textarea's vertical padding. The textarea uses the same `.input-group__input` base class with textarea-specific styles (minimum height and vertical resize) applied via the `[data-slot="input-group-textarea"]` attribute selector.

### Interactive States

InputGroup automatically manages these data attributes based on its state:

* **Hover**: `[data-hovered]` - Applied when hovering over the group
* **Focus Within**: `[data-focus-within]` - Applied when the input is focused
* **Invalid**: `[data-invalid]` - Applied when parent TextField is invalid
* **Disabled**: `[data-disabled]` or `[aria-disabled]` - Applied when parent TextField is disabled

## API Reference

### InputGroup Props

InputGroup inherits all props from React Aria's [Group](https://react-spectrum.adobe.com/react-aria/Group.html) component.

#### Base Props

| Prop        | Type                                                                       | Default | Description                                                            |
| ----------- | -------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| `children`  | `React.ReactNode \| (values: GroupRenderProps) => React.ReactNode`         | -       | Child components (Input, TextArea, Prefix, Suffix) or render function. |
| `className` | `string \| (values: GroupRenderProps) => string`                           | -       | CSS classes for styling, supports render props.                        |
| `style`     | `React.CSSProperties \| (values: GroupRenderProps) => React.CSSProperties` | -       | Inline styles, supports render props.                                  |
| `fullWidth` | `boolean`                                                                  | `false` | Whether the input group should take full width of its container        |
| `id`        | `string`                                                                   | -       | The element's unique identifier.                                       |

#### Variant Props

| Prop      | Type                       | Default     | Description                                                                                                                                                        |
| --------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `variant` | `"primary" \| "secondary"` | `"primary"` | Visual variant of the component. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |

#### Accessibility Props

| Prop               | Type                                    | Default   | Description                                                                                                    |
| ------------------ | --------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `aria-label`       | `string`                                | -         | Accessibility label when no visible label is present.                                                          |
| `aria-labelledby`  | `string`                                | -         | ID of elements that label this group.                                                                          |
| `aria-describedby` | `string`                                | -         | ID of elements that describe this group.                                                                       |
| `aria-details`     | `string`                                | -         | ID of elements with additional details.                                                                        |
| `role`             | `'group' \| 'region' \| 'presentation'` | `'group'` | Accessibility role for the group. Use 'region' for important content, 'presentation' for visual-only grouping. |

### Composition Components

InputGroup works with these subcomponents:

* **InputGroup.Root** - Root container (also available as `InputGroup`)
* **InputGroup.Input** - Single-line input element component
* **InputGroup.TextArea** - Multiline textarea element component
* **InputGroup.Prefix** - Prefix container component
* **InputGroup.Suffix** - Suffix container component

#### InputGroup.Input Props

InputGroup.Input inherits all props from React Aria's [Input](https://react-spectrum.adobe.com/react-aria/Input.html) component.

| Prop           | Type                       | Default     | Description                                                                                                                                                    |
| -------------- | -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`    | `string`                   | -           | CSS classes for styling.                                                                                                                                       |
| `variant`      | `"primary" \| "secondary"` | `"primary"` | Visual variant of the input. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |
| `type`         | `string`                   | `'text'`    | Input type (text, password, email, etc.).                                                                                                                      |
| `value`        | `string`                   | -           | Current value (controlled).                                                                                                                                    |
| `defaultValue` | `string`                   | -           | Default value (uncontrolled).                                                                                                                                  |
| `placeholder`  | `string`                   | -           | Placeholder text.                                                                                                                                              |
| `disabled`     | `boolean`                  | -           | Whether the input is disabled.                                                                                                                                 |
| `readOnly`     | `boolean`                  | -           | Whether the input is read-only.                                                                                                                                |

#### InputGroup.TextArea Props

InputGroup.TextArea inherits all props from React Aria's [TextArea](https://react-spectrum.adobe.com/react-aria/TextArea.html) component.

| Prop           | Type                       | Default     | Description                                                                                                                                                       |
| -------------- | -------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`    | `string`                   | -           | CSS classes for styling.                                                                                                                                          |
| `variant`      | `"primary" \| "secondary"` | `"primary"` | Visual variant of the textarea. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |
| `value`        | `string`                   | -           | Current value (controlled).                                                                                                                                       |
| `defaultValue` | `string`                   | -           | Default value (uncontrolled).                                                                                                                                     |
| `placeholder`  | `string`                   | -           | Placeholder text.                                                                                                                                                 |
| `rows`         | `number`                   | -           | Number of visible text lines.                                                                                                                                     |
| `disabled`     | `boolean`                  | -           | Whether the textarea is disabled.                                                                                                                                 |
| `readOnly`     | `boolean`                  | -           | Whether the textarea is read-only.                                                                                                                                |

#### InputGroup.Prefix Props

| Prop        | Type              | Default | Description                                           |
| ----------- | ----------------- | ------- | ----------------------------------------------------- |
| `children`  | `React.ReactNode` | -       | Content to display in the prefix (icons, text, etc.). |
| `className` | `string`          | -       | CSS classes for styling.                              |

#### InputGroup.Suffix Props

| Prop        | Type              | Default | Description                                                      |
| ----------- | ----------------- | ------- | ---------------------------------------------------------------- |
| `children`  | `React.ReactNode` | -       | Content to display in the suffix (icons, buttons, badges, etc.). |
| `className` | `string`          | -       | CSS classes for styling.                                         |

### Usage Example

```tsx
import {InputGroup, TextField, Label, Button} from '@heroui/react';
import {Icon} from '@iconify/react';

function Example() {
  return (
    <TextField>
      <Label>Email</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Icon icon="gravity-ui:envelope" />
        </InputGroup.Prefix>
        <InputGroup.Input placeholder="name@email.com" />
        <InputGroup.Suffix>
          <Button isIconOnly size="sm" variant="ghost">
            <Icon icon="gravity-ui:check" />
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}

```

### TextArea Usage Example

```tsx
import {Envelope} from "@gravity-ui/icons";
import {Description, FieldError, InputGroup, Label, TextField} from "@heroui/react";
import {useState} from "react";

function TextAreaExample() {
  const [feedback, setFeedback] = useState("");

  return (
    <TextField fullWidth isInvalid={feedback.length > 500} name="feedback" onChange={setFeedback}>
      <Label>Your Feedback</Label>
      <InputGroup fullWidth>
        <InputGroup.Prefix>
          <Envelope className="size-4 text-muted" />
        </InputGroup.Prefix>
        <InputGroup.TextArea
          className="resize-none"
          placeholder="Share your thoughts, suggestions, or issues..."
          rows={5}
          value={feedback}
        />
      </InputGroup>
      <Description className="flex w-full items-center justify-between px-1">
        <span>Maximum 500 characters.</span>
        <span className="ml-auto">{feedback.length}/500</span>
      </Description>
      <FieldError>Feedback must be less than 500 characters</FieldError>
    </TextField>
  );
}

```
