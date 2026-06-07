# Chart Tooltip

Copy MarkdownA composable tooltip for chart data points with customizable indicators, labels, and value formatters.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the ChartTooltip component and access all parts using dot notation.



```tsx
import {ChartTooltip} from "@heroui-pro/react";

<ChartTooltip>
  <ChartTooltip.Header />
  <ChartTooltip.Item>
    <ChartTooltip.Indicator />
    <ChartTooltip.Label />
    <ChartTooltip.Value />
  </ChartTooltip.Item>
</ChartTooltip>
```


## Auto Content

MobileTabletDesktop

## Chart Colors

MobileTabletDesktop

## Custom Formatters

MobileTabletDesktop

## Inactive

MobileTabletDesktop

## Line Indicator

MobileTabletDesktop

## No Header

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.chart-tooltip` — Root tooltip card container. Rounded border with surface background and overlay shadow.

- `.chart-tooltip__header` — Optional title row (e.g., the X-axis label). Muted 12px medium text.

- `.chart-tooltip__item` — A single series entry row. Flex layout with gap.

- `.chart-tooltip__indicator` — Color marker next to the series name.

- `.chart-tooltip__indicator--dot` — Dot-shaped indicator. Small circle (8px).

- `.chart-tooltip__indicator--line` — Line-shaped indicator. Tall narrow pill (12px × 4px).

- `.chart-tooltip__label` — Series name text. Muted 12px, fills available space.

- `.chart-tooltip__value` — Series data value. Semibold 12px foreground text.


## API Reference


### ChartTooltip

The root tooltip container. Controls visibility and indicator style via context.

PropTypeDefaultDescription`active``boolean``true`Controls visibility. When `false`, the tooltip is not rendered.`indicator``"dot" | "line"``"dot"`Shape of the color indicator next to each series name.`children``ReactNode`—Tooltip content — typically `Header`, `Item`, `Indicator`, `Label`, and `Value` sub-components.

Also supports all native `div` HTML attributes.


### ChartTooltip.Content


Auto-renders a tooltip from Recharts payload data. Pass as the `content` prop of a Recharts `<Tooltip>`:



```tsx
<Tooltip content={<ChartTooltip.Content />} />
```

PropTypeDefaultDescription`active``boolean`—Provided by Recharts — whether the tooltip is active.`label``number | string`—Provided by Recharts — the X-axis label for the hovered data point.`payload``RechartsPayloadEntry[]`—Provided by Recharts — array of series data for the hovered point.`hideHeader``boolean``false`Hide the header row.`indicator``"dot" | "line"``"dot"`Shape of the color indicator.`labelFormatter``(label: number | string) => ReactNode`—Custom formatter for the header label.`valueFormatter``(value: number | string) => ReactNode`—Custom formatter for series values.

### ChartTooltip.Header

Optional title row rendered above the series items.

PropTypeDefaultDescription`children``ReactNode`—Header content (typically the X-axis label text).

Also supports all native `div` HTML attributes.


### ChartTooltip.Item


A single series entry row containing an indicator, label, and value.

PropTypeDefaultDescription`children``ReactNode`—Row content — typically `Indicator`, `Label`, and `Value` sub-components.

Also supports all native `div` HTML attributes.


### ChartTooltip.Indicator


Color marker rendered next to the series name. Shape is controlled by the root `indicator` variant.

PropTypeDefaultDescription`color``string`—CSS color value for the indicator background.

Also supports all native `span` HTML attributes.


### ChartTooltip.Label


Series name text displayed between the indicator and value.

PropTypeDefaultDescription`children``ReactNode`—Label content (typically the series name or `dataKey`).

Also supports all native `span` HTML attributes.


### ChartTooltip.Value


Series data value displayed at the end of each item row.

PropTypeDefaultDescription`children``ReactNode`—Value content (typically the formatted numeric value).

Also supports all native `span` HTML attributes.

Bar Chart

A bar chart for comparing categorical data with grouped, stacked, and horizontal layout support.

Composed Chart

A composed chart that combines Bar, Line, and Area series in a single cartesian chart for multi-metric dashboards.