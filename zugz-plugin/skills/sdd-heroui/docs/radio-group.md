# RadioGroup

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/radio-group
> Radio group for selecting a single option from a list


## Import

```tsx
import { RadioGroup, Radio } from '@heroui/react';

```

### Usage

```tsx
import {Description, Label, Radio, RadioGroup} from "@heroui/react";

export function Basic() {
  return (
    <RadioGroup defaultValue="premium" name="plan">
      <Label>Plan selection</Label>
      <Description>Choose the plan that suits you best</Description>
      <Radio value="basic">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label>Basic Plan</Label>
          <Description>Includes 100 messages per month</Description>
        </Radio.Content>
      </Radio>
      <Radio value="premium">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label>Premium Plan</Label>
          <Description>Includes 200 messages per month</Description>
        </Radio.Content>
      </Radio>
      <Radio value="business">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label>Business Plan</Label>
          <Description>Unlimited messages</Description>
        </Radio.Content>
      </Radio>
    </RadioGroup>
  );
}

```

### Anatomy

Import the RadioGroup component and access all parts using dot notation.

```tsx
import {RadioGroup, Radio, Label, Description, FieldError} from '@heroui/react';

export default () => (
  <RadioGroup>
    <Label />
    <Description />
    <Radio value="option1">
      <Radio.Control>
        <Radio.Indicator>
          <span>✓</span> {/* Custom indicator (optional) */}
        </Radio.Indicator>
      </Radio.Control>
      <Radio.Content>
        <Label />
        <Description />
      </Radio.Content>
    </Radio>
    <FieldError />
  </RadioGroup>
)

```

### Custom Indicator

```tsx
"use client";

import {Description, Label, Radio, RadioGroup} from "@heroui/react";

export function CustomIndicator() {
  return (
    <RadioGroup defaultValue="premium" name="plan-custom-indicator">
      <Label>Plan selection</Label>
      <Description>Choose the plan that suits you best</Description>
      <Radio value="basic">
        <Radio.Control>
          <Radio.Indicator>
            {({isSelected}) =>
              isSelected ? <span className="text-xs leading-none text-background">✓</span> : null
            }
          </Radio.Indicator>
        </Radio.Control>
        <Radio.Content>
          <Label>Basic Plan</Label>
          <Description>Includes 100 messages per month</Description>
        </Radio.Content>
      </Radio>
      <Radio value="premium">
        <Radio.Control>
          <Radio.Indicator>
            {({isSelected}) =>
              isSelected ? <span className="text-xs leading-none text-background">✓</span> : null
            }
          </Radio.Indicator>
        </Radio.Control>
        <Radio.Content>
          <Label>Premium Plan</Label>
          <Description>Includes 200 messages per month</Description>
        </Radio.Content>
      </Radio>
      <Radio value="business">
        <Radio.Control>
          <Radio.Indicator>
            {({isSelected}) =>
              isSelected ? <span className="text-xs leading-none text-background">✓</span> : null
            }
          </Radio.Indicator>
        </Radio.Control>
        <Radio.Content>
          <Label>Business Plan</Label>
          <Description>Unlimited messages</Description>
        </Radio.Content>
      </Radio>
    </RadioGroup>
  );
}

```

### Horizontal Orientation

```tsx
import {Description, Label, Radio, RadioGroup} from "@heroui/react";

export function Horizontal() {
  return (
    <div className="flex flex-col gap-4">
      <Label>Subscription plan</Label>
      <RadioGroup defaultValue="pro" name="plan-orientation" orientation="horizontal">
        <Radio value="starter">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Starter</Label>
            <Description>For side projects</Description>
          </Radio.Content>
        </Radio>
        <Radio value="pro">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Pro</Label>
            <Description>Advanced reporting</Description>
          </Radio.Content>
        </Radio>
        <Radio value="teams">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Teams</Label>
            <Description>Up to 10 teammates</Description>
          </Radio.Content>
        </Radio>
      </RadioGroup>
    </div>
  );
}

```

### Controlled

```tsx
"use client";

import {Description, Label, Radio, RadioGroup} from "@heroui/react";
import React from "react";

export function Controlled() {
  const [value, setValue] = React.useState("pro");

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup name="plan-controlled" value={value} onChange={setValue}>
        <Label>Subscription plan</Label>
        <Radio value="starter">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Starter</Label>
            <Description>For side projects and small teams</Description>
          </Radio.Content>
        </Radio>
        <Radio value="pro">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Pro</Label>
            <Description>Advanced reporting and analytics</Description>
          </Radio.Content>
        </Radio>
        <Radio value="teams">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Teams</Label>
            <Description>Share access with up to 10 teammates</Description>
          </Radio.Content>
        </Radio>
      </RadioGroup>
      <p className="text-sm text-muted">
        Selected plan: <span className="font-medium">{value}</span>
      </p>
    </div>
  );
}

```

### Uncontrolled

Combine `defaultValue` with `onChange` when you only need to react to updates.

```tsx
"use client";

import {Description, Label, Radio, RadioGroup} from "@heroui/react";
import React from "react";

export function Uncontrolled() {
  const [selection, setSelection] = React.useState("pro");

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        defaultValue="pro"
        name="plan-uncontrolled"
        onChange={(nextValue) => setSelection(nextValue)}
      >
        <Label>Subscription plan</Label>
        <Radio value="starter">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Starter</Label>
            <Description>For side projects and small teams</Description>
          </Radio.Content>
        </Radio>
        <Radio value="pro">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Pro</Label>
            <Description>Advanced reporting and analytics</Description>
          </Radio.Content>
        </Radio>
        <Radio value="teams">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Teams</Label>
            <Description>Share access with up to 10 teammates</Description>
          </Radio.Content>
        </Radio>
      </RadioGroup>
      <p className="text-sm text-muted">
        Last chosen plan: <span className="font-medium">{selection}</span>
      </p>
    </div>
  );
}

```

### Validation

```tsx
"use client";

import {Button, Description, FieldError, Form, Label, Radio, RadioGroup} from "@heroui/react";
import React from "react";

export function Validation() {
  const [message, setMessage] = React.useState<string | null>(null);

  return (
    <Form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const value = formData.get("plan-validation");

        setMessage(`Your chosen plan is: ${value}`);
      }}
    >
      <RadioGroup isRequired name="plan-validation">
        <Label>Subscription plan</Label>
        <Radio value="starter">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Starter</Label>
            <Description>For side projects and small teams</Description>
          </Radio.Content>
        </Radio>
        <Radio value="pro">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Pro</Label>
            <Description>Advanced reporting and analytics</Description>
          </Radio.Content>
        </Radio>
        <Radio value="teams">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Teams</Label>
            <Description>Share access with up to 10 teammates</Description>
          </Radio.Content>
        </Radio>
        <FieldError>Choose a subscription before continuing.</FieldError>
      </RadioGroup>
      <Button className="mt-2 w-fit" type="submit">
        Submit
      </Button>
      {!!message && <p className="text-sm text-muted">{message}</p>}
    </Form>
  );
}

```

### Disabled

```tsx
import {Description, Label, Radio, RadioGroup} from "@heroui/react";

export function Disabled() {
  return (
    <RadioGroup isDisabled defaultValue="pro" name="plan-disabled">
      <Label>Subscription plan</Label>
      <Description>Plan changes are temporarily paused while we roll out updates.</Description>
      <Radio value="starter">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label>Starter</Label>
          <Description>For side projects and small teams</Description>
        </Radio.Content>
      </Radio>
      <Radio value="pro">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label>Pro</Label>
          <Description>Advanced reporting and analytics</Description>
        </Radio.Content>
      </Radio>
      <Radio value="teams">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label>Teams</Label>
          <Description>Share access with up to 10 teammates</Description>
        </Radio.Content>
      </Radio>
    </RadioGroup>
  );
}

```

### Variants

The RadioGroup component supports two visual variants:

* **`primary`** (default) - Standard styling with default background, suitable for most use cases
* **`secondary`** - Lower emphasis variant, suitable for use in Surface components

```tsx
import {Description, Label, Radio, RadioGroup} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Primary variant</p>
        <RadioGroup defaultValue="option1" name="primary-plan" variant="primary">
          <Radio value="option1">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Option 1</Label>
              <Description>Standard styling with default background</Description>
            </Radio.Content>
          </Radio>
          <Radio value="option2">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Option 2</Label>
              <Description>Another option with primary styling</Description>
            </Radio.Content>
          </Radio>
        </RadioGroup>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Secondary variant</p>
        <RadioGroup defaultValue="option1" name="secondary-plan" variant="secondary">
          <Radio value="option1">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Option 1</Label>
              <Description>Lower emphasis variant for use in surfaces</Description>
            </Radio.Content>
          </Radio>
          <Radio value="option2">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>Option 2</Label>
              <Description>Another option with secondary styling</Description>
            </Radio.Content>
          </Radio>
        </RadioGroup>
      </div>
    </div>
  );
}

```

### In Surface

When used inside a [Surface](/docs/components/surface) component, use `variant="secondary"` to apply the lower emphasis variant suitable for surface backgrounds.

```tsx
import {Description, Label, Radio, RadioGroup, Surface} from "@heroui/react";

export function OnSurface() {
  return (
    <Surface className="w-full rounded-3xl p-6">
      <RadioGroup defaultValue="premium" name="plan" variant="secondary">
        <Label>Plan selection</Label>
        <Description>Choose the plan that suits you best</Description>
        <Radio value="basic">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Basic Plan</Label>
            <Description>Includes 100 messages per month</Description>
          </Radio.Content>
        </Radio>
        <Radio value="premium">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Premium Plan</Label>
            <Description>Includes 200 messages per month</Description>
          </Radio.Content>
        </Radio>
        <Radio value="business">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>Business Plan</Label>
            <Description>Unlimited messages</Description>
          </Radio.Content>
        </Radio>
      </RadioGroup>
    </Surface>
  );
}

```

### Delivery & Payment





## Related Components

* **Fieldset**: Group related form controls with legends
* **Surface**: Base container surface
* **Description**: Helper text for form fields

### Custom Render Function

```tsx
"use client";

import {Description, Label, Radio, RadioGroup} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <RadioGroup
      defaultValue="premium"
      name="plan"
      render={(props) => <div {...props} data-custom="foo" />}
    >
      <Label>Plan selection</Label>
      <Description>Choose the plan that suits you best</Description>
      <Radio value="basic">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label>Basic Plan</Label>
          <Description>Includes 100 messages per month</Description>
        </Radio.Content>
      </Radio>
      <Radio value="premium">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label>Premium Plan</Label>
          <Description>Includes 200 messages per month</Description>
        </Radio.Content>
      </Radio>
      <Radio value="business">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label>Business Plan</Label>
          <Description>Unlimited messages</Description>
        </Radio.Content>
      </Radio>
    </RadioGroup>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import { RadioGroup, Radio } from '@heroui/react';

export default () => (
  <RadioGroup defaultValue="premium" name="plan">
    <Radio
      className="border-border group cursor-pointer rounded-xl border-2 p-4 hover:border-blue-300 data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-500/10"
      value="basic"
    >
      <Radio.Indicator className="border-border border-2 group-hover:border-blue-400 group-data-[selected=true]:border-blue-500 group-data-[selected=true]:bg-blue-500" />
      Basic Plan
    </Radio>
    <Radio
      className="border-border group cursor-pointer rounded-xl border-2 p-4 hover:border-purple-300 data-[selected=true]:border-purple-500 data-[selected=true]:bg-purple-500/10"
      value="premium"
    >
      <Radio.Indicator className="border-border border-2 group-hover:border-purple-400 group-data-[selected=true]:border-purple-500 group-data-[selected=true]:bg-purple-500" />
      Premium Plan
    </Radio>
    <Radio
      className="border-border group cursor-pointer rounded-xl border-2 p-4 hover:border-emerald-300 data-[selected=true]:border-emerald-500 data-[selected=true]:bg-emerald-500/10"
      value="business"
    >
      <Radio.Indicator className="border-border border-2 group-hover:border-emerald-400 group-data-[selected=true]:border-emerald-500 group-data-[selected=true]:bg-emerald-500" />
      Business Plan
    </Radio>
  </RadioGroup>
);

```

### Customizing the component classes

To customize the RadioGroup component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .radio-group {
    @apply gap-2;
  }

  .radio {
    @apply gap-4 rounded-lg border border-border p-3 hover:bg-surface-hovered;
  }

  .radio__control {
    @apply border-2 border-primary;
  }

  .radio__indicator {
    @apply bg-primary;
  }

  .radio__content {
    @apply gap-1;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The RadioGroup component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/radio-group.css)):

#### Base Classes

* `.radio-group` - Base radio group container
* `.radio` - Individual radio item
* `.radio__control` - Radio control (circular button)
* `.radio__indicator` - Radio indicator (inner dot)
* `.radio__content` - Radio content wrapper

#### Modifier Classes

* `.radio--disabled` - Disabled radio state

### Interactive States

The radio supports both CSS pseudo-classes and data attributes for flexibility:

* **Selected**: `[aria-checked="true"]` or `[data-selected="true"]` (indicator appears)
* **Hover**: `:hover` or `[data-hovered="true"]` (border color changes)
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` (shows focus ring)
* **Pressed**: `:active` or `[data-pressed="true"]` (scale transform)
* **Disabled**: `:disabled` or `[aria-disabled="true"]` (reduced opacity, no pointer events)
* **Invalid**: `[data-invalid="true"]` or `[aria-invalid="true"]` (error border color)

## API Reference

### RadioGroup Props

| Prop           | Type                                                                          | Default      | Description                                                                                                                                                        |
| -------------- | ----------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`        | `string`                                                                      | -            | The current value (controlled)                                                                                                                                     |
| `defaultValue` | `string`                                                                      | -            | The default value (uncontrolled)                                                                                                                                   |
| `onChange`     | `(value: string) => void`                                                     | -            | Handler called when the value changes                                                                                                                              |
| `isDisabled`   | `boolean`                                                                     | `false`      | Whether the radio group is disabled                                                                                                                                |
| `isRequired`   | `boolean`                                                                     | `false`      | Whether the radio group is required                                                                                                                                |
| `isReadOnly`   | `boolean`                                                                     | `false`      | Whether the radio group is read only                                                                                                                               |
| `isInvalid`    | `boolean`                                                                     | `false`      | Whether the radio group is in an invalid state                                                                                                                     |
| `variant`      | `"primary" \| "secondary"`                                                    | `"primary"`  | Visual variant of the component. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |
| `name`         | `string`                                                                      | -            | The name of the radio group, used when submitting an HTML form                                                                                                     |
| `orientation`  | `'horizontal' \| 'vertical'`                                                  | `'vertical'` | The orientation of the radio group                                                                                                                                 |
| `children`     | `React.ReactNode \| (values: RadioGroupRenderProps) => React.ReactNode`       | -            | Radio group content or render prop                                                                                                                                 |
| `render`       | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, RadioGroupRenderProps>` | -            | Overrides the default DOM element with a custom render function.                                                                                                   |

### Radio Props

| Prop         | Type                                                                     | Default | Description                                                      |
| ------------ | ------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------- |
| `value`      | `string`                                                                 | -       | The value of the radio button                                    |
| `isDisabled` | `boolean`                                                                | `false` | Whether the radio button is disabled                             |
| `name`       | `string`                                                                 | -       | The name of the radio button, used when submitting an HTML form  |
| `children`   | `React.ReactNode \| (values: RadioRenderProps) => React.ReactNode`       | -       | Radio content or render prop                                     |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, RadioRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### Radio.Control Props

Extends `React.HTMLAttributes<HTMLSpanElement>`.

| Prop       | Type              | Default | Description                                                                  |
| ---------- | ----------------- | ------- | ---------------------------------------------------------------------------- |
| `children` | `React.ReactNode` | -       | The content to render inside the control wrapper (typically Radio.Indicator) |

### Radio.Indicator Props

Extends `React.HTMLAttributes<HTMLSpanElement>`.

| Prop       | Type                                                               | Default | Description                                                            |
| ---------- | ------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------- |
| `children` | `React.ReactNode \| (values: RadioRenderProps) => React.ReactNode` | -       | Optional content or render prop that receives the current radio state. |

### Radio.Content Props

Extends `React.HTMLAttributes<HTMLDivElement>`.

| Prop       | Type              | Default | Description                                                                        |
| ---------- | ----------------- | ------- | ---------------------------------------------------------------------------------- |
| `children` | `React.ReactNode` | -       | The content to render inside the content wrapper (typically Label and Description) |

### RadioRenderProps

When using the render prop pattern, these values are provided:

| Prop             | Type      | Description                              |
| ---------------- | --------- | ---------------------------------------- |
| `isSelected`     | `boolean` | Whether the radio is currently selected  |
| `isHovered`      | `boolean` | Whether the radio is hovered             |
| `isPressed`      | `boolean` | Whether the radio is currently pressed   |
| `isFocused`      | `boolean` | Whether the radio is focused             |
| `isFocusVisible` | `boolean` | Whether the radio is keyboard focused    |
| `isDisabled`     | `boolean` | Whether the radio is disabled            |
| `isReadOnly`     | `boolean` | Whether the radio is read only           |
| `isInvalid`      | `boolean` | Whether the radio is in an invalid state |
