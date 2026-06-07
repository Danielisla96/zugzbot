# Switch

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/switch
> A toggle switch component for boolean states


## Import

```tsx
import { Switch, SwitchGroup, Label } from '@heroui/react';

```

### Usage

```tsx
import {Label, Switch} from "@heroui/react";

export function Basic() {
  return (
    <Switch>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        <Label className="text-sm">Enable notifications</Label>
      </Switch.Content>
    </Switch>
  );
}

```

### Anatomy

Import the Switch component and access all parts using dot notation.

```tsx
import { Switch, Label, Description } from '@heroui/react';

export default () => (
  <Switch>
    <Switch.Control>
      <Switch.Thumb>
        <Switch.Icon/> {/* Optional */}
      </Switch.Thumb>
    </Switch.Control>
    <Switch.Content>
      <Label />
      <Description /> {/* Optional */}
    </Switch.Content>
  </Switch>
);

```

For grouping multiple switches, use the `SwitchGroup` component:

```tsx
import { Switch, SwitchGroup, Label } from '@heroui/react';

export default () => (
  <SwitchGroup>
    <Switch>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Label>Option 1</Label>
    </Switch>
    <Switch>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Label>Option 2</Label>
    </Switch>
  </SwitchGroup>
);

```

### Disabled

```tsx
import {Label, Switch} from "@heroui/react";

export function Disabled() {
  return (
    <Switch isDisabled>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        <Label className="text-sm">Enable notifications</Label>
      </Switch.Content>
    </Switch>
  );
}

```

### Default Selected

```tsx
import {Label, Switch} from "@heroui/react";

export function DefaultSelected() {
  return (
    <Switch defaultSelected>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        <Label className="text-sm">Enable notifications</Label>
      </Switch.Content>
    </Switch>
  );
}

```

### Controlled

```tsx
"use client";

import {Label, Switch} from "@heroui/react";
import React from "react";

export function Controlled() {
  const [isSelected, setIsSelected] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Switch isSelected={isSelected} onChange={setIsSelected}>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Enable notifications</Label>
        </Switch.Content>
      </Switch>
      <p className="text-sm text-muted">Switch is {isSelected ? "on" : "off"}</p>
    </div>
  );
}

```

### Without Label

```tsx
import {Switch} from "@heroui/react";

export function WithoutLabel() {
  return (
    <Switch aria-label="Enable notifications">
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch>
  );
}

```

### Sizes

```tsx
import {Label, Switch} from "@heroui/react";

export function Sizes() {
  return (
    <div className="flex gap-6">
      <Switch size="sm">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-xs">Small</Label>
        </Switch.Content>
      </Switch>
      <Switch size="md">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Medium</Label>
        </Switch.Content>
      </Switch>
      <Switch size="lg">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-base">Large</Label>
        </Switch.Content>
      </Switch>
    </div>
  );
}

```

### Label Position

```tsx
import {Label, Switch} from "@heroui/react";

export function LabelPosition() {
  return (
    <div className="flex flex-col gap-4">
      <Switch>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Label after</Label>
        </Switch.Content>
      </Switch>
      <Switch>
        <Switch.Content>
          <Label className="text-sm">Label before</Label>
        </Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch>
    </div>
  );
}

```

### With Icons

```tsx
"use client";

import {
  BellFill,
  BellSlash,
  Check,
  Microphone,
  MicrophoneSlash,
  Moon,
  Power,
  Sun,
  VolumeFill,
  VolumeSlashFill,
} from "@gravity-ui/icons";
import {Switch} from "@heroui/react";

export function WithIcons() {
  const icons = {
    check: {
      off: Power,
      on: Check,
      selectedControlClass: "bg-green-500/80",
    },
    darkMode: {
      off: Moon,
      on: Sun,
      selectedControlClass: "",
    },
    microphone: {
      off: Microphone,
      on: MicrophoneSlash,
      selectedControlClass: "bg-red-500/80",
    },
    notification: {
      off: BellSlash,
      on: BellFill,
      selectedControlClass: "bg-purple-500/80",
    },
    volume: {
      off: VolumeFill,
      on: VolumeSlashFill,
      selectedControlClass: "bg-blue-500/80",
    },
  };

  return (
    <div className="flex gap-3">
      {Object.entries(icons).map(([key, value]) => (
        <Switch key={key} defaultSelected size="lg">
          {({isSelected}) => (
            <>
              <Switch.Control className={isSelected ? value.selectedControlClass : ""}>
                <Switch.Thumb>
                  <Switch.Icon>
                    {isSelected ? (
                      <value.on className="size-3 text-inherit opacity-100" />
                    ) : (
                      <value.off className="size-3 text-inherit opacity-70" />
                    )}
                  </Switch.Icon>
                </Switch.Thumb>
              </Switch.Control>
            </>
          )}
        </Switch>
      ))}
    </div>
  );
}

```

### With Description

```tsx
import {Description, Label, Switch} from "@heroui/react";

export function WithDescription() {
  return (
    <div className="max-w-sm">
      <Switch>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Public profile</Label>
          <Description>Allow others to see your profile information</Description>
        </Switch.Content>
      </Switch>
    </div>
  );
}

```

### Group

```tsx
import {Label, Switch, SwitchGroup} from "@heroui/react";

export function Group() {
  return (
    <SwitchGroup>
      <Switch name="notifications">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Allow Notifications</Label>
        </Switch.Content>
      </Switch>
      <Switch name="marketing">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Marketing emails</Label>
        </Switch.Content>
      </Switch>
      <Switch name="social">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Social media updates</Label>
        </Switch.Content>
      </Switch>
    </SwitchGroup>
  );
}

```

### Group Horizontal

```tsx
import {Label, Switch, SwitchGroup} from "@heroui/react";

export function GroupHorizontal() {
  return (
    <SwitchGroup className="overflow-x-auto" orientation="horizontal">
      <Switch name="notifications">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Notifications</Label>
        </Switch.Content>
      </Switch>
      <Switch name="marketing">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Marketing</Label>
        </Switch.Content>
      </Switch>
      <Switch name="social">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Content>
          <Label className="text-sm">Social</Label>
        </Switch.Content>
      </Switch>
    </SwitchGroup>
  );
}

```

### Render Props

```tsx
"use client";

import {Label, Switch} from "@heroui/react";

export function RenderProps() {
  return (
    <Switch>
      {({isSelected}) => (
        <>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label className="text-sm">{isSelected ? "Enabled" : "Disabled"}</Label>
          </Switch.Content>
        </>
      )}
    </Switch>
  );
}

```

### Form Integration

```tsx
"use client";

import {Button, Label, Switch, SwitchGroup} from "@heroui/react";
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
      <SwitchGroup>
        <Switch name="notifications" value="on">
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label className="text-sm">Enable notifications</Label>
          </Switch.Content>
        </Switch>
        <Switch defaultSelected name="newsletter" value="on">
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label className="text-sm">Subscribe to newsletter</Label>
          </Switch.Content>
        </Switch>
        <Switch name="marketing" value="on">
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label className="text-sm">Receive marketing updates</Label>
          </Switch.Content>
        </Switch>
      </SwitchGroup>
      <Button className="mt-4" size="sm" type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
}

```

### Custom Styles

```tsx
"use client";

import {Check, Power} from "@gravity-ui/icons";
import {Switch} from "@heroui/react";

export function CustomStyles() {
  return (
    <Switch>
      {({isSelected}) => (
        <>
          <Switch.Control
            className={`h-[31px] w-[51px] bg-blue-500 ${isSelected ? "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]" : ""}`}
          >
            <Switch.Thumb
              className={`size-[27px] bg-white shadow-sm ${isSelected ? "ms-[22px] shadow-lg" : ""}`}
            >
              <Switch.Icon>
                {isSelected ? (
                  <Check className="size-4 text-cyan-600" />
                ) : (
                  <Power className="size-4 text-blue-600" />
                )}
              </Switch.Icon>
            </Switch.Thumb>
          </Switch.Control>
        </>
      )}
    </Switch>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {Label, Switch} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <Switch render={(props) => <label {...props} data-custom="foo" />}>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Label className="text-sm">Enable notifications</Label>
    </Switch>
  );
}

```

## Related Components

* **Label**: Accessible label for form controls
* **Description**: Helper text for form fields
* **Button**: Allows a user to perform an action

## Styling

### Passing Tailwind CSS classes

You can customize individual Switch components:

```tsx
import { Switch, Label } from '@heroui/react';

function CustomSwitch() {
  return (
    <Switch>
      {({isSelected}) => (
        <>
          <Switch.Control
            className={`h-[31px] w-[51px] bg-blue-500 ${isSelected ? "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]" : ""}`}
          >
            <Switch.Thumb
              className={`size-[27px] bg-white shadow-sm ${isSelected ? "translate-x-5 shadow-lg" : ""}`}
            />
          </Switch.Control>
          <Label>Custom Switch</Label>
        </>
      )}
    </Switch>
  );
}

```

Or customize the SwitchGroup layout:

```tsx
import { Switch, SwitchGroup, Label } from '@heroui/react';

function CustomSwitchGroup() {
  return (
    <SwitchGroup className="gap-8" orientation="horizontal">
      <Switch>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Label>Option 1</Label>
      </Switch>
      <Switch>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Label>Option 2</Label>
      </Switch>
    </SwitchGroup>
  );
}

```

### Customizing the component classes

To customize the Switch component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .switch {
    @apply inline-flex gap-3 items-center;
  }

  .switch__control {
    @apply h-5 w-8 bg-gray-400 data-[selected=true]:bg-blue-500;
  }

  .switch__thumb {
    @apply bg-white shadow-sm;
  }

  .switch__content {
    @apply flex flex-col gap-1;
  }

  .switch__icon {
    @apply h-3 w-3 text-current;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

#### Switch Classes

The Switch component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/switch.css)):

* `.switch` - Base switch container
* `.switch__content` - Optional content container
* `.switch__control` - Switch control track
* `.switch__thumb` - Switch thumb that moves
* `.switch__icon` - Optional icon inside the thumb
* `.switch--sm` - Small size variant
* `.switch--md` - Medium size variant (default)
* `.switch--lg` - Large size variant

#### SwitchGroup Classes

The SwitchGroup component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/switch-group.css)):

* `.switch-group` - Switch group container
* `.switch-group__items` - Container for switch items
* `.switch-group--horizontal` - Horizontal layout
* `.switch-group--vertical` - Vertical layout (default)

### Interactive States

The switch supports both CSS pseudo-classes and data attributes for flexibility:

* **Selected**: `[data-selected="true"]` (thumb position and background color change)
* **Hover**: `:hover` or `[data-hovered="true"]`
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` (shows focus ring)
* **Disabled**: `:disabled` or `[aria-disabled="true"]` (reduced opacity, no pointer events)
* **Pressed**: `:active` or `[data-pressed="true"]`

## API Reference

### Switch Props

Inherits from [React Aria Switch](https://react-spectrum.adobe.com/react-aria/Switch.html).

| Prop              | Type                                                                      | Default | Description                                                       |
| ----------------- | ------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| `size`            | `'sm' \| 'md' \| 'lg'`                                                    | `'md'`  | The size of the switch                                            |
| `isSelected`      | `boolean`                                                                 | `false` | Whether the switch is on                                          |
| `defaultSelected` | `boolean`                                                                 | `false` | Whether the switch is on by default (uncontrolled)                |
| `isDisabled`      | `boolean`                                                                 | `false` | Whether the switch is disabled                                    |
| `name`            | `string`                                                                  | -       | The name of the input element, used when submitting an HTML form  |
| `value`           | `string`                                                                  | -       | The value of the input element, used when submitting an HTML form |
| `onChange`        | `(isSelected: boolean) => void`                                           | -       | Handler called when the switch value changes                      |
| `onPress`         | `(e: PressEvent) => void`                                                 | -       | Handler called when the switch is pressed                         |
| `children`        | `React.ReactNode \| (values: SwitchRenderProps) => React.ReactNode`       | -       | Switch content or render prop                                     |
| `render`          | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, SwitchRenderProps>` | -       | Overrides the default DOM element with a custom render function.  |

### SwitchRenderProps

When using the render prop pattern, these values are provided:

| Prop             | Type      | Description                             |
| ---------------- | --------- | --------------------------------------- |
| `isSelected`     | `boolean` | Whether the switch is currently on      |
| `isHovered`      | `boolean` | Whether the switch is hovered           |
| `isPressed`      | `boolean` | Whether the switch is currently pressed |
| `isFocused`      | `boolean` | Whether the switch is focused           |
| `isFocusVisible` | `boolean` | Whether the switch is keyboard focused  |
| `isDisabled`     | `boolean` | Whether the switch is disabled          |
| `isReadOnly`     | `boolean` | Whether the switch is read only         |
| `state`          | `-`       | State of the switch.                    |

### SwitchGroup Props

| Prop          | Type                         | Default      | Description                         |
| ------------- | ---------------------------- | ------------ | ----------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | The orientation of the switch group |
| `children`    | `React.ReactNode`            | -            | The switch items to render          |
| `className`   | `string`                     | -            | Additional CSS class names          |
