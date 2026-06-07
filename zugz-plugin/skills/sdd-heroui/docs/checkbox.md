# Checkbox

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/checkbox
> Checkboxes allow users to select multiple items from a list of individual items, or to mark one individual item as selected.


## Import

```tsx
import { Checkbox, Label } from '@heroui/react';

```

### Usage

```tsx
import {Checkbox, Label} from "@heroui/react";

export function Basic() {
  return (
    <Checkbox id="basic-terms">
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label htmlFor="basic-terms">Accept terms and conditions</Label>
      </Checkbox.Content>
    </Checkbox>
  );
}

```

### Anatomy

Import the Checkbox component and access all parts using dot notation.

```tsx
import { Checkbox, Label, Description } from '@heroui/react';

export default () => (
  <Checkbox>
    <Checkbox.Control>
      <Checkbox.Indicator />  
    </Checkbox.Control>
    <Checkbox.Content>
      <Label />
      <Description /> {/* Optional */}
    </Checkbox.Content>
  </Checkbox>
);

```

### Disabled

```tsx
import {Checkbox, Description, Label} from "@heroui/react";

export function Disabled() {
  return (
    <Checkbox isDisabled id="feature">
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label htmlFor="feature">Premium Feature</Label>
        <Description>This feature is coming soon</Description>
      </Checkbox.Content>
    </Checkbox>
  );
}

```

### Default Selected

```tsx
import {Checkbox, Label} from "@heroui/react";

export function DefaultSelected() {
  return (
    <Checkbox defaultSelected id="default-notifications">
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label htmlFor="default-notifications">Enable email notifications</Label>
      </Checkbox.Content>
    </Checkbox>
  );
}

```

### Controlled

```tsx
"use client";

import {Checkbox, Label} from "@heroui/react";
import {useState} from "react";

export function Controlled() {
  const [isSelected, setIsSelected] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Checkbox id="email-notifications" isSelected={isSelected} onChange={setIsSelected}>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label htmlFor="email-notifications">Email notifications</Label>
          </Checkbox.Content>
        </Checkbox>
      </div>
      <p className="text-sm text-muted">
        Status: <span className="font-medium">{isSelected ? "Enabled" : "Disabled"}</span>
      </p>
    </div>
  );
}

```

### Indeterminate

```tsx
"use client";

import {Checkbox, Description, Label} from "@heroui/react";
import {useState} from "react";

export function Indeterminate() {
  const [isIndeterminate, setIsIndeterminate] = useState(true);
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Checkbox
      id="select-all"
      isIndeterminate={isIndeterminate}
      isSelected={isSelected}
      onChange={(selected: boolean) => {
        setIsSelected(selected);
        setIsIndeterminate(false);
      }}
    >
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label htmlFor="select-all">Select all</Label>
        <Description>Shows indeterminate state (dash icon)</Description>
      </Checkbox.Content>
    </Checkbox>
  );
}

```

### With Label

```tsx
import {Checkbox, Label} from "@heroui/react";

export function WithLabel() {
  return (
    <Checkbox id="label-marketing">
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label htmlFor="label-marketing">Send me marketing emails</Label>
      </Checkbox.Content>
    </Checkbox>
  );
}

```

### With Description

```tsx
import {Checkbox, Description, Label} from "@heroui/react";

export function WithDescription() {
  return (
    <Checkbox id="description-notifications">
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label htmlFor="description-notifications">Email notifications</Label>
        <Description>Get notified when someone mentions you in a comment</Description>
      </Checkbox.Content>
    </Checkbox>
  );
}

```

### Render Props

```tsx
"use client";

import {Checkbox, Description, Label} from "@heroui/react";

export function RenderProps() {
  return (
    <Checkbox id="render-props-terms">
      {({isSelected}) => (
        <>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label htmlFor="render-props-terms">
              {isSelected ? "Terms accepted" : "Accept terms"}
            </Label>
            <Description>
              {isSelected ? "Thank you for accepting" : "Please read and accept the terms"}
            </Description>
          </Checkbox.Content>
        </>
      )}
    </Checkbox>
  );
}

```

### Form Integration

```tsx
"use client";

import {Button, Checkbox, Label} from "@heroui/react";
import React from "react";

export function Form() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    alert(
      `Form submitted with:\n${Array.from(formData.entries())
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")}`,
    );
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Checkbox id="form-notifications" name="notifications" value="on">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox>
          <Checkbox.Content>
            <Label htmlFor="form-notifications">Enable notifications</Label>
          </Checkbox.Content>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox defaultSelected id="form-newsletter" name="newsletter" value="on">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox>
          <Checkbox.Content>
            <Label htmlFor="form-newsletter">Subscribe to newsletter</Label>
          </Checkbox.Content>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox id="form-marketing" name="marketing" value="on">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox>
          <Checkbox.Content>
            <Label htmlFor="form-marketing">Receive marketing updates</Label>
          </Checkbox.Content>
        </div>
      </div>
      <Button className="mt-4" size="sm" type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
}

```

### Invalid

```tsx
import {Checkbox, Description, Label} from "@heroui/react";

export function Invalid() {
  return (
    <Checkbox isInvalid name="agreement">
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label htmlFor="agreement">I agree to the terms</Label>
        <Description>You must accept the terms to continue</Description>
      </Checkbox.Content>
    </Checkbox>
  );
}

```

### Custom Indicator

```tsx
"use client";

import {Checkbox, Label} from "@heroui/react";

export function CustomIndicator() {
  return (
    <div className="flex gap-4">
      <Checkbox defaultSelected name="heart">
        <Checkbox.Control>
          <Checkbox.Indicator>
            {({isSelected}) =>
              isSelected ? (
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
                    fill="currentColor"
                  />
                </svg>
              ) : null
            }
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Heart</Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox defaultSelected name="plus">
        <Checkbox.Control>
          <Checkbox.Indicator>
            {({isSelected}) =>
              isSelected ? (
                <svg fill="none" viewBox="0 0 24 24">
                  <path
                    d="M6 12H18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  />
                  <path
                    d="M12 18V6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                  />
                </svg>
              ) : null
            }
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Plus</Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox isIndeterminate name="indeterminate">
        <Checkbox.Control>
          <Checkbox.Indicator>
            {({isIndeterminate}) =>
              isIndeterminate ? (
                <svg stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <line x1="21" x2="3" y1="12" y2="12" />
                </svg>
              ) : null
            }
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Indeterminate</Label>
        </Checkbox.Content>
      </Checkbox>
    </div>
  );
}

```

### Full Rounded

```tsx
import {Checkbox, Label} from "@heroui/react";

export function FullRounded() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Label className="text-muted">Rounded checkboxes</Label>
        <Checkbox
          className="[&_[data-slot='checkbox-default-indicator--checkmark']]:size-2"
          name="small-rounded"
        >
          <Checkbox.Control className="size-3 rounded-full before:rounded-full">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Small size</Label>
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div className="flex flex-col gap-3">
        <Checkbox name="default-rounded">
          <Checkbox.Control className="size-4 rounded-full before:rounded-full">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Default size</Label>
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div className="flex flex-col gap-3">
        <Checkbox name="large-rounded">
          <Checkbox.Control className="size-5 rounded-full before:rounded-full">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Large size</Label>
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div className="flex flex-col gap-3">
        <Checkbox
          className="[&_[data-slot='checkbox-default-indicator--checkmark']]:size-4"
          name="xl-rounded"
        >
          <Checkbox.Control className="size-6 rounded-full before:rounded-full">
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Extra large size</Label>
          </Checkbox.Content>
        </Checkbox>
      </div>
    </div>
  );
}

```

### Variants

The Checkbox component supports two visual variants:

* **`primary`** (default) - Standard styling with default background, suitable for most use cases
* **`secondary`** - Lower emphasis variant, suitable for use in Surface components

```tsx
import {Checkbox, Description, Label} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Primary variant</p>
        <Checkbox id="primary" name="primary" variant="primary">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label htmlFor="primary">Primary checkbox</Label>
            <Description>Standard styling with default background</Description>
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Secondary variant</p>
        <Checkbox id="secondary" name="secondary" variant="secondary">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label htmlFor="secondary">Secondary checkbox</Label>
            <Description>Lower emphasis variant for use in surfaces</Description>
          </Checkbox.Content>
        </Checkbox>
      </div>
    </div>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {Checkbox, Label} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id="basic-terms" render={(props) => <label {...props} data-custom="bar" />}>
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox>
      <Label htmlFor="basic-terms">Accept terms and conditions</Label>
    </div>
  );
}

```

## Related Components

* **Label**: Accessible label for form controls
* **CheckboxGroup**: Group of checkboxes with shared state
* **Description**: Helper text for form fields

## Styling

### Passing Tailwind CSS classes

You can customize individual Checkbox components:

```tsx
import { Checkbox, Label } from '@heroui/react';

function CustomCheckbox() {
  return (
    <Checkbox name="custom">
      <Checkbox.Control className="border-2 border-purple-500 data-[selected=true]:bg-purple-500">
        <Checkbox.Indicator className="text-white" />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label>Custom Checkbox</Label>
      </Checkbox.Content>
    </Checkbox>
  );
}

```

### Customizing the component classes

To customize the Checkbox component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .checkbox {
    @apply inline-flex gap-3 items-center;
  }

  .checkbox__control {
    @apply size-5 border-2 border-gray-400 rounded data-[selected=true]:bg-blue-500 data-[selected=true]:border-blue-500;

    /* Animated background indicator */
    &::before {
      @apply bg-accent pointer-events-none absolute inset-0 z-0 origin-center scale-50 rounded-md opacity-0 content-[''];
      
      transition:
        scale 200ms linear,
        opacity 200ms linear,
        background-color 200ms ease-out;
    }

    /* Show indicator when selected */
    &[data-selected="true"]::before {
      @apply scale-100 opacity-100;
    }
  }

  .checkbox__indicator {
    @apply text-white;
  }

  .checkbox__content {
    @apply flex flex-col gap-1;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Checkbox component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/checkbox.css)):

* `.checkbox` - Base checkbox container
* `.checkbox__control` - Checkbox control box
* `.checkbox__indicator` - Checkbox checkmark indicator
* `.checkbox__content` - Optional content container

### Interactive States

The checkbox supports both CSS pseudo-classes and data attributes for flexibility:

* **Selected**: `[data-selected="true"]` or `[aria-checked="true"]` (shows checkmark and background color change)
* **Indeterminate**: `[data-indeterminate="true"]` (shows indeterminate state with dash)
* **Invalid**: `[data-invalid="true"]` or `[aria-invalid="true"]` (shows error state with danger colors)
* **Hover**: `:hover` or `[data-hovered="true"]`
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` (shows focus ring)
* **Disabled**: `:disabled` or `[aria-disabled="true"]` (reduced opacity, no pointer events)
* **Pressed**: `:active` or `[data-pressed="true"]`

## API Reference

### Checkbox Props

Inherits from [React Aria Checkbox](https://react-spectrum.adobe.com/react-aria/Checkbox.html).

| Prop              | Type                                                                        | Default     | Description                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isSelected`      | `boolean`                                                                   | `false`     | Whether the checkbox is checked                                                                                                                                    |
| `defaultSelected` | `boolean`                                                                   | `false`     | Whether the checkbox is checked by default (uncontrolled)                                                                                                          |
| `isIndeterminate` | `boolean`                                                                   | `false`     | Whether the checkbox is in an indeterminate state                                                                                                                  |
| `isDisabled`      | `boolean`                                                                   | `false`     | Whether the checkbox is disabled                                                                                                                                   |
| `isInvalid`       | `boolean`                                                                   | `false`     | Whether the checkbox is invalid                                                                                                                                    |
| `isReadOnly`      | `boolean`                                                                   | `false`     | Whether the checkbox is read only                                                                                                                                  |
| `variant`         | `"primary" \| "secondary"`                                                  | `"primary"` | Visual variant of the component. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |
| `name`            | `string`                                                                    | -           | The name of the input element, used when submitting an HTML form                                                                                                   |
| `value`           | `string`                                                                    | -           | The value of the input element, used when submitting an HTML form                                                                                                  |
| `onChange`        | `(isSelected: boolean) => void`                                             | -           | Handler called when the checkbox value changes                                                                                                                     |
| `children`        | `React.ReactNode \| (values: CheckboxRenderProps) => React.ReactNode`       | -           | Checkbox content or render prop                                                                                                                                    |
| `render`          | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, CheckboxRenderProps>` | -           | Overrides the default DOM element with a custom render function.                                                                                                   |

### CheckboxRenderProps

When using the render prop pattern, these values are provided:

| Prop              | Type      | Description                                       |
| ----------------- | --------- | ------------------------------------------------- |
| `isSelected`      | `boolean` | Whether the checkbox is currently checked         |
| `isIndeterminate` | `boolean` | Whether the checkbox is in an indeterminate state |
| `isHovered`       | `boolean` | Whether the checkbox is hovered                   |
| `isPressed`       | `boolean` | Whether the checkbox is currently pressed         |
| `isFocused`       | `boolean` | Whether the checkbox is focused                   |
| `isFocusVisible`  | `boolean` | Whether the checkbox is keyboard focused          |
| `isDisabled`      | `boolean` | Whether the checkbox is disabled                  |
| `isReadOnly`      | `boolean` | Whether the checkbox is read only                 |
