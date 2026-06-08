# DatePicker

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/date-picker
> Composable date picker built on React Aria DatePicker with DateField and Calendar composition


## Import

```tsx
import { DatePicker, DateField, Calendar, Label } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {Calendar, DateField, DatePicker, Label} from "@heroui/react";

export function Basic() {
  return (
    <DatePicker className="w-64" name="date">
      <Label>Date</Label>
      <DateField.Group fullWidth>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label="Event date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({year}) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

```

### Anatomy

`DatePicker` follows a composition-first API. Compose `DateField` and `Calendar` explicitly to control structure and styling.

```tsx
import {Calendar, DateField, DatePicker, Label} from '@heroui/react';

export default () => (
  <DatePicker>
    <Label />
    <DateField.Group>
      <DateField.Input>
        {(segment) => <DateField.Segment segment={segment} />}
      </DateField.Input>
      <DateField.Suffix>
        <DatePicker.Trigger>
          <DatePicker.TriggerIndicator />
        </DatePicker.Trigger>
      </DateField.Suffix>
    </DateField.Group>
    <DatePicker.Popover>
      <Calendar aria-label="Choose date">
        <Calendar.Header>
          <Calendar.YearPickerTrigger>
            <Calendar.YearPickerTriggerHeading />
            <Calendar.YearPickerTriggerIndicator />
          </Calendar.YearPickerTrigger>
          <Calendar.NavButton slot="previous" />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>
            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
          </Calendar.GridHeader>
          <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
        </Calendar.Grid>
      </Calendar>
    </DatePicker.Popover>
  </DatePicker>
)

```

### Controlled

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Button, Calendar, DateField, DatePicker, Description, Label} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

export function Controlled() {
  const [value, setValue] = useState<DateValue | null>(today(getLocalTimeZone()));

  return (
    <div className="flex w-64 flex-col gap-4">
      <DatePicker name="date" value={value} onChange={setValue}>
        <Label>Date</Label>
        <DateField.Group fullWidth>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <Calendar aria-label="Event date">
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({year}) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
      <Description>Current value: {value ? value.toString() : "(empty)"}</Description>
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

### Validation

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Calendar, DateField, DatePicker, FieldError, Label} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

export function WithValidation() {
  const [value, setValue] = useState<DateValue | null>(null);
  const currentDate = today(getLocalTimeZone());
  const isInvalid = value != null && value.compare(currentDate) < 0;

  return (
    <DatePicker
      isRequired
      className="w-64"
      isInvalid={isInvalid}
      minValue={currentDate}
      name="date"
      value={value}
      onChange={setValue}
    >
      <Label>Appointment date</Label>
      <DateField.Group fullWidth>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <FieldError>Date must be today or in the future.</FieldError>
      <DatePicker.Popover>
        <Calendar aria-label="Event date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({year}) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

```

### Format Options

Control how DatePicker values are displayed with props such as `granularity`, `hourCycle`, `hideTimeZone`, and `shouldForceLeadingZeros`.

```tsx
"use client";

import type {TimeValue} from "@heroui/react";
import type {DateValue} from "@internationalized/date";

import {
  Calendar,
  DateField,
  DatePicker,
  Label,
  ListBox,
  Select,
  Switch,
  TimeField,
} from "@heroui/react";
import {getLocalTimeZone, parseDate, parseZonedDateTime} from "@internationalized/date";
import {useMemo, useState} from "react";

type Granularity = "day" | "hour" | "minute" | "second";
type HourCycle = 12 | 24;
const granularityOptions: {label: string; value: Granularity}[] = [
  {label: "Day", value: "day"},
  {label: "Hour", value: "hour"},
  {label: "Minute", value: "minute"},
  {label: "Second", value: "second"},
];
const hourCycleOptions: {label: string; value: HourCycle}[] = [
  {label: "12-hour", value: 12},
  {label: "24-hour", value: 24},
];

export function FormatOptions() {
  const [granularity, setGranularity] = useState<Granularity>("minute");
  const [hourCycle, setHourCycle] = useState<HourCycle>(12);
  const [hideTimeZone, setHideTimeZone] = useState(false);
  const [shouldForceLeadingZeros, setShouldForceLeadingZeros] = useState(false);
  const timeGranularity = granularity !== "day" ? granularity : undefined;
  const showTimeField = !!timeGranularity;
  const defaultValue = useMemo<DateValue>(() => {
    const localTimeZone = getLocalTimeZone();

    if (granularity === "day") {
      return parseDate("2026-02-03");
    }

    return parseZonedDateTime(`2026-02-03T08:45:00[${localTimeZone}]`);
  }, [granularity]);

  return (
    <div className="flex flex-col gap-4">
      <DatePicker
        key={granularity}
        className="w-fit min-w-72"
        defaultValue={defaultValue}
        granularity={granularity}
        hideTimeZone={hideTimeZone}
        hourCycle={hourCycle}
        name="date"
        shouldForceLeadingZeros={shouldForceLeadingZeros}
      >
        {({state}) => (
          <>
            <Label>Date and time</Label>
            <DateField.Group fullWidth>
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
              <DateField.Suffix>
                <DatePicker.Trigger>
                  <DatePicker.TriggerIndicator />
                </DatePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DatePicker.Popover className="flex flex-col gap-3">
              <Calendar aria-label="Event date">
                <Calendar.Header>
                  <Calendar.YearPickerTrigger>
                    <Calendar.YearPickerTriggerHeading />
                    <Calendar.YearPickerTriggerIndicator />
                  </Calendar.YearPickerTrigger>
                  <Calendar.NavButton slot="previous" />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
                </Calendar.Grid>
                <Calendar.YearPickerGrid>
                  <Calendar.YearPickerGridBody>
                    {({year}) => <Calendar.YearPickerCell year={year} />}
                  </Calendar.YearPickerGridBody>
                </Calendar.YearPickerGrid>
              </Calendar>
              {!!showTimeField && (
                <div className="flex items-center justify-between">
                  <Label>Time</Label>
                  <TimeField
                    aria-label="Time"
                    granularity={timeGranularity}
                    hideTimeZone={hideTimeZone}
                    hourCycle={hourCycle}
                    name="time"
                    shouldForceLeadingZeros={shouldForceLeadingZeros}
                    value={state.timeValue}
                    onChange={(v) => state.setTimeValue(v as TimeValue)}
                  >
                    <TimeField.Group variant="secondary">
                      <TimeField.Input>
                        {(segment) => <TimeField.Segment segment={segment} />}
                      </TimeField.Input>
                    </TimeField.Group>
                  </TimeField>
                </div>
              )}
            </DatePicker.Popover>
          </>
        )}
      </DatePicker>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <Select
            className="w-[120px]"
            value={granularity}
            variant="secondary"
            onChange={(value) => setGranularity(value as Granularity)}
          >
            <Label>Granularity</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {granularityOptions.map((option) => (
                  <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
                    {option.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Select
            className="w-[120px]"
            value={hourCycle}
            variant="secondary"
            onChange={(value) => setHourCycle(Number(value) as HourCycle)}
          >
            <Label>Hour cycle</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {hourCycleOptions.map((option) => (
                  <ListBox.Item key={option.value} id={option.value} textValue={option.label}>
                    {option.label}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      <div className="flex min-w-80 flex-col gap-2">
        <Switch isSelected={hideTimeZone} onChange={setHideTimeZone}>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Label className="text-sm">Hide timezone</Label>
        </Switch>
        <Switch isSelected={shouldForceLeadingZeros} onChange={setShouldForceLeadingZeros}>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Label className="text-sm">Force leading zeros</Label>
        </Switch>
      </div>
    </div>
  );
}

```

### Disabled

```tsx
"use client";

import {Calendar, DateField, DatePicker, Description, Label} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function Disabled() {
  return (
    <DatePicker isDisabled className="w-64" name="date" value={today(getLocalTimeZone())}>
      <Label>Date</Label>
      <DateField.Group fullWidth>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <Description>This date picker is disabled.</Description>
      <DatePicker.Popover>
        <Calendar aria-label="Event date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({year}) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

```

### Custom Indicator

`DatePicker.TriggerIndicator` renders the default `IconCalendar` when no children are provided. Pass children to replace it.

```tsx
"use client";

import {Calendar, DateField, DatePicker, Description, Label} from "@heroui/react";
import {Icon} from "@iconify/react";

export function WithCustomIndicator() {
  return (
    <DatePicker className="w-64" name="date">
      <Label>Date</Label>
      <DateField.Group fullWidth>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator>
              <Icon className="size-4" icon="gravity-ui:chevron-down" />
            </DatePicker.TriggerIndicator>
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <Description>Replace the default calendar icon by passing custom children.</Description>
      <DatePicker.Popover>
        <Calendar aria-label="Event date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({year}) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

```

### Form Example

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  Description,
  FieldError,
  Form,
  Label,
} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

export function FormExample() {
  const [value, setValue] = useState<DateValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentDate = today(getLocalTimeZone());
  const isInvalid = value != null && value.compare(currentDate) < 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!value || isInvalid) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setValue(null);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <Form className="flex w-64 flex-col gap-3" onSubmit={handleSubmit}>
      <DatePicker
        isRequired
        isInvalid={isInvalid}
        minValue={currentDate}
        name="appointmentDate"
        value={value}
        onChange={setValue}
      >
        <Label>Appointment date</Label>
        <DateField.Group fullWidth>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        {isInvalid ? (
          <FieldError>Date must be today or in the future.</FieldError>
        ) : (
          <Description>Choose a valid appointment date.</Description>
        )}
        <DatePicker.Popover>
          <Calendar aria-label="Event date">
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({year}) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
      <Button
        className="w-full"
        isDisabled={!value || isInvalid}
        isPending={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </Form>
  );
}

```

### International Calendar

By default, DatePicker displays dates using the calendar system for the user's locale. You can override this by wrapping your DatePicker with `I18nProvider` and setting the [Unicode calendar locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar#adding_a_calendar_in_the_locale_string).

The example below shows the Indian calendar system:

```tsx
"use client";

import {Calendar, DateField, DatePicker, Label} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {I18nProvider} from "react-aria-components";

export function InternationalCalendar() {
  return (
    <I18nProvider locale="hi-IN-u-ca-indian">
      <DatePicker
        className="w-64"
        defaultValue={today(getLocalTimeZone())}
        name="international-date"
      >
        <Label>Event date</Label>
        <DateField.Group fullWidth>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger>
              <DatePicker.TriggerIndicator />
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DatePicker.Popover>
          <Calendar aria-label="Event date">
            <Calendar.Header>
              <Calendar.YearPickerTrigger>
                <Calendar.YearPickerTriggerHeading />
                <Calendar.YearPickerTriggerIndicator />
              </Calendar.YearPickerTrigger>
              <Calendar.NavButton slot="previous" />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
            </Calendar.Grid>
            <Calendar.YearPickerGrid>
              <Calendar.YearPickerGridBody>
                {({year}) => <Calendar.YearPickerCell year={year} />}
              </Calendar.YearPickerGridBody>
            </Calendar.YearPickerGrid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </I18nProvider>
  );
}

```

**Note:** The `onChange` event always returns a date in the same calendar system as the `value` or `defaultValue` (Gregorian if no value is provided), regardless of the displayed locale. This ensures your application logic works consistently with a single calendar system while still displaying dates in the user's preferred format.

For a complete list of supported calendar systems and their identifiers, see:

* [React Aria Calendar Implementations](https://react-aria.adobe.com/internationalized/date/Calendar#implementations)
* [React Aria International Calendars](https://react-aria.adobe.com/Calendar#international-calendars)

### Custom Render Function

```tsx
"use client";

import {Calendar, DateField, DatePicker, Label} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <DatePicker
      className="w-64"
      name="date"
      render={(props) => <div {...props} data-custom="date-picker" />}
    >
      <Label render={(props) => <span {...props} data-custom="date-picker-label" />}>Date</Label>
      <DateField.Group
        fullWidth
        render={(props) => <div {...props} data-custom="date-field-group" />}
      >
        <DateField.Input render={(props) => <div {...props} data-custom="date-field-input" />}>
          {(segment) => (
            <DateField.Segment
              render={(props) => <span {...props} data-custom="date-field-segment" />}
              segment={segment}
            />
          )}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger
            render={(props) => <button {...props} data-custom="date-picker-trigger" />}
          >
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover>
        <Calendar aria-label="Event date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({year}) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

```

## Related Components

* **Calendar**: Interactive month grid for selecting dates
* **RangeCalendar**: Interactive month grid for selecting date ranges
* **DateField**: Date input field with labels, descriptions, and validation

## Styling

### Passing Tailwind CSS classes

You can style each composition part independently:

```tsx
import {Calendar, DateField, DatePicker, Label} from '@heroui/react';

function CustomDatePicker() {
  return (
    <DatePicker className="w-[320px] gap-2">
      <Label className="text-sm font-semibold">Date</Label>
      <DateField.Group className="rounded-xl border border-border/60 bg-surface" fullWidth variant="secondary">
        <DateField.Input>
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger className="w-full">
            <DatePicker.TriggerIndicator className="text-default-600" />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover className="rounded-xl p-2">
        <Calendar aria-label="Custom date picker calendar">
          {/* Calendar parts */}
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

```

### Customizing the component classes

To customize DatePicker base classes, use `@layer components`.

```css
@layer components {
  .date-picker {
    @apply inline-flex flex-col gap-1;
  }

  .date-picker__trigger {
    @apply inline-flex items-center justify-between;
  }

  .date-picker__trigger-indicator {
    @apply text-muted;
  }

  .date-picker__popover {
    @apply min-w-[var(--trigger-width)] p-0;
  }
}

```

HeroUI follows [BEM](https://getbem.com/) naming for reusable customization.

### CSS Classes

DatePicker uses these classes in `packages/styles/components/date-picker.css`:

* `.date-picker` - Root wrapper.
* `.date-picker__trigger` - Trigger part that opens the popover.
* `.date-picker__trigger-indicator` - Default/custom indicator slot.
* `.date-picker__popover` - Popover content wrapper.

### Interactive States

DatePicker supports React Aria data attributes and pseudo states:

* **Open**: `[data-open="true"]` on trigger.
* **Disabled**: `[data-disabled="true"]` or `[aria-disabled="true"]` on trigger.
* **Focus visible**: `:focus-visible` or `[data-focus-visible="true"]` on trigger.
* **Hover**: `:hover` or `[data-hovered="true"]` on trigger.

## API Reference

### DatePicker Props

DatePicker inherits all props from React Aria [DatePicker](https://react-aria.adobe.com/DatePicker.md).

| Prop           | Type                                                                          | Default | Description                                                      |
| -------------- | ----------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `value`        | `DateValue \| null`                                                           | -       | Controlled selected date value.                                  |
| `defaultValue` | `DateValue \| null`                                                           | -       | Default selected value in uncontrolled mode.                     |
| `onChange`     | `(value: DateValue \| null) => void`                                          | -       | Called when selected date changes.                               |
| `isOpen`       | `boolean`                                                                     | -       | Controlled popover open state.                                   |
| `defaultOpen`  | `boolean`                                                                     | `false` | Initial popover open state.                                      |
| `onOpenChange` | `(isOpen: boolean) => void`                                                   | -       | Called when popover open state changes.                          |
| `isDisabled`   | `boolean`                                                                     | `false` | Disables date selection and trigger interactions.                |
| `isInvalid`    | `boolean`                                                                     | -       | Marks the field as invalid for validation state.                 |
| `minValue`     | `DateValue`                                                                   | -       | Minimum selectable date.                                         |
| `maxValue`     | `DateValue`                                                                   | -       | Maximum selectable date.                                         |
| `name`         | `string`                                                                      | -       | Name used for HTML form submission.                              |
| `children`     | `ReactNode \| (values: DatePickerRenderProps) => ReactNode`                   | -       | Composed content or render function.                             |
| `render`       | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, DatePickerRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### Composition Parts

| Component                     | Description                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| `DatePicker.Root`             | Root date picker container and state owner.                 |
| `DatePicker.Trigger`          | Trigger button, usually rendered inside `DateField.Suffix`. |
| `DatePicker.TriggerIndicator` | Indicator slot with default calendar icon.                  |
| `DatePicker.Popover`          | Popover wrapper for `Calendar` content.                     |

### Related packages

* [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) — date types (`CalendarDate`, `CalendarDateTime`, `ZonedDateTime`) and utilities used by all date components
* [`I18nProvider`](https://react-aria.adobe.com/I18nProvider) — override locale for a subtree
* [`useLocale`](https://react-aria.adobe.com/useLocale) — read the current locale and layout direction
