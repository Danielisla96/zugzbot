# CheckboxGroup

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/checkbox-group
> A checkbox group component for managing multiple checkbox selections


## Import

```tsx
import { CheckboxGroup, Checkbox, Label, Description } from '@heroui/react';

```

### Usage

```tsx
import {Checkbox, CheckboxGroup, Description, Label} from "@heroui/react";

export function Basic() {
  return (
    <CheckboxGroup name="interests">
      <Label>Select your interests</Label>
      <Description>Choose all that apply</Description>
      <Checkbox value="coding">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Coding</Label>
          <Description>Love building software</Description>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox value="design">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Design</Label>
          <Description>Enjoy creating beautiful interfaces</Description>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox value="writing">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Writing</Label>
          <Description>Passionate about content creation</Description>
        </Checkbox.Content>
      </Checkbox>
    </CheckboxGroup>
  );
}

```

### Anatomy

Import the CheckboxGroup component and access all parts using dot notation.

```tsx
import {CheckboxGroup, Checkbox, Label, Description, FieldError} from '@heroui/react';

export default () => (
  <CheckboxGroup name="interests">
    <Label />
    <Description /> {/* Optional */}
    <Checkbox value="option1">
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Content>
        <Label />
        <Description /> {/* Optional */}
      </Checkbox.Content>
    </Checkbox>
    <FieldError /> {/* Optional */}
  </CheckboxGroup>
);

```

### In Surface

When used inside a [Surface](/docs/components/surface) component, use `variant="secondary"` to apply the lower emphasis variant suitable for surface backgrounds.

```tsx
import {Checkbox, CheckboxGroup, Description, Label, Surface} from "@heroui/react";

export function OnSurface() {
  return (
    <Surface className="w-full rounded-3xl p-6">
      <CheckboxGroup name="interests" variant="secondary">
        <Label>Select your interests</Label>
        <Description>Choose all that apply</Description>
        <Checkbox value="coding">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Coding</Label>
            <Description>Love building software</Description>
          </Checkbox.Content>
        </Checkbox>
        <Checkbox value="design">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Design</Label>
            <Description>Enjoy creating beautiful interfaces</Description>
          </Checkbox.Content>
        </Checkbox>
        <Checkbox value="writing">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Writing</Label>
            <Description>Passionate about content creation</Description>
          </Checkbox.Content>
        </Checkbox>
      </CheckboxGroup>
    </Surface>
  );
}

```

### With Custom Indicator

```tsx
"use client";

import {Checkbox, CheckboxGroup, Description, Label} from "@heroui/react";

export function WithCustomIndicator() {
  return (
    <CheckboxGroup name="features">
      <Label>Features</Label>
      <Description>Select the features you want</Description>
      <Checkbox value="notifications">
        <Checkbox.Control>
          <Checkbox.Indicator>
            {({isSelected}) =>
              isSelected ? (
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : null
            }
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Email notifications</Label>
          <Description>Receive updates via email</Description>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox value="newsletter">
        <Checkbox.Control>
          <Checkbox.Indicator>
            {({isSelected}) =>
              isSelected ? (
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : null
            }
          </Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Newsletter</Label>
          <Description>Get weekly newsletters</Description>
        </Checkbox.Content>
      </Checkbox>
    </CheckboxGroup>
  );
}

```

### Indeterminate

```tsx
"use client";

import {Checkbox, CheckboxGroup, Label} from "@heroui/react";
import {useState} from "react";

export function Indeterminate() {
  const [selected, setSelected] = useState(["coding"]);
  const allOptions = ["coding", "design", "writing"];

  return (
    <div>
      <Checkbox
        isIndeterminate={selected.length > 0 && selected.length < allOptions.length}
        isSelected={selected.length === allOptions.length}
        name="select-all"
        onChange={(isSelected: boolean) => {
          setSelected(isSelected ? allOptions : []);
        }}
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Select all</Label>
        </Checkbox.Content>
      </Checkbox>
      <div className="ml-6 flex flex-col gap-2">
        <CheckboxGroup value={selected} onChange={setSelected}>
          <Checkbox value="coding">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <Label>Coding</Label>
            </Checkbox.Content>
          </Checkbox>
          <Checkbox value="design">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <Label>Design</Label>
            </Checkbox.Content>
          </Checkbox>
          <Checkbox value="writing">
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Content>
              <Label>Writing</Label>
            </Checkbox.Content>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  );
}

```

### Controlled

```tsx
"use client";

import {Checkbox, CheckboxGroup, Label} from "@heroui/react";
import {useState} from "react";

export function Controlled() {
  const [selected, setSelected] = useState(["coding", "design"]);

  return (
    <CheckboxGroup className="min-w-[320px]" name="skills" value={selected} onChange={setSelected}>
      <Label>Your skills</Label>
      <Checkbox value="coding">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Coding</Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox value="design">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Design</Label>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox value="writing">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Writing</Label>
        </Checkbox.Content>
      </Checkbox>
      <Label className="my-4 text-sm text-muted">Selected: {selected.join(", ") || "None"}</Label>
    </CheckboxGroup>
  );
}

```

### Validation

```tsx
"use client";

import {Button, Checkbox, CheckboxGroup, FieldError, Form, Label} from "@heroui/react";

export function Validation() {
  return (
    <Form
      className="flex flex-col gap-4 px-4"
      onSubmit={(e) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const values = formData.getAll("preferences");

        alert(`Selected preferences: ${values.join(", ")}`);
      }}
    >
      <CheckboxGroup isRequired name="preferences">
        <Label>Preferences</Label>
        <Checkbox value="email">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Email notifications</Label>
          </Checkbox.Content>
        </Checkbox>
        <Checkbox value="sms">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>SMS notifications</Label>
          </Checkbox.Content>
        </Checkbox>
        <Checkbox value="push">
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>Push notifications</Label>
          </Checkbox.Content>
        </Checkbox>
        <FieldError>Please select at least one notification method.</FieldError>
      </CheckboxGroup>
      <Button type="submit">Submit</Button>
    </Form>
  );
}

```

### Disabled

```tsx
import {Checkbox, CheckboxGroup, Description, Label} from "@heroui/react";

export function Disabled() {
  return (
    <CheckboxGroup isDisabled name="disabled-features">
      <Label>Features</Label>
      <Description>Feature selection is temporarily disabled</Description>
      <Checkbox value="feature1">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Feature 1</Label>
          <Description>This feature is coming soon</Description>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox value="feature2">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Feature 2</Label>
          <Description>This feature is coming soon</Description>
        </Checkbox.Content>
      </Checkbox>
    </CheckboxGroup>
  );
}

```

### Features and Add-ons Example

```tsx
import {Bell, Comment, Envelope} from "@gravity-ui/icons";
import {Checkbox, CheckboxGroup, Description, Label} from "@heroui/react";
import clsx from "clsx";

export function FeaturesAndAddOns() {
  const addOns = [
    {
      description: "Receive updates via email",
      icon: Envelope,
      title: "Email Notifications",
      value: "email",
    },
    {
      description: "Get instant SMS notifications",
      icon: Comment,
      title: "SMS Alerts",
      value: "sms",
    },
    {
      description: "Browser and mobile push alerts",
      icon: Bell,
      title: "Push Notifications",
      value: "push",
    },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-10 px-4 py-8">
      <section className="flex w-full min-w-[320px] flex-col gap-4">
        <CheckboxGroup name="notification-preferences">
          <Label>Notification preferences</Label>
          <Description>Choose how you want to receive updates</Description>
          <div className="flex flex-col gap-2">
            {addOns.map((addon) => (
              <Checkbox
                key={addon.value}
                value={addon.value}
                variant="secondary"
                className={clsx(
                  "group relative flex-col gap-4 rounded-3xl bg-surface px-5 py-4 transition-all",
                  "data-[selected=true]:bg-accent/10",
                )}
              >
                <Checkbox.Control className="absolute top-3 right-4 size-5 rounded-full before:rounded-full">
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content className="flex flex-row items-start justify-start gap-4">
                  <addon.icon className="size-5 text-accent-soft-foreground" />
                  <div className="flex flex-col gap-1">
                    <Label>{addon.title}</Label>
                    <Description>{addon.description}</Description>
                  </div>
                </Checkbox.Content>
              </Checkbox>
            ))}
          </div>
        </CheckboxGroup>
      </section>
    </div>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {Checkbox, CheckboxGroup, Description, Label} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <CheckboxGroup name="interests" render={(props) => <div {...props} data-custom="foo" />}>
      <Label>Select your interests</Label>
      <Description>Choose all that apply</Description>
      <Checkbox value="coding">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Coding</Label>
          <Description>Love building software</Description>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox value="design">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Design</Label>
          <Description>Enjoy creating beautiful interfaces</Description>
        </Checkbox.Content>
      </Checkbox>
      <Checkbox value="writing">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Writing</Label>
          <Description>Passionate about content creation</Description>
        </Checkbox.Content>
      </Checkbox>
    </CheckboxGroup>
  );
}

```

## Related Components

* **Checkbox**: Binary choice input control
* **Label**: Accessible label for form controls
* **Fieldset**: Group related form controls with legends

## Styling

### Passing Tailwind CSS classes

You can customize the CheckboxGroup component:

```tsx
import { CheckboxGroup, Checkbox, Label } from '@heroui/react';

function CustomCheckboxGroup() {
  return (
    <CheckboxGroup className="gap-4" name="custom">
      <Checkbox value="option1">
        <Checkbox.Control className="border-2 border-purple-500 data-[selected=true]:bg-purple-500">
          <Checkbox.Indicator className="text-white" />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label>Option 1</Label>
        </Checkbox.Content>
      </Checkbox>
    </CheckboxGroup>
  );
}

```

### Customizing the component classes

To customize the CheckboxGroup component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .checkbox-group {
    @apply flex flex-col gap-2;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The CheckboxGroup component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/checkbox-group.css)):

* `.checkbox-group` - Base checkbox group container

## API Reference

### CheckboxGroup Props

Inherits from [React Aria CheckboxGroup](https://react-spectrum.adobe.com/react-aria/CheckboxGroup.html).

| Prop           | Type                                                                             | Default | Description                                                       |
| -------------- | -------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| `value`        | `string[]`                                                                       | -       | The current selected values (controlled)                          |
| `defaultValue` | `string[]`                                                                       | -       | The default selected values (uncontrolled)                        |
| `onChange`     | `(value: string[]) => void`                                                      | -       | Handler called when the selected values change                    |
| `isDisabled`   | `boolean`                                                                        | `false` | Whether the checkbox group is disabled                            |
| `isRequired`   | `boolean`                                                                        | `false` | Whether the checkbox group is required                            |
| `isReadOnly`   | `boolean`                                                                        | `false` | Whether the checkbox group is read only                           |
| `isInvalid`    | `boolean`                                                                        | `false` | Whether the checkbox group is in an invalid state                 |
| `name`         | `string`                                                                         | -       | The name of the checkbox group, used when submitting an HTML form |
| `children`     | `React.ReactNode \| (values: CheckboxGroupRenderProps) => React.ReactNode`       | -       | Checkbox group content or render prop                             |
| `render`       | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, CheckboxGroupRenderProps>` | -       | Overrides the default DOM element with a custom render function.  |

### CheckboxGroupRenderProps

When using the render prop pattern, these values are provided:

| Prop         | Type       | Description                                       |
| ------------ | ---------- | ------------------------------------------------- |
| `value`      | `string[]` | The currently selected values                     |
| `isDisabled` | `boolean`  | Whether the checkbox group is disabled            |
| `isReadOnly` | `boolean`  | Whether the checkbox group is read only           |
| `isInvalid`  | `boolean`  | Whether the checkbox group is in an invalid state |
| `isRequired` | `boolean`  | Whether the checkbox group is required            |
