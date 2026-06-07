# Agenda

Copy MarkdownA composable calendar component with day, week, and month views for displaying and managing events with drag interactions.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the Agenda component and the `useAgenda` hook. Access all subcomponents using dot notation.



```tsx
import {Agenda, useAgenda} from "@heroui-pro/react";

const agenda = useAgenda({
  events: [...],
  defaultView: "week",
});

<Agenda {...agenda}>
  <Agenda.Header>
    <Agenda.Heading />
    <Agenda.ViewSelector />
    <Agenda.Navigation>
      <Agenda.NavButton slot="previous" />
      <Agenda.TodayButton />
      <Agenda.NavButton slot="next" />
    </Agenda.Navigation>
  </Agenda.Header>
  <Agenda.Body>
    {/* Day / Week view */}
    <Agenda.WeekHeader />
    <Agenda.AllDaySection>
      <Agenda.AllDayLabel>all-day</Agenda.AllDayLabel>
      {agenda.allDayLayout.map((item) => (
        <Agenda.AllDayEvent key={item.event.id} event={item.event} colStart={item.colStart} colSpan={item.colSpan} row={item.row} />
      ))}
    </Agenda.AllDaySection>
    <Agenda.TimeGrid>
      <Agenda.CurrentTimeIndicator />
      {agenda.visibleDays.map((day) => (
        <Agenda.DayColumn key={day.toString()} date={day}>
          {agenda.getEventsForDay(day).map((event) => (
            <Agenda.Event key={event.id} event={event} />
          ))}
        </Agenda.DayColumn>
      ))}
    </Agenda.TimeGrid>

    {/* Month view */}
    <Agenda.MonthGrid>
      {agenda.visibleWeeks.map((week, i) => {
        const rowLayout = agenda.getMonthRowLayout(week);
        return (
          <Agenda.MonthRow key={i} spanningRowCount={rowLayout.rowCount}>
            {rowLayout.items.map((item) => (
              <Agenda.MonthSpanningEvent key={item.event.id} event={item.event} colStart={item.colStart} colSpan={item.colSpan} row={item.row} />
            ))}
            {week.map((day, colIdx) => (
              <Agenda.MonthCell key={day.toString()} date={day} spanningRowCount={rowLayout.rowCountPerCol[colIdx] ?? 0}>
                {agenda.getPerCellEvents(day, week).map((event) => (
                  <Agenda.MonthEvent key={event.id} event={event} />
                ))}
              </Agenda.MonthCell>
            ))}
          </Agenda.MonthRow>
        );
      })}
    </Agenda.MonthGrid>
  </Agenda.Body>
</Agenda>
```


## Views

The Agenda supports three views controlled via the `ViewSelector` or programmatically through `setView`:



- Day — single day with full time grid

- Week — 7-day (or custom count) view with shared time grid

- Month — calendar grid with spanning multi-day events


## Events


Events are defined as an array of `AgendaEvent` objects:



```tsx
interface AgendaEvent {
  id: string;
  title: string;
  start: CalendarDateTime;
  end: CalendarDateTime;
  color?: string;
  isAllDay?: boolean;
  isReadOnly?: boolean;
  status?: "confirmed" | "unconfirmed";
}
```


### Unconfirmed Events

Set `status: "unconfirmed"` to render an event with a dashed border and transparent background, indicating a tentative or pending event.


### Read-Only Events


Set `isReadOnly: true` to prevent an event from being moved or resized. The event can still be selected but drag interactions are disabled and the resize handle is hidden.


## Drag Interactions


All drag interactions work out of the box when callbacks are provided:



- Drag to create — click and drag on an empty time slot to create a new event

- Drag to move — drag an event to a different time or day

- Drag to resize — drag the bottom edge of an event to change its duration

- Cross-day move — drag an event horizontally to move it to a different day


On mobile, drag interactions (create, move, resize) are disabled by default. The consumer controls this by passing `undefined` for the drag callbacks when on a small screen.


### Event Callbacks



```tsx
const agenda = useAgenda({
  events,
  onEventCreate: (event) => { /* { start, end } */ },
  onEventMove: (id, start, end) => { /* moved */ },
  onEventResize: (id, start, end) => { /* resized */ },
  onEventDelete: (id) => { /* deleted via Delete/Backspace key */ },
  onEventSelect: (id) => { /* selected */ },
});
```


## All-Day Events

All-day events appear in a collapsible section above the time grid. Multi-day all-day events span across day columns.


The section includes an expand/collapse toggle. When collapsed, event counts are shown per day (e.g. "2 events"). Customize the collapsed label with the `collapsedLabel` prop on `Agenda.AllDaySection`.


## Month View Features



### Spanning Events

Multi-day all-day events render as bars spanning across the month grid row. Use `getMonthRowLayout(week)` to compute layout positions and `getPerCellEvents(day, week)` for per-cell events.


### Event Overflow


`Agenda.MonthCell` limits visible events via the `maxEvents` prop (default: 2). Overflow shows a "N more" link that navigates to the day view. Customize the label with the `moreLabel` prop.


### Date Navigation


Clicking a date number in the month grid navigates to that date in day view. The first day of each month shows the month name (e.g. "May 1").


## Weekend Highlighting


Saturday and Sunday columns automatically receive a subtle gray background (`data-weekend` attribute) in all views.


## Current Time Indicator


A live indicator shows the current time in the time grid:



- Displays a time label badge (e.g. "10:30 AM") in the time column

- In week view, a faded line spans all columns with an active highlight on today's column

- Nearby hour labels auto-hide to avoid overlap

- Updates every minute


## CSS Classes



### Base



- `.agenda` — Root container. Sets CSS custom properties for sizing.


### CSS Variables



- `--agenda-slot-height` — Height of each hour slot (default: `60px`).

- `--agenda-time-column-width` — Width of the time labels column (default: `58px`).

- `--agenda-current-time-color` — Color of the current time indicator (default: `var(--color-danger)`).

- `--agenda-event-radius` — Border radius of event cards (default: `var(--radius-md)`).


### Header



- `.agenda__header` — Flex container for heading, view selector, and navigation.

- `.agenda__heading` — Month/year title text.

- `.agenda__navigation` — Wrapper for nav buttons and today button.

- `.agenda__nav-button` — Override hook for navigation arrow buttons (uses HeroUI Button).

- `.agenda__today-button` — Override hook for the Today button (uses HeroUI Button).

- `.agenda__view-selector` — Override hook for the view selector (uses HeroUI Segment).


### Day/Week View



- `.agenda__week-header` — Row of day headers above the time grid.

- `.agenda__day-header` — Individual day header with name and date.

- `.agenda__time-grid` — Scrollable time grid container.

- `.agenda__time-labels` — Sticky column of hour labels.

- `.agenda__time-label` — Individual hour label.

- `.agenda__day-column` — Column for a single day's events.

- `.agenda__time-slot` — Individual hour slot row.


### Events



- `.agenda__event` — Positioned event card in the time grid.

- `.agenda__event-title` — Event title text.

- `.agenda__event-time` — Event time range text.

- `.agenda__resize-handle` — Bottom resize handle with hover indicator.


### All-Day Section



- `.agenda__all-day-section` — Grid container for all-day events.

- `.agenda__all-day-toggle` — Expand/collapse chevron button.

- `.agenda__all-day-label` — "all-day" label text.

- `.agenda__all-day-event` — All-day event bar.

- `.agenda__all-day-summary` — Collapsed event count per day.


### Month View



- `.agenda__month-grid` — Month grid container.

- `.agenda__month-weekday-header` — Sticky weekday names row.

- `.agenda__month-row` — Week row in the month grid.

- `.agenda__month-cell` — Individual day cell.

- `.agenda__month-cell-date` — Date number button (navigates to day view).

- `.agenda__month-cell-more` — "N more" overflow link.

- `.agenda__month-event` — Per-cell event in month view.

- `.agenda__month-spanning-event` — Multi-day event bar spanning across cells.


### Interactive States



- `[data-dragging]` — Applied during drag interactions.

- `[data-resizing]` — Applied during resize.

- `[data-selected="true"]` — Applied to selected events.

- `[data-status="unconfirmed"]` — Dashed border style for tentative events.

- `[data-readonly]` — Applied to read-only events.

- `[data-weekend]` — Applied to weekend columns and cells.

- `[data-today]` — Applied to today's date elements.

- `[data-drop-target]` — Applied to the target cell during drag.


### Previews



- `.agenda__create-preview` — Dashed preview rectangle during drag-to-create.

- `.agenda__drop-preview` — Outlined preview at the target position during drag-to-move.


## API Reference


### useAgenda

The main hook for managing agenda state. Returns all data and methods needed by the component.

OptionTypeDefaultDescription`events``AgendaEvent[]`—Array of events to display. Required.`defaultView``"day" | "week" | "month"``"week"`Initial view.`view``"day" | "week" | "month"`—Controlled view state.`onViewChange``(view: AgendaView) => void`—Called when the view changes.`defaultDate``CalendarDate`todayInitial focused date.`date``CalendarDate`—Controlled date state.`onDateChange``(date: CalendarDate) => void`—Called when the date changes.`startHour``number``0`First visible hour in the time grid.`endHour``number``24`Last visible hour in the time grid.`slotDuration``number``60`Duration of each time slot in minutes.`onEventCreate``(event: {start, end}) => void`—Called when dragging to create a new event.`onEventDelete``(id: string) => void`—Called when Delete/Backspace is pressed on a selected event.`onEventMove``(id, start, end) => void`—Called when an event is dragged to a new position.`onEventResize``(id, start, end) => void`—Called when an event is resized.`onEventSelect``(id: string | null) => void`—Called when an event is selected or deselected.`selectedEventId``string | null`—Controlled selected event state.

### Agenda


Root component. Wraps children in context and Motion providers.


Also supports all HTML `div` props.


### Agenda.Header


Container for heading, view selector, and navigation controls.


Also supports all HTML `div` props.


### Agenda.Heading


Displays the current month and year (e.g. "May 2026").


Also supports all HTML `h1` props.


### Agenda.ViewSelector


Segmented control for switching between day, week, and month views. Built on the HeroUI Segment component.

PropTypeDefaultDescription`size``"sm" | "md" | "lg"``"sm"`Size of the segment control.

### Agenda.NavButton


Navigation button for previous/next. Built on the HeroUI Button component.

PropTypeDefaultDescription`slot``"previous" | "next"`—Direction of navigation.

### Agenda.TodayButton


Button to navigate to today's date. Built on the HeroUI Button component.


### Agenda.AllDaySection


Collapsible section for all-day events with a CSS grid layout for spanning events.

PropTypeDefaultDescription`collapsedLabel``(count: number) => string``"N events"`Custom label for collapsed event counts.

### Agenda.AllDayEvent


An all-day event bar positioned in the grid.

PropTypeDefaultDescription`event``AgendaEvent`—The event data. Required.`colStart``number`—Grid column start index (0-based).`colSpan``number`—Number of columns to span.`row``number`—Row index for stacking.

### Agenda.Event


A timed event card positioned absolutely in a day column. Supports drag-to-move and drag-to-resize.

PropTypeDefaultDescription`event``AgendaEvent`—The event data. Required.

### Agenda.MonthCell


A day cell in the month grid. Limits visible events and shows overflow.

PropTypeDefaultDescription`date``CalendarDate`—The date for this cell. Required.`maxEvents``number``2`Maximum number of events to show before overflow.`moreLabel``(count: number) => string``"N more"`Custom label for the overflow link.`spanningRowCount``number``0`Number of spanning event rows above this cell.

### Agenda.MonthSpanningEvent


A multi-day event bar in the month grid, positioned absolutely across cells.

PropTypeDefaultDescription`event``AgendaEvent`—The event data. Required.`colStart``number`—Column start index (0-based).`colSpan``number`—Number of columns to span.`row``number`—Row index for vertical stacking.

### Agenda.MonthEvent


A per-cell event in the month grid. Supports drag-to-move across cells.

PropTypeDefaultDescription`event``AgendaEvent`—The event data. Required.
Radial Chart

A radial chart for gauge, progress ring, and circular data visualizations with customizable arcs and labels.

Action Bar

A floating toolbar for contextual actions — bulk selection, editing controls, or any set of actions that appear in response to user interaction.