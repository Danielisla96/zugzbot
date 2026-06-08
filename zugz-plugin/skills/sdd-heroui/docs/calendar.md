# Calendar

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/calendar
> Composable date picker with month grid, navigation, and year picker support built on React Aria Calendar


## Import

```tsx
import { Calendar } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {Calendar} from "@heroui/react";

export function Basic() {
  return (
    <Calendar aria-label="Event date">
      <Calendar.Header>
        <Calendar.Heading />
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
  );
}

```

### Anatomy

```tsx
import {Calendar} from '@heroui/react';

export default () => (
  <Calendar aria-label="Event date">
    <Calendar.Header>
      <Calendar.Heading />
      <Calendar.NavButton slot="previous" />
      <Calendar.NavButton slot="next" />
    </Calendar.Header>
    <Calendar.Grid>
      <Calendar.GridHeader>
        {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
      </Calendar.GridHeader>
      <Calendar.GridBody>
        {(date) => <Calendar.Cell date={date} />}
      </Calendar.GridBody>
    </Calendar.Grid>
  </Calendar>
)

```

### Year Picker

`Calendar.YearPickerTrigger`, `Calendar.YearPickerGrid`, and their body/cell subcomponents provide an integrated year navigation pattern.

```tsx
"use client";

import {Calendar} from "@heroui/react";

export function YearPicker() {
  return (
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
  );
}

```

### Default Value

```tsx
"use client";

import {Calendar} from "@heroui/react";
import {parseDate} from "@internationalized/date";

export function DefaultValue() {
  return (
    <Calendar aria-label="Event date" defaultValue={parseDate("2025-02-14")}>
      <Calendar.Header>
        <Calendar.Heading />
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
  );
}

```

### Controlled

Use controlled `value` and `focusedValue` for external state coordination and custom shortcuts.

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Button, ButtonGroup, Calendar, Description} from "@heroui/react";
import {
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  startOfWeek,
  today,
} from "@internationalized/date";
import {useState} from "react";
import {useLocale} from "react-aria-components";

export function Controlled() {
  const [value, setValue] = useState<DateValue | null>(null);
  const [focusedDate, setFocusedDate] = useState<DateValue>(parseDate("2025-12-25"));
  const {locale} = useLocale();

  return (
    <div className="flex flex-col items-center gap-4">
      <ButtonGroup fullWidth size="sm" variant="tertiary">
        <Button
          onPress={() => {
            const todayDate = today(getLocalTimeZone());

            setValue(todayDate);
            setFocusedDate(todayDate);
          }}
        >
          Today
        </Button>
        <Button
          onPress={() => {
            const nextWeekStart = startOfWeek(today(getLocalTimeZone()), locale);

            setValue(nextWeekStart);
            setFocusedDate(nextWeekStart);
          }}
        >
          Week
        </Button>
        <Button
          onPress={() => {
            const nextMonthStart = startOfMonth(today(getLocalTimeZone()));

            setValue(nextMonthStart);
            setFocusedDate(nextMonthStart);
          }}
        >
          Month
        </Button>
      </ButtonGroup>

      <Calendar
        aria-label="Event date"
        focusedValue={focusedDate}
        value={value}
        onChange={setValue}
        onFocusChange={setFocusedDate}
      >
        <Calendar.Header>
          <Calendar.Heading />
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

      <Description className="text-center">
        Selected date: {value ? value.toString() : "(none)"}
      </Description>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            const todayDate = today(getLocalTimeZone());

            setValue(todayDate);
            setFocusedDate(todayDate);
          }}
        >
          Set Today
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            const christmasDate = parseDate("2025-12-25");

            setValue(christmasDate);
            setFocusedDate(christmasDate);
          }}
        >
          Set Christmas
        </Button>
        <Button size="sm" variant="tertiary" onPress={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}

```

### Min and Max Dates

```tsx
"use client";

import {Calendar, Description} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function MinMaxDates() {
  const now = today(getLocalTimeZone());
  const minDate = now;
  const maxDate = now.add({months: 3});

  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar aria-label="Appointment date" maxValue={maxDate} minValue={minDate}>
        <Calendar.Header>
          <Calendar.Heading />
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
      <Description className="text-center">
        Select a date between today and {maxDate.toString()}
      </Description>
    </div>
  );
}

```

### Unavailable Dates

Use `isDateUnavailable` to block dates such as weekends, holidays, or booked slots.

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Calendar, Description} from "@heroui/react";
import {isWeekend} from "@internationalized/date";
import {useLocale} from "react-aria-components";

export function UnavailableDates() {
  const {locale} = useLocale();
  const isDateUnavailable = (date: DateValue) => isWeekend(date, locale);

  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar aria-label="Appointment date" isDateUnavailable={isDateUnavailable}>
        <Calendar.Header>
          <Calendar.Heading />
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
      <Description className="text-center">Weekends are unavailable</Description>
    </div>
  );
}

```

### Disabled

```tsx
"use client";

import {Calendar, Description} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function Disabled() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar isDisabled aria-label="Event date" defaultValue={today(getLocalTimeZone())}>
        <Calendar.Header>
          <Calendar.Heading />
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
      <Description className="text-center">Calendar is disabled</Description>
    </div>
  );
}

```

### Read Only

```tsx
"use client";

import {Calendar, Description} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function ReadOnly() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar isReadOnly aria-label="Event date" defaultValue={today(getLocalTimeZone())}>
        <Calendar.Header>
          <Calendar.Heading />
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
      <Description className="text-center">Calendar is read-only</Description>
    </div>
  );
}

```

### Focused Value

Programmatically control which date is focused using `focusedValue` and `onFocusChange`.

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Button, Calendar, Description} from "@heroui/react";
import {parseDate} from "@internationalized/date";
import {useState} from "react";

export function FocusedValue() {
  const [focusedDate, setFocusedDate] = useState<DateValue>(parseDate("2025-06-15"));

  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar aria-label="Event date" focusedValue={focusedDate} onFocusChange={setFocusedDate}>
        <Calendar.Header>
          <Calendar.Heading />
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

      <Description className="text-center">Focused: {focusedDate.toString()}</Description>

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setFocusedDate(parseDate("2025-01-01"))}
        >
          Go to Jan
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setFocusedDate(parseDate("2025-06-15"))}
        >
          Go to Jun
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setFocusedDate(parseDate("2025-12-25"))}
        >
          Go to Christmas
        </Button>
      </div>
    </div>
  );
}

```

### Cell Indicators

You can customize `Calendar.Cell` children and use `Calendar.CellIndicator` to display metadata like events.

```tsx
"use client";

import {Calendar} from "@heroui/react";
import {getLocalTimeZone, isToday} from "@internationalized/date";

const datesWithEvents = [3, 7, 12, 15, 21, 28];

export function WithIndicators() {
  return (
    <Calendar aria-label="Event date">
      <Calendar.Header>
        <Calendar.Heading />
        <Calendar.NavButton slot="previous" />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>
          {(date) => (
            <Calendar.Cell date={date}>
              {({formattedDate}) => (
                <>
                  {formattedDate}
                  {(isToday(date, getLocalTimeZone()) || datesWithEvents.includes(date.day)) && (
                    <Calendar.CellIndicator />
                  )}
                </>
              )}
            </Calendar.Cell>
          )}
        </Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  );
}

```

### Multiple Months

Render multiple grids with `visibleDuration` and `offset` for booking and planning experiences.

```tsx
"use client";

import {Calendar} from "@heroui/react";
import {getLocalTimeZone} from "@internationalized/date";
import React from "react";
import {CalendarStateContext, useLocale} from "react-aria-components";

function CalendarMonthHeading({offset = 0}: {offset?: number}) {
  const state = React.useContext(CalendarStateContext)!;
  const {locale} = useLocale();

  const startDate = state.visibleRange.start;
  const monthDate = startDate.add({months: offset});
  const dateObj = monthDate.toDate(getLocalTimeZone());
  const monthYear = new Intl.DateTimeFormat(locale, {month: "long", year: "numeric"}).format(
    dateObj,
  );

  return <span className="text-sm font-medium">{monthYear}</span>;
}

export function MultipleMonths() {
  return (
    <Calendar
      aria-label="Trip dates"
      className="@container-normal w-auto overflow-x-auto"
      visibleDuration={{months: 2}}
    >
      <Calendar.Heading className="sr-only" />
      <div className="flex w-max gap-8">
        <div className="w-64">
          <Calendar.Header>
            <Calendar.NavButton slot="previous" />
            <CalendarMonthHeading offset={0} />
            <div className="size-6" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </div>
        <div className="w-64">
          <Calendar.Header>
            <div className="size-6" />
            <CalendarMonthHeading offset={1} />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid offset={{months: 1}}>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </div>
      </div>
    </Calendar>
  );
}

```

### International Calendars

By default, Calendar displays dates using the calendar system for the user's locale. You can override this by wrapping your Calendar with `I18nProvider` and setting the [Unicode calendar locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar#adding_a_calendar_in_the_locale_string).

The example below shows the Indian calendar system:

```tsx
"use client";

import {Calendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {I18nProvider} from "react-aria-components";

export function InternationalCalendar() {
  return (
    <I18nProvider locale="hi-IN-u-ca-indian">
      <Calendar aria-label="Event date" defaultValue={today(getLocalTimeZone())}>
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
    </I18nProvider>
  );
}

```

**Note:** The `onChange` event always returns a date in the same calendar system as the `value` or `defaultValue` (Gregorian if no value is provided), regardless of the displayed locale. This ensures your application logic works consistently with a single calendar system while still displaying dates in the user's preferred format.

### Custom Navigation Icons

Pass children to `Calendar.NavButton` to replace the default chevron icons.

```tsx
"use client";

import {Calendar} from "@heroui/react";

export function CustomIcons() {
  return (
    <Calendar aria-label="Event date">
      <Calendar.Header>
        <Calendar.Heading />
        <Calendar.NavButton slot="previous">
          <svg height={24} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6l6 6z" fill="currentColor" />
          </svg>
        </Calendar.NavButton>
        <Calendar.NavButton slot="next">
          <svg height={24} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg">
            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6z" fill="currentColor" />
          </svg>
        </Calendar.NavButton>
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  );
}

```

### Real-World Example

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Button, Calendar} from "@heroui/react";
import {getLocalTimeZone, isWeekend, today} from "@internationalized/date";
import {useState} from "react";
import {useLocale} from "react-aria-components";

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<DateValue | null>(null);
  const {locale} = useLocale();

  const bookedDates = [5, 6, 12, 13, 14, 20];

  const isDateUnavailable = (date: DateValue) => {
    return isWeekend(date, locale) || bookedDates.includes(date.day);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Calendar
        aria-label="Booking date"
        isDateUnavailable={isDateUnavailable}
        minValue={today(getLocalTimeZone())}
        value={selectedDate}
        onChange={setSelectedDate}
      >
        <Calendar.Header>
          <Calendar.Heading />
          <Calendar.NavButton slot="previous" />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>
            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
          </Calendar.GridHeader>
          <Calendar.GridBody>
            {(date) => (
              <Calendar.Cell date={date}>
                {({formattedDate, isUnavailable}) => (
                  <>
                    {formattedDate}
                    {!isUnavailable &&
                      !isWeekend(date, locale) &&
                      bookedDates.includes(date.day) && <Calendar.CellIndicator />}
                  </>
                )}
              </Calendar.Cell>
            )}
          </Calendar.GridBody>
        </Calendar.Grid>
      </Calendar>

      <div className="flex flex-col gap-2 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-muted" /> Has bookings
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-default" /> Weekend/Unavailable
          </span>
        </div>
        {selectedDate ? (
          <Button size="sm" variant="primary">
            Book {selectedDate.toString()}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

```

### Custom Styles

```tsx
"use client";

import {Calendar} from "@heroui/react";

export function CustomStyles() {
  return (
    <Calendar aria-label="Custom styled calendar">
      <Calendar.Header>
        <Calendar.NavButton className="text-foreground" slot="previous" />
        <Calendar.YearPickerTrigger className="w-full justify-center">
          <Calendar.YearPickerTriggerHeading className="text-foreground" />
          <Calendar.YearPickerTriggerIndicator className="text-foreground" />
        </Calendar.YearPickerTrigger>
        <Calendar.NavButton className="text-foreground" slot="next" />
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
  );
}

```

## Related Components

* **RangeCalendar**: Interactive month grid for selecting date ranges
* **DateField**: Date input field with labels, descriptions, and validation
* **DatePicker**: Composable date picker with date field trigger and calendar popover

## Styling

### Passing Tailwind CSS classes

```tsx
import {Calendar} from '@heroui/react';

function CustomCalendar() {
  return (
    <Calendar aria-label="Custom calendar" className="w-72 rounded-2xl border border-border bg-surface p-3 shadow-sm">
      <Calendar.Header className="pb-3">
        <Calendar.Heading className="text-default" />
        <Calendar.NavButton slot="previous" className="text-default" />
        <Calendar.NavButton slot="next" className="text-default" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>
          {(date) => <Calendar.Cell date={date} />}
        </Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  );
}

```

### Customizing the component classes

```css
@layer components {
  .calendar {
    @apply w-72 rounded-2xl border border-border bg-surface p-3 shadow-sm;
  }

  .calendar__heading {
    @apply text-sm font-semibold text-default-700;
  }

  .calendar__cell[data-selected="true"] {
    @apply bg-accent text-accent-foreground;
  }
}

```

### CSS Classes

Calendar uses these classes in `packages/styles/components/calendar.css` and `packages/styles/components/calendar-year-picker.css`:

* `.calendar` - Root container.
* `.calendar__header` - Header row containing nav buttons and heading.
* `.calendar__heading` - Current month label.
* `.calendar__nav-button` - Previous/next navigation controls.
* `.calendar__grid` - Main day grid.
* `.calendar__grid-header` - Weekday header row wrapper.
* `.calendar__grid-body` - Date rows wrapper.
* `.calendar__header-cell` - Weekday header cell.
* `.calendar__cell` - Interactive day cell.
* `.calendar__cell-indicator` - Dot indicator inside a day cell.
* `.calendar-year-picker__trigger` - Year picker toggle button.
* `.calendar-year-picker__trigger-heading` - Heading text inside year picker trigger.
* `.calendar-year-picker__trigger-indicator` - Indicator icon inside year picker trigger.
* `.calendar-year-picker__year-grid` - Overlay grid of selectable years.
* `.calendar-year-picker__year-cell` - Individual year option.

### Interactive States

Calendar supports both pseudo-classes and React Aria data attributes:

* **Selected**: `[data-selected="true"]`
* **Today**: `[data-today="true"]`
* **Unavailable**: `[data-unavailable="true"]`
* **Outside month**: `[data-outside-month="true"]`
* **Hovered**: `:hover` or `[data-hovered="true"]`
* **Pressed**: `:active` or `[data-pressed="true"]`
* **Focus visible**: `:focus-visible` or `[data-focus-visible="true"]`
* **Disabled**: `:disabled` or `[data-disabled="true"]`

## API Reference

### Calendar Props

Calendar inherits all props from React Aria [Calendar](https://react-spectrum.adobe.com/react-aria/Calendar.html).

| Prop                     | Type                           | Default                     | Description                                            |
| ------------------------ | ------------------------------ | --------------------------- | ------------------------------------------------------ |
| `value`                  | `DateValue \| null`            | -                           | Controlled selected date.                              |
| `defaultValue`           | `DateValue \| null`            | -                           | Initial selected date (uncontrolled).                  |
| `onChange`               | `(value: DateValue) => void`   | -                           | Called when selection changes.                         |
| `focusedValue`           | `DateValue`                    | -                           | Controlled focused date.                               |
| `onFocusChange`          | `(value: DateValue) => void`   | -                           | Called when focus moves to another date.               |
| `minValue`               | `DateValue`                    | Calendar-aware `1900-01-01` | Earliest selectable date.                              |
| `maxValue`               | `DateValue`                    | Calendar-aware `2099-12-31` | Latest selectable date.                                |
| `isDateUnavailable`      | `(date: DateValue) => boolean` | -                           | Marks dates as unavailable.                            |
| `isDisabled`             | `boolean`                      | `false`                     | Disables interaction and selection.                    |
| `isReadOnly`             | `boolean`                      | `false`                     | Keeps content readable but prevents selection changes. |
| `isInvalid`              | `boolean`                      | `false`                     | Marks the calendar as invalid for validation UI.       |
| `visibleDuration`        | `{months?: number}`            | `{months: 1}`               | Number of visible months.                              |
| `defaultYearPickerOpen`  | `boolean`                      | `false`                     | Initial open state of internal year picker.            |
| `isYearPickerOpen`       | `boolean`                      | -                           | Controlled year picker open state.                     |
| `onYearPickerOpenChange` | `(isOpen: boolean) => void`    | -                           | Called when year picker open state changes.            |

### Composition Parts

| Component                             | Description                                                                |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `Calendar.Header`                     | Header container for navigation and heading.                               |
| `Calendar.Heading`                    | Current month/year heading.                                                |
| `Calendar.NavButton`                  | Previous/next navigation control (`slot=\"previous\"` or `slot=\"next\"`). |
| `Calendar.Grid`                       | Day grid for one month (`offset` supported for multi-month layouts).       |
| `Calendar.GridHeader`                 | Weekday header container.                                                  |
| `Calendar.GridBody`                   | Date cell body container.                                                  |
| `Calendar.HeaderCell`                 | Weekday label cell.                                                        |
| `Calendar.Cell`                       | Individual date cell.                                                      |
| `Calendar.CellIndicator`              | Optional indicator element for custom metadata.                            |
| `Calendar.YearPickerTrigger`          | Trigger to toggle year-picker mode.                                        |
| `Calendar.YearPickerTriggerHeading`   | Localized heading content inside the year-picker trigger.                  |
| `Calendar.YearPickerTriggerIndicator` | Toggle icon inside the year-picker trigger.                                |
| `Calendar.YearPickerGrid`             | Overlay year selection grid container.                                     |
| `Calendar.YearPickerGridBody`         | Body renderer for year grid cells.                                         |
| `Calendar.YearPickerCell`             | Individual year option cell.                                               |

### Calendar.Cell Render Props

When `Calendar.Cell` children is a function, React Aria render props are available:

| Prop             | Type      | Description                                 |
| ---------------- | --------- | ------------------------------------------- |
| `formattedDate`  | `string`  | Localized day label for the cell.           |
| `isSelected`     | `boolean` | Whether the date is selected.               |
| `isUnavailable`  | `boolean` | Whether the date is unavailable.            |
| `isDisabled`     | `boolean` | Whether the cell is disabled.               |
| `isOutsideMonth` | `boolean` | Whether the date belongs to adjacent month. |

For a complete list of supported calendar systems and their identifiers, see:

* [React Aria Calendar Implementations](https://react-aria.adobe.com/internationalized/date/Calendar#implementations)
* [React Aria International Calendars](https://react-aria.adobe.com/Calendar#international-calendars)

### Related packages

* [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) — date types (`CalendarDate`, `CalendarDateTime`, `ZonedDateTime`) and utilities used by all date components
* [`I18nProvider`](https://react-aria.adobe.com/I18nProvider) — override locale for a subtree
* [`useLocale`](https://react-aria.adobe.com/useLocale) — read the current locale and layout direction
