# RangeCalendar

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/range-calendar
> Composable date range picker with month grid, navigation, and year picker support built on React Aria RangeCalendar


## Import

```tsx
import { RangeCalendar } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {RangeCalendar} from "@heroui/react";

export function Basic() {
  return (
    <RangeCalendar aria-label="Trip dates" firstDayOfWeek="mon">
      <RangeCalendar.Header>
        <RangeCalendar.Heading />
        <RangeCalendar.NavButton slot="previous" />
        <RangeCalendar.NavButton slot="next" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date) => <RangeCalendar.Cell date={date} />}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}

```

### Anatomy

```tsx
import {RangeCalendar} from '@heroui/react';

export default () => (
  <RangeCalendar aria-label="Trip dates">
    <RangeCalendar.Header>
      <RangeCalendar.Heading />
      <RangeCalendar.NavButton slot="previous" />
      <RangeCalendar.NavButton slot="next" />
    </RangeCalendar.Header>
    <RangeCalendar.Grid>
      <RangeCalendar.GridHeader>
        {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
      </RangeCalendar.GridHeader>
      <RangeCalendar.GridBody>
        {(date) => <RangeCalendar.Cell date={date} />}
      </RangeCalendar.GridBody>
    </RangeCalendar.Grid>
  </RangeCalendar>
)

```

### Year Picker

`RangeCalendar.YearPickerTrigger`, `RangeCalendar.YearPickerGrid`, and their body/cell subcomponents provide an integrated year navigation pattern.

```tsx
"use client";

import {RangeCalendar} from "@heroui/react";

export function YearPicker() {
  return (
    <RangeCalendar aria-label="Trip dates">
      <RangeCalendar.Header>
        <RangeCalendar.YearPickerTrigger>
          <RangeCalendar.YearPickerTriggerHeading />
          <RangeCalendar.YearPickerTriggerIndicator />
        </RangeCalendar.YearPickerTrigger>
        <RangeCalendar.NavButton slot="previous" />
        <RangeCalendar.NavButton slot="next" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date) => <RangeCalendar.Cell date={date} />}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
      <RangeCalendar.YearPickerGrid>
        <RangeCalendar.YearPickerGridBody>
          {({year}) => <RangeCalendar.YearPickerCell year={year} />}
        </RangeCalendar.YearPickerGridBody>
      </RangeCalendar.YearPickerGrid>
    </RangeCalendar>
  );
}

```

### Default Value

```tsx
"use client";

import {RangeCalendar} from "@heroui/react";
import {parseDate} from "@internationalized/date";

export function DefaultValue() {
  return (
    <RangeCalendar
      aria-label="Trip dates"
      defaultValue={{end: parseDate("2025-02-12"), start: parseDate("2025-02-03")}}
      firstDayOfWeek="mon"
    >
      <RangeCalendar.Header>
        <RangeCalendar.Heading />
        <RangeCalendar.NavButton slot="previous" />
        <RangeCalendar.NavButton slot="next" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date) => <RangeCalendar.Cell date={date} />}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}

```

### Controlled

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Button, ButtonGroup, Description, RangeCalendar} from "@heroui/react";
import {
  getLocalTimeZone,
  parseDate,
  startOfMonth,
  startOfWeek,
  today,
} from "@internationalized/date";
import {useState} from "react";
import {useLocale} from "react-aria-components";

type DateRange = {
  start: DateValue;
  end: DateValue;
};

export function Controlled() {
  const [value, setValue] = useState<DateRange | null>(null);
  const [focusedDate, setFocusedDate] = useState<DateValue>(parseDate("2025-12-25"));
  const {locale} = useLocale();

  return (
    <div className="flex flex-col items-center gap-4">
      <ButtonGroup variant="tertiary">
        <Button
          onPress={() => {
            const start = today(getLocalTimeZone());

            setFocusedDate(start);
          }}
        >
          This week
        </Button>
        <Button
          onPress={() => {
            const nextWeekStart = startOfWeek(today(getLocalTimeZone()).add({weeks: 1}), locale);

            setFocusedDate(nextWeekStart);
          }}
        >
          Next week
        </Button>
        <Button
          onPress={() => {
            const nextMonthStart = startOfMonth(today(getLocalTimeZone()).add({months: 1}));

            setFocusedDate(nextMonthStart);
          }}
        >
          Next month
        </Button>
      </ButtonGroup>

      <RangeCalendar
        aria-label="Trip dates"
        firstDayOfWeek="mon"
        focusedValue={focusedDate}
        value={value}
        onChange={setValue}
        onFocusChange={setFocusedDate}
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>

      <Description className="text-center">
        Selected range: {value ? `${value.start.toString()} -> ${value.end.toString()}` : "(none)"}
      </Description>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            const start = today(getLocalTimeZone());

            setValue({end: start.add({days: 6}), start});
            setFocusedDate(start);
          }}
        >
          Set 1 week
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            const start = parseDate("2025-12-20");

            setValue({end: parseDate("2025-12-31"), start});
            setFocusedDate(start);
          }}
        >
          Set Holidays
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

import {Description, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function MinMaxDates() {
  const now = today(getLocalTimeZone());
  const minDate = now;
  const maxDate = now.add({months: 3});

  return (
    <div className="flex flex-col items-center gap-4">
      <RangeCalendar aria-label="Trip dates" maxValue={maxDate} minValue={minDate}>
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
      <Description className="text-center">
        Select dates between today and {maxDate.toString()}
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

import {Description, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function UnavailableDates() {
  const now = today(getLocalTimeZone());
  const blockedRanges = [
    [now.add({days: 2}), now.add({days: 5})],
    [now.add({days: 12}), now.add({days: 13})],
  ] as const;

  const isDateUnavailable = (date: DateValue) => {
    return blockedRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <RangeCalendar
        aria-label="Trip dates"
        defaultValue={{end: now.add({days: 9}), start: now.add({days: 6})}}
        firstDayOfWeek="mon"
        isDateUnavailable={isDateUnavailable}
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
      <Description className="text-center">Some days are unavailable</Description>
    </div>
  );
}

```

### Allows Non-Contiguous Ranges

Enable `allowsNonContiguousRanges` to allow selection across unavailable dates.

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Description, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function AllowsNonContiguousRanges() {
  const now = today(getLocalTimeZone());
  const blockedRanges = [
    [now.add({days: 2}), now.add({days: 5})],
    [now.add({days: 12}), now.add({days: 13})],
  ] as const;

  const isDateUnavailable = (date: DateValue) => {
    return blockedRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <RangeCalendar
        allowsNonContiguousRanges
        aria-label="Trip dates"
        defaultValue={{end: now.add({days: 9}), start: now.add({days: 1})}}
        firstDayOfWeek="mon"
        isDateUnavailable={isDateUnavailable}
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
      <Description className="text-center">
        Non-contiguous ranges are allowed across unavailable dates
      </Description>
    </div>
  );
}

```

### Disabled

```tsx
"use client";

import {Description, RangeCalendar} from "@heroui/react";

export function Disabled() {
  return (
    <div className="flex flex-col items-center gap-4">
      <RangeCalendar isDisabled aria-label="Trip dates">
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
      <Description className="text-center">Range calendar is disabled</Description>
    </div>
  );
}

```

### Read Only

```tsx
"use client";

import {Description, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function ReadOnly() {
  return (
    <div className="flex flex-col items-center gap-4">
      <RangeCalendar
        isReadOnly
        aria-label="Trip dates"
        defaultValue={{
          end: today(getLocalTimeZone()).add({days: 4}),
          start: today(getLocalTimeZone()),
        }}
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
      <Description className="text-center">Range calendar is read-only</Description>
    </div>
  );
}

```

### Invalid

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Description, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

type DateRange = {
  start: DateValue;
  end: DateValue;
};

export function Invalid() {
  const now = today(getLocalTimeZone());
  const [value, setValue] = useState<DateRange>({
    end: now.add({days: 14}),
    start: now.add({days: 6}),
  });
  const isInvalid = value.end.compare(value.start) > 7;

  return (
    <div className="flex flex-col items-center gap-4">
      <RangeCalendar
        aria-label="Trip dates"
        firstDayOfWeek="mon"
        isInvalid={isInvalid}
        value={value}
        onChange={setValue}
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
      {isInvalid ? (
        <p className="text-sm text-danger">Maximum stay duration is 1 week</p>
      ) : (
        <Description className="text-center">Select a stay of up to 7 days</Description>
      )}
    </div>
  );
}

```

### Focused Value

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Button, Description, RangeCalendar} from "@heroui/react";
import {parseDate} from "@internationalized/date";
import {useState} from "react";

export function FocusedValue() {
  const [focusedDate, setFocusedDate] = useState<DateValue>(parseDate("2025-06-15"));

  return (
    <div className="flex flex-col items-center gap-4">
      <RangeCalendar
        aria-label="Trip dates"
        firstDayOfWeek="mon"
        focusedValue={focusedDate}
        onFocusChange={setFocusedDate}
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
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

You can customize `RangeCalendar.Cell` children and use `RangeCalendar.CellIndicator` to display metadata like events.

```tsx
"use client";

import {RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, isToday} from "@internationalized/date";

const datesWithEvents = [3, 7, 12, 15, 21, 28];

export function WithIndicators() {
  return (
    <RangeCalendar aria-label="Trip dates">
      <RangeCalendar.Header>
        <RangeCalendar.Heading />
        <RangeCalendar.NavButton slot="previous" />
        <RangeCalendar.NavButton slot="next" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date) => (
            <RangeCalendar.Cell date={date}>
              {({formattedDate}) => (
                <>
                  {formattedDate}
                  {(isToday(date, getLocalTimeZone()) || datesWithEvents.includes(date.day)) && (
                    <RangeCalendar.CellIndicator />
                  )}
                </>
              )}
            </RangeCalendar.Cell>
          )}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}

```

### Multiple Months

Render multiple grids with `visibleDuration` and `offset` for booking and planning experiences.

```tsx
"use client";

import {RangeCalendar} from "@heroui/react";
import {getLocalTimeZone} from "@internationalized/date";
import React from "react";
import {RangeCalendarStateContext, useLocale} from "react-aria-components";

function RangeCalendarMonthHeading({offset = 0}: {offset?: number}) {
  const state = React.useContext(RangeCalendarStateContext)!;
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
    <RangeCalendar
      aria-label="Trip dates"
      className="@container-normal w-auto overflow-x-auto"
      visibleDuration={{months: 2}}
    >
      <RangeCalendar.Heading className="sr-only" />
      <div className="flex w-max gap-8">
        <div className="w-64">
          <RangeCalendar.Header>
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendarMonthHeading offset={0} />
            <div className="size-6" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => <RangeCalendar.Cell date={date} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </div>
        <div className="w-64">
          <RangeCalendar.Header>
            <div className="size-6" />
            <RangeCalendarMonthHeading offset={1} />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid offset={{months: 1}}>
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => <RangeCalendar.Cell date={date} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </div>
      </div>
    </RangeCalendar>
  );
}

```

### International Calendars

By default, RangeCalendar displays dates using the calendar system for the user's locale. You can override this by wrapping your RangeCalendar with `I18nProvider` and setting the [Unicode calendar locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar#adding_a_calendar_in_the_locale_string).

The example below shows the Indian calendar system:

```tsx
"use client";

import {RangeCalendar} from "@heroui/react";
import {I18nProvider} from "react-aria-components";

export function InternationalCalendar() {
  return (
    <I18nProvider locale="hi-IN-u-ca-indian">
      <RangeCalendar aria-label="Trip dates">
        <RangeCalendar.Header>
          <RangeCalendar.YearPickerTrigger>
            <RangeCalendar.YearPickerTriggerHeading />
            <RangeCalendar.YearPickerTriggerIndicator />
          </RangeCalendar.YearPickerTrigger>
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => <RangeCalendar.Cell date={date} />}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
        <RangeCalendar.YearPickerGrid>
          <RangeCalendar.YearPickerGridBody>
            {({year}) => <RangeCalendar.YearPickerCell year={year} />}
          </RangeCalendar.YearPickerGridBody>
        </RangeCalendar.YearPickerGrid>
      </RangeCalendar>
    </I18nProvider>
  );
}

```

**Note:** The `onChange` event always returns a date in the same calendar system as the `value` or `defaultValue` (Gregorian if no value is provided), regardless of the displayed locale.

### Real-World Example

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Button, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, isWeekend, today} from "@internationalized/date";
import {useState} from "react";
import {useLocale} from "react-aria-components";

type DateRange = {
  start: DateValue;
  end: DateValue;
};

export function BookingCalendar() {
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(null);
  const {locale} = useLocale();
  const blockedDates = [5, 6, 12, 13, 14, 20];

  const isDateUnavailable = (date: DateValue) => {
    return isWeekend(date, locale) || blockedDates.includes(date.day);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <RangeCalendar
        aria-label="Booking range"
        isDateUnavailable={isDateUnavailable}
        minValue={today(getLocalTimeZone())}
        value={selectedRange}
        onChange={setSelectedRange}
      >
        <RangeCalendar.Header>
          <RangeCalendar.Heading />
          <RangeCalendar.NavButton slot="previous" />
          <RangeCalendar.NavButton slot="next" />
        </RangeCalendar.Header>
        <RangeCalendar.Grid>
          <RangeCalendar.GridHeader>
            {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
          </RangeCalendar.GridHeader>
          <RangeCalendar.GridBody>
            {(date) => (
              <RangeCalendar.Cell date={date}>
                {({formattedDate, isUnavailable}) => (
                  <>
                    {formattedDate}
                    {!isUnavailable &&
                      !isWeekend(date, locale) &&
                      blockedDates.includes(date.day) && <RangeCalendar.CellIndicator />}
                  </>
                )}
              </RangeCalendar.Cell>
            )}
          </RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
      <div className="flex flex-col gap-2 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-muted" /> Blocked dates
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-default" /> Weekend/Unavailable
          </span>
        </div>
        {selectedRange ? (
          <Button size="sm" variant="primary">
            Book {selectedRange.start.toString()} -&gt; {selectedRange.end.toString()}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

```

## Related Components

* **Calendar**: Interactive month grid for selecting dates
* **DateField**: Date input field with labels, descriptions, and validation
* **DatePicker**: Composable date picker with date field trigger and calendar popover

## Styling

### Passing Tailwind CSS classes

```tsx
import {RangeCalendar} from '@heroui/react';

function CustomRangeCalendar() {
  return (
    <RangeCalendar aria-label="Trip dates" className="w-80 rounded-2xl border border-border bg-surface p-3 shadow-sm">
      <RangeCalendar.Header className="pb-3">
        <RangeCalendar.Heading className="text-default" />
        <RangeCalendar.NavButton slot="previous" className="text-default" />
        <RangeCalendar.NavButton slot="next" className="text-default" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date) => <RangeCalendar.Cell date={date} />}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}

```

### Customizing the component classes

```css
@layer components {
  .range-calendar {
    @apply w-80 rounded-2xl border border-border bg-surface p-3 shadow-sm;
  }

  .range-calendar__heading {
    @apply text-sm font-semibold text-default;
  }

  .range-calendar__cell[data-selected="true"] .range-calendar__cell-button {
    @apply bg-accent text-accent-foreground;
  }
}

```

### CSS Classes

RangeCalendar uses these classes in `packages/styles/components/range-calendar.css` and `packages/styles/components/calendar-year-picker.css`:

* `.range-calendar` - Root container.
* `.range-calendar__header` - Header row containing nav buttons and heading.
* `.range-calendar__heading` - Current month label.
* `.range-calendar__nav-button` - Previous/next navigation controls.
* `.range-calendar__grid` - Main day grid.
* `.range-calendar__grid-header` - Weekday header row wrapper.
* `.range-calendar__grid-body` - Date rows wrapper.
* `.range-calendar__header-cell` - Weekday header cell.
* `.range-calendar__cell` - Interactive day cell wrapper.
* `.range-calendar__cell-button` - Interactive day button inside each cell.
* `.range-calendar__cell-indicator` - Dot indicator inside a day cell.
* `.calendar-year-picker__trigger` - Year picker toggle button.
* `.calendar-year-picker__trigger-heading` - Heading text inside year picker trigger.
* `.calendar-year-picker__trigger-indicator` - Indicator icon inside year picker trigger.
* `.calendar-year-picker__year-grid` - Overlay grid of selectable years.
* `.calendar-year-picker__year-cell` - Individual year option.

### Interactive States

RangeCalendar supports both pseudo-classes and React Aria data attributes:

* **Selected**: `[data-selected="true"]`
* **Selection start**: `[data-selection-start="true"]`
* **Selection end**: `[data-selection-end="true"]`
* **Range middle**: `[data-selection-in-range="true"]`
* **Today**: `[data-today="true"]`
* **Unavailable**: `[data-unavailable="true"]`
* **Outside month**: `[data-outside-month="true"]`
* **Hovered**: `:hover` or `[data-hovered="true"]`
* **Pressed**: `:active` or `[data-pressed="true"]`
* **Focus visible**: `:focus-visible` or `[data-focus-visible="true"]`
* **Disabled**: `:disabled` or `[data-disabled="true"]`

## API Reference

### RangeCalendar Props

RangeCalendar inherits all props from React Aria [RangeCalendar](https://react-spectrum.adobe.com/react-aria/RangeCalendar.html).

| Prop                        | Type                                     | Default                     | Description                                            |
| --------------------------- | ---------------------------------------- | --------------------------- | ------------------------------------------------------ |
| `value`                     | `RangeValue<DateValue> \| null`          | -                           | Controlled selected range.                             |
| `defaultValue`              | `RangeValue<DateValue> \| null`          | -                           | Initial selected range (uncontrolled).                 |
| `onChange`                  | `(value: RangeValue<DateValue>) => void` | -                           | Called when selection changes.                         |
| `focusedValue`              | `DateValue`                              | -                           | Controlled focused date.                               |
| `onFocusChange`             | `(value: DateValue) => void`             | -                           | Called when focus moves to another date.               |
| `minValue`                  | `DateValue`                              | Calendar-aware `1900-01-01` | Earliest selectable date.                              |
| `maxValue`                  | `DateValue`                              | Calendar-aware `2099-12-31` | Latest selectable date.                                |
| `isDateUnavailable`         | `(date: DateValue) => boolean`           | -                           | Marks dates as unavailable.                            |
| `allowsNonContiguousRanges` | `boolean`                                | `false`                     | Allows ranges that span unavailable dates.             |
| `isDisabled`                | `boolean`                                | `false`                     | Disables interaction and selection.                    |
| `isReadOnly`                | `boolean`                                | `false`                     | Keeps content readable but prevents selection changes. |
| `isInvalid`                 | `boolean`                                | `false`                     | Marks the calendar as invalid for validation UI.       |
| `visibleDuration`           | `{months?: number}`                      | `{months: 1}`               | Number of visible months.                              |
| `defaultYearPickerOpen`     | `boolean`                                | `false`                     | Initial open state of internal year picker.            |
| `isYearPickerOpen`          | `boolean`                                | -                           | Controlled year picker open state.                     |
| `onYearPickerOpenChange`    | `(isOpen: boolean) => void`              | -                           | Called when year picker open state changes.            |

### Composition Parts

| Component                                  | Description                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `RangeCalendar.Header`                     | Header container for navigation and heading.                           |
| `RangeCalendar.Heading`                    | Current month/year heading.                                            |
| `RangeCalendar.NavButton`                  | Previous/next navigation control (`slot="previous"` or `slot="next"`). |
| `RangeCalendar.Grid`                       | Day grid for one month (`offset` supported for multi-month layouts).   |
| `RangeCalendar.GridHeader`                 | Weekday header container.                                              |
| `RangeCalendar.GridBody`                   | Date cell body container.                                              |
| `RangeCalendar.HeaderCell`                 | Weekday label cell.                                                    |
| `RangeCalendar.Cell`                       | Individual date cell.                                                  |
| `RangeCalendar.CellIndicator`              | Optional indicator element for custom metadata.                        |
| `RangeCalendar.YearPickerTrigger`          | Trigger to toggle year-picker mode.                                    |
| `RangeCalendar.YearPickerTriggerHeading`   | Localized heading content inside the year-picker trigger.              |
| `RangeCalendar.YearPickerTriggerIndicator` | Toggle icon inside the year-picker trigger.                            |
| `RangeCalendar.YearPickerGrid`             | Overlay year selection grid container.                                 |
| `RangeCalendar.YearPickerGridBody`         | Body renderer for year grid cells.                                     |
| `RangeCalendar.YearPickerCell`             | Individual year option cell.                                           |

### RangeCalendar.Cell Render Props

When `RangeCalendar.Cell` children is a function, React Aria render props are available:

| Prop               | Type      | Description                                          |
| ------------------ | --------- | ---------------------------------------------------- |
| `formattedDate`    | `string`  | Localized day label for the cell.                    |
| `isSelected`       | `boolean` | Whether the date is selected.                        |
| `isSelectionStart` | `boolean` | Whether the date is the start of the selected range. |
| `isSelectionEnd`   | `boolean` | Whether the date is the end of the selected range.   |
| `isUnavailable`    | `boolean` | Whether the date is unavailable.                     |
| `isDisabled`       | `boolean` | Whether the cell is disabled.                        |
| `isOutsideMonth`   | `boolean` | Whether the date belongs to adjacent month.          |

For a complete list of supported calendar systems and their identifiers, see:

* [React Aria Calendar Implementations](https://react-aria.adobe.com/internationalized/date/Calendar#implementations)
* [React Aria International Calendars](https://react-aria.adobe.com/Calendar#international-calendars)

### Related packages

* [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) — date types (`CalendarDate`, `CalendarDateTime`, `ZonedDateTime`) and utilities used by all date components
* [`I18nProvider`](https://react-aria.adobe.com/I18nProvider) — override locale for a subtree
* [`useLocale`](https://react-aria.adobe.com/useLocale) — read the current locale and layout direction
