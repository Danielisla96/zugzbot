# DateRangePicker

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/date-range-picker
> Composable date range picker built on React Aria DateRangePicker with DateField and RangeCalendar composition


## Import

```tsx
import { DateField, DateRangePicker, Label, RangeCalendar } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {DateField, DateRangePicker, Label, RangeCalendar} from "@heroui/react";

export function Basic() {
  return (
    <DateRangePicker className="w-72" endName="endDate" startName="startDate">
      <Label>Trip dates</Label>
      <DateField.Group fullWidth>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger>
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DateRangePicker.Popover>
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
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}

```

### Anatomy

`DateRangePicker` follows a composition-first API. Compose `DateField` and `RangeCalendar` explicitly to control structure and styling.

```tsx
import {DateField, DateRangePicker, Label, RangeCalendar} from '@heroui/react';

export default () => (
  <DateRangePicker>
    <Label />
    <DateField.Group>
      <DateField.InputContainer>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
      </DateField.InputContainer>
      <DateField.Suffix>
        <DateRangePicker.Trigger>
          <DateRangePicker.TriggerIndicator />
        </DateRangePicker.Trigger>
      </DateField.Suffix>
    </DateField.Group>
    <DateRangePicker.Popover>
      <RangeCalendar aria-label="Choose trip dates">
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
          <RangeCalendar.GridBody>{(date) => <RangeCalendar.Cell date={date} />}</RangeCalendar.GridBody>
        </RangeCalendar.Grid>
      </RangeCalendar>
    </DateRangePicker.Popover>
  </DateRangePicker>
)

```

### Controlled

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {Button, DateField, DateRangePicker, Description, Label, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

type DateRange = {
  start: DateValue;
  end: DateValue;
};

export function Controlled() {
  const start = today(getLocalTimeZone());
  const [value, setValue] = useState<DateRange | null>({end: start.add({days: 4}), start});

  return (
    <div className="flex w-72 flex-col gap-4">
      <DateRangePicker endName="endDate" startName="startDate" value={value} onChange={setValue}>
        <Label>Trip dates</Label>
        <DateField.Group fullWidth>
          <DateField.Input slot="start">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateRangePicker.RangeSeparator />
          <DateField.Input slot="end">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DateRangePicker.Trigger>
              <DateRangePicker.TriggerIndicator />
            </DateRangePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DateRangePicker.Popover>
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
        </DateRangePicker.Popover>
      </DateRangePicker>
      <Description>
        Current value: {value ? `${value.start.toString()} -> ${value.end.toString()}` : "(empty)"}
      </Description>
      <div className="flex gap-2">
        <Button
          variant="tertiary"
          onPress={() => {
            const nextStart = today(getLocalTimeZone());

            setValue({end: nextStart.add({days: 6}), start: nextStart});
          }}
        >
          Set week
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

import {DateField, DateRangePicker, FieldError, Label, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

type DateRange = {
  start: DateValue;
  end: DateValue;
};

export function WithValidation() {
  const [value, setValue] = useState<DateRange | null>(null);
  const currentDate = today(getLocalTimeZone());
  const isInvalid =
    value != null && (value.start.compare(currentDate) < 0 || value.end.compare(value.start) < 0);

  return (
    <DateRangePicker
      isRequired
      className="w-72"
      endName="endDate"
      isInvalid={isInvalid}
      minValue={currentDate}
      startName="startDate"
      value={value}
      onChange={setValue}
    >
      <Label>Booking period</Label>
      <DateField.Group fullWidth>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger>
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <FieldError>Select a valid range starting today or later.</FieldError>
      <DateRangePicker.Popover>
        <RangeCalendar aria-label="Booking period">
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
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}

```

### Format Options

Control how DateRangePicker values are displayed with props such as `granularity`, `hourCycle`, `hideTimeZone`, and `shouldForceLeadingZeros`.

```tsx
"use client";

import type {TimeValue} from "@heroui/react";
import type {DateValue} from "@internationalized/date";

import {
  DateField,
  DateRangePicker,
  Label,
  ListBox,
  RangeCalendar,
  Select,
  Separator,
  Switch,
  TimeField,
  useLocale,
} from "@heroui/react";
import {
  DateFormatter,
  getLocalTimeZone,
  parseDate,
  parseZonedDateTime,
} from "@internationalized/date";
import {useMemo, useState} from "react";

type Granularity = "day" | "hour" | "minute" | "second";
type HourCycle = 12 | 24;
type DateRange = {
  start: DateValue;
  end: DateValue;
};

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
  const {locale} = useLocale();
  const dateFormatter = new DateFormatter(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formatDate = (date: DateRange) => {
    const localTimeZone = getLocalTimeZone();
    const start = date.start.toDate(localTimeZone);
    const end = date.end.toDate(localTimeZone);

    return dateFormatter.formatRange(start, end);
  };

  const defaultValue = useMemo<DateRange>(() => {
    const localTimeZone = getLocalTimeZone();

    if (granularity === "day") {
      return {
        end: parseDate("2025-02-10"),
        start: parseDate("2025-02-03"),
      };
    }

    return {
      end: parseZonedDateTime(`2026-02-10T18:45:00[${localTimeZone}]`),
      start: parseZonedDateTime(`2026-02-03T08:45:00[${localTimeZone}]`),
    };
  }, [granularity]);

  const timeGranularity = granularity !== "day" ? granularity : undefined;
  const showTimeField = !!timeGranularity;

  return (
    <div className="flex w-full flex-col gap-4">
      <DateRangePicker
        key={granularity}
        className="w-max min-w-72"
        defaultValue={defaultValue}
        endName="endDate"
        granularity={granularity}
        hideTimeZone={hideTimeZone}
        hourCycle={hourCycle}
        shouldForceLeadingZeros={shouldForceLeadingZeros}
        startName="startDate"
      >
        {({state}) => (
          <>
            <Label>Date range</Label>
            <DateField.Group>
              <DateField.InputContainer>
                <DateField.Input slot="start">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateRangePicker.RangeSeparator />
                <DateField.Input slot="end">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.InputContainer>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover className="flex w-full max-w-63 flex-col gap-3">
              <RangeCalendar aria-label="Trip dates" className="w-full">
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
              {!!showTimeField && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label>Start Time</Label>
                    <TimeField
                      aria-label="Start Time"
                      granularity={timeGranularity}
                      hideTimeZone={hideTimeZone}
                      hourCycle={hourCycle}
                      name="startTime"
                      shouldForceLeadingZeros={shouldForceLeadingZeros}
                      value={state.timeRange?.start ?? null}
                      onChange={(v) =>
                        state.setTimeRange({
                          end: state.timeRange?.end as TimeValue,
                          start: v as TimeValue,
                        })
                      }
                    >
                      <TimeField.Group variant="secondary">
                        <TimeField.Input>
                          {(segment) => <TimeField.Segment segment={segment} />}
                        </TimeField.Input>
                      </TimeField.Group>
                    </TimeField>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>End Time</Label>
                    <TimeField
                      aria-label="End Time"
                      granularity={timeGranularity}
                      hideTimeZone={hideTimeZone}
                      hourCycle={hourCycle}
                      name="endTime"
                      shouldForceLeadingZeros={shouldForceLeadingZeros}
                      value={state.timeRange?.end ?? null}
                      onChange={(v) =>
                        state.setTimeRange({
                          end: v as TimeValue,
                          start: state.timeRange?.start as TimeValue,
                        })
                      }
                    >
                      <TimeField.Group variant="secondary">
                        <TimeField.Input>
                          {(segment) => <TimeField.Segment segment={segment} />}
                        </TimeField.Input>
                      </TimeField.Group>
                    </TimeField>
                  </div>
                </div>
              )}
              <span className="mt-1 text-xs text-muted">
                Selected:{" "}
                {state.value && state.value.start && state.value.end
                  ? formatDate({end: state.value.end, start: state.value.start})
                  : "No date selected"}
              </span>
            </DateRangePicker.Popover>
          </>
        )}
      </DateRangePicker>

      <Separator className="my-5" />

      <Label className="text-xs font-medium text-muted">Format Options</Label>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <Select
            className="w-[120px]"
            name="granularity"
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

      <div className="flex min-w-[529px] flex-col gap-2">
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

import {DateField, DateRangePicker, Description, Label, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";

export function Disabled() {
  const start = today(getLocalTimeZone());

  return (
    <DateRangePicker
      isDisabled
      className="w-72"
      endName="endDate"
      startName="startDate"
      value={{end: start.add({days: 4}), start}}
    >
      <Label>Trip dates</Label>
      <DateField.Group fullWidth>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger>
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <Description>This date range picker is disabled.</Description>
      <DateRangePicker.Popover>
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
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}

```

### Custom Indicator

`DateRangePicker.TriggerIndicator` renders the default `IconCalendar` when no children are provided. Pass children to replace it.

```tsx
"use client";

import {DateField, DateRangePicker, Description, Label, RangeCalendar} from "@heroui/react";
import {Icon} from "@iconify/react";

export function WithCustomIndicator() {
  return (
    <DateRangePicker className="w-72" endName="endDate" startName="startDate">
      <Label>Trip dates</Label>
      <DateField.Group fullWidth>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger>
            <DateRangePicker.TriggerIndicator>
              <Icon className="size-4" icon="gravity-ui:chevron-down" />
            </DateRangePicker.TriggerIndicator>
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <Description>Replace the default calendar icon by passing custom children.</Description>
      <DateRangePicker.Popover>
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
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}

```

### Form Example

```tsx
"use client";

import type {DateValue} from "@internationalized/date";

import {
  Button,
  DateField,
  DateRangePicker,
  Description,
  FieldError,
  Form,
  Label,
  RangeCalendar,
} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {useState} from "react";

type DateRange = {
  start: DateValue;
  end: DateValue;
};

export function FormExample() {
  const [value, setValue] = useState<DateRange | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentDate = today(getLocalTimeZone());
  const isInvalid =
    value != null && (value.start.compare(currentDate) < 0 || value.end.compare(value.start) < 0);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!value || isInvalid) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setValue(null);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <Form className="flex w-72 flex-col gap-3" onSubmit={handleSubmit}>
      <DateRangePicker
        isRequired
        endName="tripEndDate"
        isInvalid={isInvalid}
        minValue={currentDate}
        startName="tripStartDate"
        value={value}
        onChange={setValue}
      >
        <Label>Trip dates</Label>
        <DateField.Group fullWidth>
          <DateField.Input slot="start">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateRangePicker.RangeSeparator />
          <DateField.Input slot="end">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DateRangePicker.Trigger>
              <DateRangePicker.TriggerIndicator />
            </DateRangePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        {isInvalid ? (
          <FieldError>Please choose a valid range in the future.</FieldError>
        ) : (
          <Description>Select your check-in and check-out dates.</Description>
        )}
        <DateRangePicker.Popover>
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
        </DateRangePicker.Popover>
      </DateRangePicker>
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

By default, DateRangePicker displays dates using the calendar system for the user's locale. You can override this by wrapping your DateRangePicker with `I18nProvider` and setting the [Unicode calendar locale extension](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/calendar#adding_a_calendar_in_the_locale_string).

The example below shows the Indian calendar system:

```tsx
"use client";

import {DateField, DateRangePicker, Label, RangeCalendar} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {I18nProvider} from "react-aria-components";

export function InternationalCalendar() {
  const start = today(getLocalTimeZone());

  return (
    <I18nProvider locale="hi-IN-u-ca-indian">
      <DateRangePicker
        className="w-72"
        defaultValue={{end: start.add({days: 7}), start}}
        endName="endDate"
        startName="startDate"
      >
        <Label>Trip dates</Label>
        <DateField.Group fullWidth>
          <DateField.Input slot="start">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateRangePicker.RangeSeparator />
          <DateField.Input slot="end">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DateRangePicker.Trigger>
              <DateRangePicker.TriggerIndicator />
            </DateRangePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <DateRangePicker.Popover>
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
        </DateRangePicker.Popover>
      </DateRangePicker>
    </I18nProvider>
  );
}

```

**Note:** The `onChange` event always returns dates in the same calendar system as the `value` or `defaultValue` (Gregorian if no value is provided), regardless of the displayed locale.

For a complete list of supported calendar systems and their identifiers, see:

* [React Aria Calendar Implementations](https://react-aria.adobe.com/internationalized/date/Calendar#implementations)
* [React Aria International Calendars](https://react-aria.adobe.com/Calendar#international-calendars)

### Custom Render Function

```tsx
"use client";

import {DateField, DateRangePicker, Label, RangeCalendar} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <DateRangePicker
      className="w-72"
      endName="endDate"
      render={(props) => <div data-custom="foo" {...props} />}
      startName="startDate"
    >
      <Label>Trip dates</Label>
      <DateField.Group fullWidth>
        <DateField.Input slot="start">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">
          {(segment) => <DateField.Segment segment={segment} />}
        </DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger>
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DateRangePicker.Popover>
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
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}

```

## Related Components

* **RangeCalendar**: Interactive month grid for selecting date ranges
* **Calendar**: Interactive month grid for selecting dates
* **DateField**: Date input field with labels, descriptions, and validation

## Styling

### Passing Tailwind CSS classes

You can style each composition part independently:

```tsx
import {DateField, DateRangePicker, Label, RangeCalendar} from '@heroui/react';

function CustomDateRangePicker() {
  return (
    <DateRangePicker className="w-[360px] gap-2">
      <Label className="text-sm font-semibold">Trip dates</Label>
      <DateField.Group className="rounded-xl border border-border/60 bg-surface" fullWidth variant="secondary">
        <DateField.InputContainer>
          <DateField.Input slot="start">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateRangePicker.RangeSeparator className="px-2 text-default" />
          <DateField.Input slot="end">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
        </DateField.InputContainer>
        <DateField.Suffix>
          <DateRangePicker.Trigger className="w-full">
            <DateRangePicker.TriggerIndicator className="text-default" />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DateRangePicker.Popover className="rounded-xl p-2">
        <RangeCalendar aria-label="Custom range picker calendar">
          {/* RangeCalendar parts */}
        </RangeCalendar>
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}

```

### Customizing the component classes

To customize DateRangePicker base classes, use `@layer components`.

```css
@layer components {
  .date-range-picker {
    @apply inline-flex flex-col gap-1;
  }

  .date-range-picker__trigger {
    @apply inline-flex items-center justify-between;
  }

  .date-range-picker__trigger-indicator {
    @apply text-muted;
  }

  .date-range-picker__range-separator {
    @apply px-2 text-default;
  }

  .date-range-picker__popover {
    @apply min-w-[var(--trigger-width)] p-0;
  }
}

```

HeroUI follows [BEM](https://getbem.com/) naming for reusable customization.

### CSS Classes

DateRangePicker uses these classes in `packages/styles/components/date-range-picker.css`:

* `.date-range-picker` - Root wrapper.
* `.date-range-picker__trigger` - Trigger part that opens the popover.
* `.date-range-picker__trigger-indicator` - Default/custom indicator slot.
* `.date-range-picker__range-separator` - Separator between start and end date inputs.
* `.date-range-picker__popover` - Popover content wrapper.

### Interactive States

DateRangePicker supports React Aria data attributes and pseudo states:

* **Open**: `[data-open="true"]` on trigger.
* **Disabled**: `[data-disabled="true"]` or `[aria-disabled="true"]` on trigger.
* **Focus visible**: `:focus-visible` or `[data-focus-visible="true"]` on trigger.
* **Hover**: `:hover` or `[data-hovered="true"]` on trigger.

## API Reference

### DateRangePicker Props

DateRangePicker inherits all props from React Aria [DateRangePicker](https://react-aria.adobe.com/DateRangePicker).

| Prop           | Type                                                                               | Default | Description                                                      |
| -------------- | ---------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `value`        | `{ start: DateValue; end: DateValue } \| null`                                     | -       | Controlled selected date range value.                            |
| `defaultValue` | `{ start: DateValue; end: DateValue } \| null`                                     | -       | Default selected range in uncontrolled mode.                     |
| `onChange`     | `(value: { start: DateValue; end: DateValue } \| null) => void`                    | -       | Called when selected range changes.                              |
| `isOpen`       | `boolean`                                                                          | -       | Controlled popover open state.                                   |
| `defaultOpen`  | `boolean`                                                                          | `false` | Initial popover open state.                                      |
| `onOpenChange` | `(isOpen: boolean) => void`                                                        | -       | Called when popover open state changes.                          |
| `isDisabled`   | `boolean`                                                                          | `false` | Disables range selection and trigger interactions.               |
| `isInvalid`    | `boolean`                                                                          | -       | Marks the field as invalid for validation state.                 |
| `minValue`     | `DateValue`                                                                        | -       | Minimum selectable date.                                         |
| `maxValue`     | `DateValue`                                                                        | -       | Maximum selectable date.                                         |
| `startName`    | `string`                                                                           | -       | Name used for the start date in HTML form submission.            |
| `endName`      | `string`                                                                           | -       | Name used for the end date in HTML form submission.              |
| `children`     | `ReactNode \| (values: DateRangePickerRenderProps) => ReactNode`                   | -       | Composed content or render function.                             |
| `render`       | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, DateRangePickerRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### Composition Parts

| Component                          | Description                                                 |
| ---------------------------------- | ----------------------------------------------------------- |
| `DateRangePicker.Root`             | Root date range picker container and state owner.           |
| `DateRangePicker.Trigger`          | Trigger button, usually rendered inside `DateField.Suffix`. |
| `DateRangePicker.TriggerIndicator` | Indicator slot with default calendar icon.                  |
| `DateRangePicker.RangeSeparator`   | Separator part between start and end date inputs.           |
| `DateRangePicker.Popover`          | Popover wrapper for `RangeCalendar` content.                |

### Related packages

* [`@internationalized/date`](https://react-aria.adobe.com/internationalized/date/) — date types (`CalendarDate`, `CalendarDateTime`, `ZonedDateTime`) and utilities used by all date components
* [`I18nProvider`](https://react-aria.adobe.com/I18nProvider) — override locale for a subtree
* [`useLocale`](https://react-aria.adobe.com/useLocale) — read the current locale and layout direction
