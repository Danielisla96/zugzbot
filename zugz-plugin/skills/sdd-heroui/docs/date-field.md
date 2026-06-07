# DateField

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/date-field
> Date input field with labels, descriptions, and validation built on React Aria DateField


## Import

```tsx
import { DateField } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {DateField, Label} from "@heroui/react";

export function Basic() {
  return (
    <DateField className="w-[256px]" name="date">
      <Label>Date</Label>
      <DateField.Group>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>
  );
}

```

### Anatomy

```tsx
import {DateField, Label, Description, FieldError} from '@heroui/react';

export default () => (
  <DateField>
    <Label />
    <DateField.Group>
      <DateField.Input>
        {(segment) => <DateField.Segment segment={segment} />}
      </DateField.Input>
    </DateField.Group>
    <Description />
    <FieldError />
  </DateField>
)

```

> **DateField** combines label, date input, description, and error into a single accessible component.

### With Description

```tsx
"use client";

import {DateField, Description, Label} from "@heroui/react";

export function WithDescription() {
  return (
    <div className="flex flex-col gap-4">
      <DateField className="w-[256px]" name="date">
        <Label>Birth date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <Description>Enter your date of birth</Description>
      </DateField>
      <DateField className="w-[256px]" name="appointment-date">
        <Label>Appointment date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <Description>Enter a date for your appointment</Description>
      </DateField>
    </div>
  );
}

```

### Required Field

```tsx
"use client";

import {DateField, Description, Label} from "@heroui/react";

export function Required() {
  return (
    <div className="flex flex-col gap-4">
      <DateField isRequired className="w-[256px]" name="date">
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField isRequired className="w-[256px]" name="start-date">
        <Label>Start date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <Description>Required field</Description>
      </DateField>
    </div>
  );
}

```

### Validation

Use `isInvalid` together with `FieldError` to surface validation messages.

```tsx
"use client";

import {DateField, FieldError, Label} from "@heroui/react";

export function Invalid() {
  return (
    <div className="flex flex-col gap-4">
      <DateField isInvalid isRequired className="w-[256px]" name="date">
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <FieldError>Please enter a valid date</FieldError>
      </DateField>
      <DateField isInvalid className="w-[256px]" name="invalid-date">
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <FieldError>Date must be in the future</FieldError>
      </DateField>
    </div>
  );
}

```

### With Validation

DateField supports validation with `minValue`, `maxValue`, and custom validation logic.

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {DateField, Description, FieldError, Label} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

export function WithValidation() {
  const [value, setValue] = useState<DateValue | null>(null);
  const todayDate = today(getLocalTimeZone());
  const isInvalid = value !== null && value.compare(todayDate) < 0;

  return (
    <div className="flex flex-col gap-4">
      <DateField
        isRequired
        className="w-[256px]"
        isInvalid={isInvalid}
        minValue={todayDate}
        name="date"
        value={value}
        onChange={setValue}
      >
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        {isInvalid ? (
          <FieldError>Date must be today or in the future</FieldError>
        ) : (
          <Description>Enter a date from today onwards</Description>
        )}
      </DateField>
    </div>
  );
}

```

### Granularity

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {CircleQuestion} from "@gravity-ui/icons";
import {DateField, Label, ListBox, Select, Tooltip} from "@heroui/react";
import {parseDate, parseZonedDateTime} from "@internationalized/date";
import {useState} from "react";

export function Granularity() {
  const granularityOptions = [
    {id: "day", label: "Day"},
    {id: "hour", label: "Hour"},
    {id: "minute", label: "Minute"},
    {id: "second", label: "Second"},
  ] as const;

  const [granularity, setGranularity] = useState<"day" | "hour" | "minute" | "second">("day");

  // Determine appropriate default value based on granularity
  let defaultValue: DateValue;

  if (granularity === "day") {
    defaultValue = parseDate("2025-02-03");
  } else {
    // hour, minute, second
    defaultValue = parseZonedDateTime("2025-02-03T08:45:00[America/Los_Angeles]");
  }

  return (
    <div className="flex gap-4">
      <DateField
        className="w-[256px]"
        defaultValue={defaultValue}
        granularity={granularity}
        name="granularity-date"
      >
        <Label>Appointment Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Label>Granularity</Label>
          <Tooltip delay={0}>
            <Tooltip.Trigger aria-label="Granularity information">
              <CircleQuestion className="size-4 text-muted" />
            </Tooltip.Trigger>
            <Tooltip.Content placement="bottom start">
              <p>
                Determines the smallest unit displayed in the date picker. By default, this is "day"
                for dates, and "minute" for times.
              </p>
            </Tooltip.Content>
          </Tooltip>
        </div>
        <Select
          className="w-[110px]"
          placeholder="Select granularity"
          value={granularity}
          variant="secondary"
          onChange={(value) => setGranularity(value as typeof granularity)}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {granularityOptions.map((option) => (
                <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </div>
  );
}

```

### Controlled

Control the value to synchronize with other components or state management.

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Button, DateField, Description, Label} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

export function Controlled() {
  const [value, setValue] = useState<DateValue | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <DateField className="w-[256px]" name="date" value={value} onChange={setValue}>
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <Description>Current value: {value ? value.toString() : "(empty)"}</Description>
      </DateField>
      <div className="flex gap-2">
        <Button variant="tertiary" onPress={() => setValue(today(getLocalTimeZone()))}>
          Set today
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

import {DateField, Description, Label} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function Disabled() {
  return (
    <div className="flex flex-col gap-4">
      <DateField isDisabled className="w-[256px]" name="date" value={today(getLocalTimeZone())}>
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <Description>This date field is disabled</Description>
      </DateField>
      <DateField isDisabled className="w-[256px]" name="date-empty">
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <Description>This date field is disabled</Description>
      </DateField>
    </div>
  );
}

```

### With Icons

Add prefix or suffix icons to enhance the date field.

```tsx
"use client";

import {Calendar} from "@gravity-ui/icons";
import {DateField, Label} from "@heroui/react";

export function WithPrefixIcon() {
  return (
    <DateField className="w-[256px]" name="date">
      <Label>Date</Label>
      <DateField.Group>
        <DateField.Prefix>
          <Calendar className="size-4 text-muted" />
        </DateField.Prefix>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>
  );
}

```

```tsx
"use client";

import {Calendar} from "@gravity-ui/icons";
import {DateField, Label} from "@heroui/react";

export function WithSuffixIcon() {
  return (
    <DateField className="w-[256px]" name="date">
      <Label>Date</Label>
      <DateField.Group>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <Calendar className="size-4 text-muted" />
        </DateField.Suffix>
      </DateField.Group>
    </DateField>
  );
}

```

```tsx
"use client";

import {Calendar, ChevronDown} from "@gravity-ui/icons";
import {DateField, Description, Label} from "@heroui/react";

export function WithPrefixAndSuffix() {
  return (
    <DateField className="w-[256px]" name="date">
      <Label>Date</Label>
      <DateField.Group>
        <DateField.Prefix>
          <Calendar className="size-4 text-muted" />
        </DateField.Prefix>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <ChevronDown className="size-4 text-muted" />
        </DateField.Suffix>
      </DateField.Group>
      <Description>Enter a date</Description>
    </DateField>
  );
}

```

### Full Width

```tsx
"use client";

import {Calendar, ChevronDown} from "@gravity-ui/icons";
import {DateField, Label} from "@heroui/react";

export function FullWidth() {
  return (
    <div className="w-[400px] space-y-4">
      <DateField fullWidth name="date">
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField fullWidth name="date-icons">
        <Label>Date</Label>
        <DateField.Group>
          <DateField.Prefix>
            <Calendar className="size-4 text-muted" />
          </DateField.Prefix>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <ChevronDown className="size-4 text-muted" />
          </DateField.Suffix>
        </DateField.Group>
      </DateField>
    </div>
  );
}

```

### Variants

The DateField.Group component supports two visual variants:

* **`primary`** (default) - Standard styling with shadow, suitable for most use cases
* **`secondary`** - Lower emphasis variant without shadow, suitable for use in Surface components

```tsx
"use client";

import {DateField, Label} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-col gap-4">
      <DateField className="w-[256px]" name="primary-date">
        <Label>Primary variant</Label>
        <DateField.Group variant="primary">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <DateField className="w-[256px]" name="secondary-date">
        <Label>Secondary variant</Label>
        <DateField.Group variant="secondary">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
    </div>
  );
}

```

### In Surface

When used inside a [Surface](/docs/components/surface) component, use `variant="secondary"` on DateField.Group to apply the lower emphasis variant suitable for surface backgrounds.

```tsx
"use client";

import {Calendar} from "@gravity-ui/icons";
import {DateField, Description, Label, Surface} from "@heroui/react";

export function OnSurface() {
  return (
    <Surface className="flex w-full max-w-sm flex-col gap-4 rounded-3xl p-6">
      <DateField className="w-full" name="date">
        <Label>Date</Label>
        <DateField.Group variant="secondary">
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <Description>Enter a date</Description>
      </DateField>
      <DateField className="w-full" name="date-2">
        <Label>Appointment date</Label>
        <DateField.Group variant="secondary">
          <DateField.Prefix>
            <Calendar className="size-4 text-muted" />
          </DateField.Prefix>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        <Description>Enter a date for your appointment</Description>
      </DateField>
    </Surface>
  );
}

```

### Form Example

Complete form example with validation and submission handling.

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Calendar} from "@gravity-ui/icons";
import {Button, DateField, Description, FieldError, Form, Label} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

export function FormExample() {
  const [value, setValue] = useState<DateValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const todayDate = today(getLocalTimeZone());
  const isInvalid = value !== null && value.compare(todayDate) < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value || isInvalid) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Date submitted:", {date: value});
      setValue(null);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Form className="flex w-[280px] flex-col gap-4" onSubmit={handleSubmit}>
      <DateField
        isRequired
        className="w-full"
        isInvalid={isInvalid}
        minValue={todayDate}
        name="date"
        value={value}
        onChange={setValue}
      >
        <Label>Appointment date</Label>
        <DateField.Group>
          <DateField.Prefix>
            <Calendar className="size-4 text-muted" />
          </DateField.Prefix>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        {isInvalid ? (
          <FieldError>Date must be today or in the future</FieldError>
        ) : (
          <Description>Enter a date from today onwards</Description>
        )}
      </DateField>
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

* **DatePicker**: Composable date picker with date field trigger and calendar popover
* **Calendar**: Interactive month grid for selecting dates
* **Label**: Accessible label for form controls

### Custom Render Function

```tsx
"use client";

import {DateField, Label} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <DateField
      className="w-[256px]"
      name="date"
      render={(props) => <div {...props} data-custom="date-field" />}
    >
      <Label render={(props) => <span {...props} data-custom="date-field-label" />}>Date</Label>
      <DateField.Group render={(props) => <div {...props} data-custom="date-field-group" />}>
        <DateField.Input render={(props) => <div {...props} data-custom="date-field-input" />}>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
      </DateField.Group>
    </DateField>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import {DateField, Label, Description} from '@heroui/react';

function CustomDateField() {
  return (
    <DateField className="gap-2 rounded-xl border border-border/60 bg-surface p-4 shadow-sm">
      <Label className="text-sm font-semibold text-default-700">
        Appointment date
      </Label>
      <DateField.Group className="rounded-lg border border-border/60 bg-surface px-3 py-2">
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
      </DateField.Group>
      <Description className="text-xs text-default-500">
        Select a date for your appointment.
      </Description>
    </DateField>
  );
}

```

### Customizing the component classes

DateField has minimal default styling. Override the `.date-field` class to customize the container styling.

```css
@layer components {
  .date-field {
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

* `.date-field` – Root container with minimal styling (`flex flex-col gap-1`)

> **Note:** Child components ([Label](/docs/components/label), [Description](/docs/components/description), [FieldError](/docs/components/field-error)) have their own CSS classes and styling. See their respective documentation for customization options. DateField.Group styling is documented below in the API Reference section.

### Interactive States

DateField automatically manages these data attributes based on its state:

* **Invalid**: `[data-invalid="true"]` or `[aria-invalid="true"]` - Automatically hides the description slot when invalid
* **Required**: `[data-required="true"]` - Applied when `isRequired` is true
* **Disabled**: `[data-disabled="true"]` - Applied when `isDisabled` is true
* **Focus Within**: `[data-focus-within="true"]` - Applied when any child input is focused

## API Reference

### DateField Props

DateField inherits all props from React Aria's [DateField](https://react-aria.adobe.com/DateField.md) component.

#### Base Props

| Prop        | Type                                                                           | Default | Description                                                         |
| ----------- | ------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------- |
| `children`  | `React.ReactNode \| (values: DateFieldRenderProps) => React.ReactNode`         | -       | Child components (Label, DateField.Group, etc.) or render function. |
| `className` | `string \| (values: DateFieldRenderProps) => string`                           | -       | CSS classes for styling, supports render props.                     |
| `style`     | `React.CSSProperties \| (values: DateFieldRenderProps) => React.CSSProperties` | -       | Inline styles, supports render props.                               |
| `fullWidth` | `boolean`                                                                      | `false` | Whether the date field should take full width of its container      |
| `id`        | `string`                                                                       | -       | The element's unique identifier.                                    |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, DateFieldRenderProps>`   | -       | Overrides the default DOM element with a custom render function.    |

#### Value Props

| Prop               | Type                                 | Default | Description                                                                                                                 |
| ------------------ | ------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `value`            | `DateValue \| null`                  | -       | Current value (controlled). Uses [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) types.   |
| `defaultValue`     | `DateValue \| null`                  | -       | Default value (uncontrolled). Uses [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) types. |
| `onChange`         | `(value: DateValue \| null) => void` | -       | Handler called when the value changes.                                                                                      |
| `placeholderValue` | `DateValue \| null`                  | -       | Placeholder date that influences the format of the placeholder.                                                             |

#### Validation Props

| Prop                 | Type                                                                 | Default    | Description                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `isRequired`         | `boolean`                                                            | `false`    | Whether user input is required before form submission.                                                                                         |
| `isInvalid`          | `boolean`                                                            | -          | Whether the value is invalid.                                                                                                                  |
| `minValue`           | `DateValue \| null`                                                  | -          | The minimum allowed date that a user may select. Uses [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) types. |
| `maxValue`           | `DateValue \| null`                                                  | -          | The maximum allowed date that a user may select. Uses [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) types. |
| `isDateUnavailable`  | `(date: DateValue) => boolean`                                       | -          | Callback that is called for each date. If it returns true, the date is unavailable.                                                            |
| `validate`           | `(value: DateValue) => ValidationError \| true \| null \| undefined` | -          | Custom validation function.                                                                                                                    |
| `validationBehavior` | `'native' \| 'aria'`                                                 | `'native'` | Whether to use native HTML form validation or ARIA attributes.                                                                                 |

#### Format Props

| Prop                      | Type          | Default | Description                                                                                  |
| ------------------------- | ------------- | ------- | -------------------------------------------------------------------------------------------- |
| `granularity`             | `Granularity` | -       | Determines the smallest unit displayed. Defaults to `"day"` for dates, `"minute"` for times. |
| `hourCycle`               | `12 \| 24`    | -       | Whether to display time in 12 or 24 hour format. By default, determined by locale.           |
| `hideTimeZone`            | `boolean`     | `false` | Whether to hide the time zone abbreviation.                                                  |
| `shouldForceLeadingZeros` | `boolean`     | -       | Whether to always show leading zeros in month, day, and hour fields.                         |

#### State Props

| Prop         | Type      | Default | Description                                        |
| ------------ | --------- | ------- | -------------------------------------------------- |
| `isDisabled` | `boolean` | -       | Whether the input is disabled.                     |
| `isReadOnly` | `boolean` | -       | Whether the input can be selected but not changed. |

#### Form Props

| Prop           | Type      | Default | Description                                                                      |
| -------------- | --------- | ------- | -------------------------------------------------------------------------------- |
| `name`         | `string`  | -       | Name of the input element, for HTML form submission. Submits as ISO 8601 string. |
| `autoFocus`    | `boolean` | -       | Whether the element should receive focus on render.                              |
| `autoComplete` | `string`  | -       | Type of autocomplete functionality the input should provide.                     |

#### Accessibility Props

| Prop               | Type     | Default | Description                                           |
| ------------------ | -------- | ------- | ----------------------------------------------------- |
| `aria-label`       | `string` | -       | Accessibility label when no visible label is present. |
| `aria-labelledby`  | `string` | -       | ID of elements that label this field.                 |
| `aria-describedby` | `string` | -       | ID of elements that describe this field.              |
| `aria-details`     | `string` | -       | ID of elements with additional details.               |

### Composition Components

DateField works with these separate components that should be imported and used directly:

* **Label** - Field label component from `@heroui/react`
* **DateField.Group** - Date input group component (documented below)
* **DateField.Input** - Input component with segmented editing from `@heroui/react`
* **DateField.InputContainer** - Scrollable container for grouping multiple inputs (e.g. start/end range inputs) with horizontal overflow
* **DateField.Segment** - Individual date segment (year, month, day, etc.)
* **DateField.Prefix** / **DateField.Suffix** - Prefix and suffix slots for the input group
* **Description** - Helper text component from `@heroui/react`
* **FieldError** - Validation error message from `@heroui/react`

Each of these components has its own props API. Use them directly within DateField for composition:

```tsx
import {parseDate} from '@internationalized/date';
import {DateField, Label, Description, FieldError} from '@heroui/react';

<DateField
  isRequired
  isInvalid={hasError}
  minValue={today(getLocalTimeZone())}
  value={date}
  onChange={setDate}
>
  <Label>Appointment Date</Label>
  <DateField.Group>
    <DateField.Input>
      {(segment) => <DateField.Segment segment={segment} />}
    </DateField.Input>
  </DateField.Group>
  <Description>Select a date from today onwards.</Description>
  <FieldError>Please select a valid date.</FieldError>
</DateField>

```

### DateValue Types

DateField uses types from [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/):

* `CalendarDate` - Date without time or timezone
* `CalendarDateTime` - Date with time but no timezone
* `ZonedDateTime` - Date with time and timezone
* `Time` - Time only

Example:

```tsx
import {parseDate, today, getLocalTimeZone} from '@internationalized/date';

// Parse from string
const date = parseDate('2024-01-15');

// Today's date
const todayDate = today(getLocalTimeZone());

// Use in DateField
<DateField value={date} onChange={setDate}>
  {/* ... */}
</DateField>

```

> **Note:** DateField uses the [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) package for date manipulation, parsing, and type definitions. See the [Internationalized Date documentation](https://react-aria.adobe.com/internationalized/date/) for more information about available types and functions.

### DateFieldRenderProps

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

### DateField.Group Props

DateField.Group accepts all props from React Aria's `Group` component plus the following:

| Prop        | Type                       | Default     | Description                                                                                                                                                        |
| ----------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `className` | `string`                   | -           | Tailwind classes merged with the component styles.                                                                                                                 |
| `fullWidth` | `boolean`                  | `false`     | Whether the date input group should take full width of its container                                                                                               |
| `variant`   | `"primary" \| "secondary"` | `"primary"` | Visual variant of the component. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |

### DateField.Input Props

DateField.Input accepts all props from React Aria's `DateInput` component plus the following:

| Prop        | Type                       | Default     | Description                                                                                                                                                    |
| ----------- | -------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className` | `string`                   | -           | Tailwind classes merged with the component styles.                                                                                                             |
| `variant`   | `"primary" \| "secondary"` | `"primary"` | Visual variant of the input. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |

The `DateField.Input` component accepts a render prop function that receives date segments. Each segment represents a part of the date (year, month, day, etc.).

### DateField.Segment Props

DateField.Segment accepts all props from React Aria's `DateSegment` component:

| Prop        | Type          | Default | Description                                                   |
| ----------- | ------------- | ------- | ------------------------------------------------------------- |
| `segment`   | `DateSegment` | -       | The date segment object from the DateField.Input render prop. |
| `className` | `string`      | -       | Tailwind classes merged with the component styles.            |

### DateField.InputContainer Props

DateField.InputContainer accepts standard HTML `div` attributes:

| Prop        | Type        | Default | Description                                                                                           |
| ----------- | ----------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `className` | `string`    | -       | Tailwind classes merged with the component styles.                                                    |
| `children`  | `ReactNode` | -       | Content to display inside the scrollable container (typically multiple `DateField.Input` components). |

### DateField.Prefix Props

DateField.Prefix accepts standard HTML `div` attributes:

| Prop        | Type        | Default | Description                                        |
| ----------- | ----------- | ------- | -------------------------------------------------- |
| `className` | `string`    | -       | Tailwind classes merged with the component styles. |
| `children`  | `ReactNode` | -       | Content to display in the prefix slot.             |

### DateField.Suffix Props

DateField.Suffix accepts standard HTML `div` attributes:

| Prop        | Type        | Default | Description                                        |
| ----------- | ----------- | ------- | -------------------------------------------------- |
| `className` | `string`    | -       | Tailwind classes merged with the component styles. |
| `children`  | `ReactNode` | -       | Content to display in the suffix slot.             |

## DateField.Group Styling

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

  .date-input-group__input-container {
    @apply flex flex-1 items-center;
    overflow-x: auto;
    overflow-y: clip;
    scrollbar-width: none;
  }

  .date-input-group__prefix,
  .date-input-group__suffix {
    @apply pointer-events-none shrink-0 text-field-placeholder flex items-center;
  }
}

```

### DateField.Group CSS Classes

* `.date-input-group` – Root container styling
* `.date-input-group__input` – Input wrapper styling
* `.date-input-group__input-container` – Scrollable container for grouping multiple inputs
* `.date-input-group__segment` – Individual date segment styling
* `.date-input-group__prefix` – Prefix element styling
* `.date-input-group__suffix` – Suffix element styling

### DateField.Group Interactive States

* **Hover**: `:hover` or `[data-hovered="true"]`
* **Focus Within**: `[data-focus-within="true"]` or `:focus-within`
* **Invalid**: `[data-invalid="true"]` (also syncs with `aria-invalid`)
* **Disabled**: `[data-disabled="true"]` or `[aria-disabled="true"]`
* **Segment Focus**: `:focus` or `[data-focused="true"]` on segment elements
* **Segment Placeholder**: `[data-placeholder="true"]` on segment elements
