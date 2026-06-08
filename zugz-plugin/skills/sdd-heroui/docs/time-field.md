# TimeField

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/time-field
> Time input field with labels, descriptions, and validation built on React Aria TimeField


## Import

```tsx
import { TimeField } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {Label, TimeField} from "@heroui/react";

export function Basic() {
  return (
    <TimeField className="w-[256px]" name="time">
      <Label>Time</Label>
      <TimeField.Group>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}

```

### Anatomy

```tsx
import {TimeField, Label, Description, FieldError} from '@heroui/react';

export default () => (
  <TimeField>
    <Label />
    <TimeField.Group>
      <TimeField.Input>
        {(segment) => <TimeField.Segment segment={segment} />}
      </TimeField.Input>
    </TimeField.Group>
    <Description />
    <FieldError />
  </TimeField>
)

```

> **TimeField** combines label, time input, description, and error into a single accessible component.

### With Description

```tsx
"use client";

import {Description, Label, TimeField} from "@heroui/react";

export function WithDescription() {
  return (
    <div className="flex flex-col gap-4">
      <TimeField className="w-[256px]" name="time">
        <Label>Start time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <Description>Enter the start time</Description>
      </TimeField>
      <TimeField className="w-[256px]" name="end-time">
        <Label>End time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <Description>Enter the end time</Description>
      </TimeField>
    </div>
  );
}

```

### Required Field

```tsx
"use client";

import {Description, Label, TimeField} from "@heroui/react";

export function Required() {
  return (
    <div className="flex flex-col gap-4">
      <TimeField isRequired className="w-[256px]" name="time">
        <Label>Time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
      <TimeField isRequired className="w-[256px]" name="appointment-time">
        <Label>Appointment time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <Description>Required field</Description>
      </TimeField>
    </div>
  );
}

```

### Validation

Use `isInvalid` together with `FieldError` to surface validation messages.

```tsx
"use client";

import {FieldError, Label, TimeField} from "@heroui/react";

export function Invalid() {
  return (
    <div className="flex flex-col gap-4">
      <TimeField isInvalid isRequired className="w-[256px]" name="time">
        <Label>Time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <FieldError>Please enter a valid time</FieldError>
      </TimeField>
      <TimeField isInvalid className="w-[256px]" name="invalid-time">
        <Label>Time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <FieldError>Time must be within business hours</FieldError>
      </TimeField>
    </div>
  );
}

```

### With Validation

TimeField supports validation with `minValue`, `maxValue`, and custom validation logic.

```tsx
"use client";

import type {Time} from "@internationalized/date";

import {Description, FieldError, Label, TimeField} from "@heroui/react";
import {parseTime} from "@internationalized/date";
import {useState} from "react";

export function WithValidation() {
  const [value, setValue] = useState<Time | null>(null);
  const minTime = parseTime("09:00");
  const maxTime = parseTime("17:00");
  const isInvalid = value !== null && (value.compare(minTime) < 0 || value.compare(maxTime) > 0);

  return (
    <div className="flex flex-col gap-4">
      <TimeField
        isRequired
        className="w-[256px]"
        isInvalid={isInvalid}
        maxValue={maxTime}
        minValue={minTime}
        name="time"
        value={value}
        onChange={setValue}
      >
        <Label>Time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        {isInvalid ? (
          <FieldError>Time must be between 9:00 AM and 5:00 PM</FieldError>
        ) : (
          <Description>Enter a time between 9:00 AM and 5:00 PM</Description>
        )}
      </TimeField>
    </div>
  );
}

```

### Controlled

Control the value to synchronize with other components or state management.

```tsx
"use client";

import type {TimeValue} from "@heroui/react";

import {Button, Description, Label, TimeField} from "@heroui/react";
import {Time, getLocalTimeZone, now} from "@internationalized/date";
import {useState} from "react";

export function Controlled() {
  const [value, setValue] = useState<TimeValue | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <TimeField className="w-[256px]" name="time" value={value} onChange={setValue}>
        <Label>Time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <Description>Current value: {value ? value.toString() : "(empty)"}</Description>
      </TimeField>
      <div className="flex gap-2">
        <Button
          variant="tertiary"
          onPress={() => {
            const currentTime = now(getLocalTimeZone());

            setValue(new Time(currentTime.hour, currentTime.minute, currentTime.second));
          }}
        >
          Set now
        </Button>
        <Button variant="tertiary" onPress={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}

```

### Disabled State

```tsx
"use client";

import {Description, Label, TimeField} from "@heroui/react";
import {Time, getLocalTimeZone, now} from "@internationalized/date";

export function Disabled() {
  const currentTime = now(getLocalTimeZone());
  const timeValue = new Time(currentTime.hour, currentTime.minute, currentTime.second);

  return (
    <div className="flex flex-col gap-4">
      <TimeField isDisabled className="w-[256px]" name="time" value={timeValue}>
        <Label>Time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <Description>This time field is disabled</Description>
      </TimeField>
      <TimeField isDisabled className="w-[256px]" name="time-empty">
        <Label>Time</Label>
        <TimeField.Group>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <Description>This time field is disabled</Description>
      </TimeField>
    </div>
  );
}

```

### With Icons

Add prefix or suffix icons to enhance the time field.

```tsx
"use client";

import {Clock} from "@gravity-ui/icons";
import {Label, TimeField} from "@heroui/react";

export function WithPrefixIcon() {
  return (
    <TimeField className="w-[256px]" name="time">
      <Label>Time</Label>
      <TimeField.Group>
        <TimeField.Prefix>
          <Clock className="size-4 text-muted" />
        </TimeField.Prefix>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}

```

```tsx
"use client";

import {Clock} from "@gravity-ui/icons";
import {Label, TimeField} from "@heroui/react";

export function WithSuffixIcon() {
  return (
    <TimeField className="w-[256px]" name="time">
      <Label>Time</Label>
      <TimeField.Group>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        <TimeField.Suffix>
          <Clock className="size-4 text-muted" />
        </TimeField.Suffix>
      </TimeField.Group>
    </TimeField>
  );
}

```

```tsx
"use client";

import {ChevronDown, Clock} from "@gravity-ui/icons";
import {Description, Label, TimeField} from "@heroui/react";

export function WithPrefixAndSuffix() {
  return (
    <TimeField className="w-[256px]" name="time">
      <Label>Time</Label>
      <TimeField.Group>
        <TimeField.Prefix>
          <Clock className="size-4 text-muted" />
        </TimeField.Prefix>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        <TimeField.Suffix>
          <ChevronDown className="size-4 text-muted" />
        </TimeField.Suffix>
      </TimeField.Group>
      <Description>Enter a time</Description>
    </TimeField>
  );
}

```

### Full Width

```tsx
"use client";

import {ChevronDown, Clock} from "@gravity-ui/icons";
import {Label, TimeField} from "@heroui/react";

export function FullWidth() {
  return (
    <div className="w-[400px] space-y-4">
      <TimeField fullWidth name="time">
        <Label>Time</Label>
        <TimeField.Group fullWidth>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
      </TimeField>
      <TimeField fullWidth name="time-icons">
        <Label>Time</Label>
        <TimeField.Group fullWidth>
          <TimeField.Prefix>
            <Clock className="size-4 text-muted" />
          </TimeField.Prefix>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
          <TimeField.Suffix>
            <ChevronDown className="size-4 text-muted" />
          </TimeField.Suffix>
        </TimeField.Group>
      </TimeField>
    </div>
  );
}

```

### On Surface

When used inside a [Surface](/docs/components/surface) component, use `variant="secondary"` on TimeField.Group to apply the lower emphasis variant suitable for surface backgrounds.

```tsx
"use client";

import {Clock} from "@gravity-ui/icons";
import {Description, Label, Surface, TimeField} from "@heroui/react";

export function OnSurface() {
  return (
    <Surface className="flex w-full max-w-sm flex-col gap-4 rounded-3xl p-6">
      <TimeField className="w-full" name="time">
        <Label>Time</Label>
        <TimeField.Group variant="secondary">
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <Description>Enter a time</Description>
      </TimeField>
      <TimeField className="w-full" name="time-2">
        <Label>Appointment time</Label>
        <TimeField.Group variant="secondary">
          <TimeField.Prefix>
            <Clock className="size-4 text-muted" />
          </TimeField.Prefix>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        <Description>Enter a time for your appointment</Description>
      </TimeField>
    </Surface>
  );
}

```

### Form Example

Complete form example with validation and submission handling.

```tsx
"use client";

import type {Time} from "@internationalized/date";

import {Clock} from "@gravity-ui/icons";
import {Button, Description, FieldError, Form, Label, TimeField} from "@heroui/react";
import {parseTime} from "@internationalized/date";
import {useState} from "react";

export function FormExample() {
  const [value, setValue] = useState<Time | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minTime = parseTime("09:00");
  const maxTime = parseTime("17:00");
  const isInvalid = value !== null && (value.compare(minTime) < 0 || value.compare(maxTime) > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value || isInvalid) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Time submitted:", {time: value});
      setValue(null);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Form className="flex w-[280px] flex-col gap-4" onSubmit={handleSubmit}>
      <TimeField
        isRequired
        className="w-full"
        isInvalid={isInvalid}
        maxValue={maxTime}
        minValue={minTime}
        name="time"
        value={value}
        onChange={setValue}
      >
        <Label>Appointment time</Label>
        <TimeField.Group>
          <TimeField.Prefix>
            <Clock className="size-4 text-muted" />
          </TimeField.Prefix>
          <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
        </TimeField.Group>
        {isInvalid ? (
          <FieldError>Time must be between 9:00 AM and 5:00 PM</FieldError>
        ) : (
          <Description>Enter a time between 9:00 AM and 5:00 PM</Description>
        )}
      </TimeField>
      <Button
        className="w-full"
        isDisabled={!value || isInvalid}
        isPending={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </Form>
  );
}

```

## Related Components

* **Label**: Accessible label for form controls
* **FieldError**: Inline validation messages for form fields
* **Description**: Helper text for form fields

### Custom Render Function

```tsx
"use client";

import {Label, TimeField} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <TimeField
      className="w-[256px]"
      name="time"
      render={(props) => <div {...props} data-custom="foo" />}
    >
      <Label>Time</Label>
      <TimeField.Group>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import {TimeField, Label, Description} from '@heroui/react';

function CustomTimeField() {
  return (
    <TimeField className="gap-2 rounded-xl border border-border/60 bg-surface p-4 shadow-sm">
      <Label className="text-sm font-semibold text-default-700">
        Appointment time
      </Label>
      <TimeField.Group className="rounded-lg border border-border/60 bg-surface px-3 py-2">
        <TimeField.Input>
          {(segment) => <TimeField.Segment segment={segment} />}
        </TimeField.Input>
      </TimeField.Group>
      <Description className="text-xs text-default-500">
        Select a time for your appointment.
      </Description>
    </TimeField>
  );
}

```

### Customizing the component classes

TimeField has minimal default styling. Override the `.time-field` class to customize the container styling.

```css
@layer components {
  .time-field {
    @apply flex flex-col gap-1;

    &[data-invalid="true"],
    &[aria-invalid="true"] {
      [data-slot="description"] {
        @apply hidden;
      }
    }

    [data-slot="label"] {
      @apply w-fit;
    }

    [data-slot="description"] {
      @apply px-1;
    }
  }
}

```

### CSS Classes

* `.time-field` – Root container with minimal styling (`flex flex-col gap-1`)

> **Note:** Child components ([Label](/docs/components/label), [Description](/docs/components/description), [FieldError](/docs/components/field-error)) have their own CSS classes and styling. See their respective documentation for customization options. TimeField.Group styling is documented below in the API Reference section.

### Interactive States

TimeField automatically manages these data attributes based on its state:

* **Invalid**: `[data-invalid="true"]` or `[aria-invalid="true"]` - Automatically hides the description slot when invalid
* **Required**: `[data-required="true"]` - Applied when `isRequired` is true
* **Disabled**: `[data-disabled="true"]` - Applied when `isDisabled` is true
* **Focus Within**: `[data-focus-within="true"]` - Applied when any child input is focused

## API Reference

### TimeField Props

TimeField inherits all props from React Aria's [TimeField](https://react-aria.adobe.com/TimeField) component.

#### Base Props

| Prop        | Type                                                                           | Default | Description                                                         |
| ----------- | ------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------- |
| `children`  | `React.ReactNode \| (values: TimeFieldRenderProps) => React.ReactNode`         | -       | Child components (Label, TimeField.Group, etc.) or render function. |
| `className` | `string \| (values: TimeFieldRenderProps) => string`                           | -       | CSS classes for styling, supports render props.                     |
| `style`     | `React.CSSProperties \| (values: TimeFieldRenderProps) => React.CSSProperties` | -       | Inline styles, supports render props.                               |
| `fullWidth` | `boolean`                                                                      | `false` | Whether the time field should take full width of its container      |
| `id`        | `string`                                                                       | -       | The element's unique identifier.                                    |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, TimeFieldRenderProps>`   | -       | Overrides the default DOM element with a custom render function.    |

#### Value Props

| Prop               | Type                                 | Default | Description                                                                                                                 |
| ------------------ | ------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `value`            | `TimeValue \| null`                  | -       | Current value (controlled). Uses [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) types.   |
| `defaultValue`     | `TimeValue \| null`                  | -       | Default value (uncontrolled). Uses [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) types. |
| `onChange`         | `(value: TimeValue \| null) => void` | -       | Handler called when the value changes.                                                                                      |
| `placeholderValue` | `TimeValue \| null`                  | -       | Placeholder time that influences the format of the placeholder. Defaults to 12:00 AM or 00:00 depending on the hour cycle.  |

#### Validation Props

| Prop                 | Type                                                                 | Default    | Description                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `isRequired`         | `boolean`                                                            | `false`    | Whether user input is required before form submission.                                                                                         |
| `isInvalid`          | `boolean`                                                            | -          | Whether the value is invalid.                                                                                                                  |
| `minValue`           | `TimeValue \| null`                                                  | -          | The minimum allowed time that a user may select. Uses [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) types. |
| `maxValue`           | `TimeValue \| null`                                                  | -          | The maximum allowed time that a user may select. Uses [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) types. |
| `validate`           | `(value: TimeValue) => ValidationError \| true \| null \| undefined` | -          | Custom validation function.                                                                                                                    |
| `validationBehavior` | `'native' \| 'aria'`                                                 | `'native'` | Whether to use native HTML form validation or ARIA attributes.                                                                                 |

#### Format Props

| Prop                      | Type                             | Default    | Description                                                                               |
| ------------------------- | -------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| `granularity`             | `'hour' \| 'minute' \| 'second'` | `'minute'` | Determines the smallest unit displayed in the time picker.                                |
| `hourCycle`               | `12 \| 24`                       | -          | Whether to display time in 12 or 24 hour format. By default, determined by locale.        |
| `hideTimeZone`            | `boolean`                        | `false`    | Whether to hide the time zone abbreviation.                                               |
| `shouldForceLeadingZeros` | `boolean`                        | -          | Whether to always show leading zeros in the hour field. By default, determined by locale. |

#### State Props

| Prop         | Type      | Default | Description                                        |
| ------------ | --------- | ------- | -------------------------------------------------- |
| `isDisabled` | `boolean` | -       | Whether the input is disabled.                     |
| `isReadOnly` | `boolean` | -       | Whether the input can be selected but not changed. |

#### Form Props

| Prop        | Type      | Default | Description                                                                      |
| ----------- | --------- | ------- | -------------------------------------------------------------------------------- |
| `name`      | `string`  | -       | Name of the input element, for HTML form submission. Submits as ISO 8601 string. |
| `autoFocus` | `boolean` | -       | Whether the element should receive focus on render.                              |

#### Accessibility Props

| Prop               | Type     | Default | Description                                           |
| ------------------ | -------- | ------- | ----------------------------------------------------- |
| `aria-label`       | `string` | -       | Accessibility label when no visible label is present. |
| `aria-labelledby`  | `string` | -       | ID of elements that label this field.                 |
| `aria-describedby` | `string` | -       | ID of elements that describe this field.              |
| `aria-details`     | `string` | -       | ID of elements with additional details.               |

### Composition Components

TimeField works with these separate components that should be imported and used directly:

* **Label** - Field label component from `@heroui/react`
* **TimeField.Group** - Time input group component (documented below)
* **TimeField.Input** - Input component with segmented editing from `@heroui/react`
* **TimeField.Segment** - Individual time segment (hour, minute, second, etc.)
* **TimeField.Prefix** / **TimeField.Suffix** - Prefix and suffix slots for the input group
* **Description** - Helper text component from `@heroui/react`
* **FieldError** - Validation error message from `@heroui/react`

Each of these components has its own props API. Use them directly within TimeField for composition:

```tsx
import {parseTime} from '@internationalized/date';
import {TimeField, Label, Description, FieldError} from '@heroui/react';

<TimeField
  isRequired
  isInvalid={hasError}
  minValue={parseTime('09:00')}
  maxValue={parseTime('17:00')}
  value={time}
  onChange={setTime}
>
  <Label>Appointment Time</Label>
  <TimeField.Group>
    <TimeField.Input>
      {(segment) => <TimeField.Segment segment={segment} />}
    </TimeField.Input>
  </TimeField.Group>
  <Description>Select a time between 9:00 AM and 5:00 PM.</Description>
  <FieldError>Please select a valid time.</FieldError>
</TimeField>

```

### TimeValue Types

TimeField uses types from [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/):

* `Time` - Time only (hour, minute, second)
* `CalendarDateTime` - Date with time but no timezone (TimeField displays only the time portion)
* `ZonedDateTime` - Date with time and timezone (TimeField displays only the time portion)

Example:

```tsx
import {parseTime, Time, getLocalTimeZone, now} from '@internationalized/date';

// Parse from string
const time = parseTime('14:30');

// Create from current time
const currentTime = now(getLocalTimeZone());
const timeValue = new Time(currentTime.hour, currentTime.minute, currentTime.second);

// Use in TimeField
<TimeField value={time} onChange={setTime}>
  {/* ... */}
</TimeField>

```

> **Note:** TimeField uses the [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) package for time manipulation, parsing, and type definitions. See the [Internationalized Date documentation](https://react-aria.adobe.com/internationalized/date/) for more information about available types and functions.

### TimeFieldRenderProps

When using render props with `className`, `style`, or `children`, these values are available:

| Prop             | Type      | Description                                     |
| ---------------- | --------- | ----------------------------------------------- |
| `isDisabled`     | `boolean` | Whether the field is disabled.                  |
| `isInvalid`      | `boolean` | Whether the field is currently invalid.         |
| `isReadOnly`     | `boolean` | Whether the field is read-only.                 |
| `isRequired`     | `boolean` | Whether the field is required.                  |
| `isFocused`      | `boolean` | Whether the field is currently focused.         |
| `isFocusWithin`  | `boolean` | Whether any child element is focused.           |
| `isFocusVisible` | `boolean` | Whether focus is visible (keyboard navigation). |

### TimeField.Group Props

TimeField.Group accepts all props from React Aria's `Group` component plus the following:

| Prop        | Type                       | Default     | Description                                                                                                                                                        |
| ----------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `className` | `string`                   | -           | Tailwind classes merged with the component styles.                                                                                                                 |
| `variant`   | `"primary" \| "secondary"` | `"primary"` | Visual variant of the component. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |

### TimeField.Input Props

TimeField.Input accepts all props from React Aria's `DateInput` component plus the following:

| Prop        | Type                       | Default     | Description                                                                                                                                                    |
| ----------- | -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className` | `string`                   | -           | Tailwind classes merged with the component styles.                                                                                                             |
| `variant`   | `"primary" \| "secondary"` | `"primary"` | Visual variant of the input. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |

The `TimeField.Input` component accepts a render prop function that receives date segments. Each segment represents a part of the time (hour, minute, second, etc.).

### TimeField.Segment Props

TimeField.Segment accepts all props from React Aria's `DateSegment` component:

| Prop        | Type          | Default | Description                                                   |
| ----------- | ------------- | ------- | ------------------------------------------------------------- |
| `segment`   | `DateSegment` | -       | The date segment object from the TimeField.Input render prop. |
| `className` | `string`      | -       | Tailwind classes merged with the component styles.            |

### TimeField.Prefix Props

TimeField.Prefix accepts standard HTML `div` attributes:

| Prop        | Type        | Default | Description                                        |
| ----------- | ----------- | ------- | -------------------------------------------------- |
| `className` | `string`    | -       | Tailwind classes merged with the component styles. |
| `children`  | `ReactNode` | -       | Content to display in the prefix slot.             |

### TimeField.Suffix Props

TimeField.Suffix accepts standard HTML `div` attributes:

| Prop        | Type        | Default | Description                                        |
| ----------- | ----------- | ------- | -------------------------------------------------- |
| `className` | `string`    | -       | Tailwind classes merged with the component styles. |
| `children`  | `ReactNode` | -       | Content to display in the suffix slot.             |

## TimeField.Group Styling

### Customizing the component classes

The base classes power every instance. Override them once with `@layer components`.

```css
@layer components {
  .date-input-group {
    @apply inline-flex h-9 items-center overflow-hidden rounded-field border bg-field text-sm text-field-foreground shadow-field outline-none;

    &:hover,
    &[data-hovered="true"] {
      @apply bg-field-hover;
    }

    &[data-focus-within="true"],
    &:focus-within {
      @apply status-focused-field;
    }

    &[data-invalid="true"] {
      @apply status-invalid-field;
    }

    &[data-disabled="true"],
    &[aria-disabled="true"] {
      @apply status-disabled;
    }
  }

  .date-input-group__input {
    @apply flex flex-1 items-center gap-px rounded-none border-0 bg-transparent px-3 py-2 shadow-none outline-none;
  }

  .date-input-group__segment {
    @apply inline-block rounded-md px-0.5 text-end tabular-nums outline-none;

    &:focus,
    &[data-focused="true"] {
      @apply bg-accent-soft text-accent-soft-foreground;
    }
  }

  .date-input-group__prefix,
  .date-input-group__suffix {
    @apply pointer-events-none shrink-0 text-field-placeholder flex items-center;
  }
}

```

### TimeField.Group CSS Classes

* `.date-input-group` – Root container styling
* `.date-input-group__input` – Input wrapper styling
* `.date-input-group__segment` – Individual time segment styling
* `.date-input-group__prefix` – Prefix element styling
* `.date-input-group__suffix` – Suffix element styling

### TimeField.Group Interactive States

* **Hover**: `:hover` or `[data-hovered="true"]`
* **Focus Within**: `[data-focus-within="true"]` or `:focus-within`
* **Invalid**: `[data-invalid="true"]` (also syncs with `aria-invalid`)
* **Disabled**: `[data-disabled="true"]` or `[aria-disabled="true"]`
* **Segment Focus**: `:focus` or `[data-focused="true"]` on segment elements
* **Segment Placeholder**: `[data-placeholder="true"]` on segment elements
