# Widget

Copy MarkdownA dashboard container that wraps charts, tables, KPIs, or any content with a consistent surface treatment — secondary background shell with an elevated white content area.

Storybook
## Usage

The Widget component provides a cohesive dashboard container with a `surface-secondary` outer shell and an elevated `bg-surface` content area. While it's especially useful for charts, it works with any content — tables, KPIs, metrics, or custom layouts.


MobileTabletDesktop

## Anatomy

Import the Widget component and access all parts using dot notation.



```tsx
import {Widget} from "@heroui-pro/react";

<Widget>
  <Widget.Header>
    <Widget.Title />
    <Widget.Description />
  </Widget.Header>
  <Widget.Content />
  <Widget.Footer />
  <Widget.Legend>
    <Widget.LegendItem />
  </Widget.Legend>
</Widget>
```


## With Bar Chart

MobileTabletDesktop

## With Line Chart

MobileTabletDesktop

## With Pie Chart

MobileTabletDesktop

## With KPIs

Combine Widget with KPIGroup for a metrics overview with inline sparklines.


MobileTabletDesktop

## Usage Summary

A table with ProgressCircle indicators inside Widget — no charts involved, just structured data.


MobileTabletDesktop

## With Table

Widget works with non-chart content too. Use `variant="secondary"` on the Table to remove the default table background and let Widget.Content provide the surface.


MobileTabletDesktop

## Dashboard Grid

Multiple Widgets compose naturally into responsive dashboard layouts with consistent visual rhythm.


MobileTabletDesktop

## CSS Classes


### Element Classes



- `.widget` — Root container with `surface-secondary` background.

- `.widget__header` — Header row with title and legend, spaced between.

- `.widget__title` — Primary label text.

- `.widget__description` — Secondary descriptive text.

- `.widget__content` — Elevated inner area with `bg-surface` and subtle shadow.

- `.widget__footer` — Optional bottom row.

- `.widget__legend` — Inline legend container.

- `.widget__legend-item` — Single legend entry (dot + label).

- `.widget__legend-item-dot` — Color indicator dot.

- `.widget__legend-item-label` — Legend text.


## API Reference


### Widget

The root container. Renders the outer shell with a `surface-secondary` background.

PropTypeDefaultDescription`className``string`—Additional CSS classes.`children``ReactNode`—Widget content (Header, Content, Footer, etc.).`render``(props) => ReactElement`—Custom render function for polymorphic element support.

Also supports all native `div` HTML attributes.


### Widget.Header


Header row with `justify-between` layout. Place the title on the left and legend or actions on the right.

PropTypeDefaultDescription`className``string`—Additional CSS classes.`children``ReactNode`—Header content (Title, Legend, Description, etc.).

### Widget.Title


Primary label text rendered as a `<span>`.

PropTypeDefaultDescription`className``string`—Additional CSS classes.`children``ReactNode`—Title text.

### Widget.Description


Secondary descriptive text rendered as a `<span>`.

PropTypeDefaultDescription`className``string`—Additional CSS classes.`children``ReactNode`—Description text.

### Widget.Content


The elevated inner area with `bg-surface` background and subtle shadow. This is where charts, tables, or KPIs go.

PropTypeDefaultDescription`className``string`—Additional CSS classes. Use `p-0` to remove padding for edge-to-edge content like tables.`children``ReactNode`—Main content.

### Widget.Footer


Optional bottom row for actions or metadata.

PropTypeDefaultDescription`className``string`—Additional CSS classes.`children``ReactNode`—Footer content.

### Widget.Legend


Inline legend container. Typically placed inside Widget.Header.

PropTypeDefaultDescription`className``string`—Additional CSS classes.`children``ReactNode`—LegendItem children.

### Widget.LegendItem


A single legend entry with a color dot and label.

PropTypeDefaultDescription`color``string`—Required. CSS color for the dot (e.g., `"var(--chart-3)"`).`className``string`—Additional CSS classes.`children``ReactNode`—Label text.
List View

A single-column interactive list with keyboard navigation, selection, and accessible item actions — built on RAC GridList.

Chain Of Thought

A collapsible reasoning timeline for assistant thinking, progress, and agent traces.