# Line Chart

Copy MarkdownA line chart for visualizing trends over time with multi-series, sparkline, and custom tooltip support.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the LineChart component and access all parts using dot notation.



```tsx
import {LineChart} from "@heroui-pro/react";

<LineChart>
  <LineChart.Grid />
  <LineChart.XAxis />
  <LineChart.YAxis />
  <LineChart.Line />
  <LineChart.Tooltip />
</LineChart>
```


## Dashed Comparison

MobileTabletDesktop

## KPI With Chart

MobileTabletDesktop

## Multi Line Chart Colors

MobileTabletDesktop

## Portfolio

MobileTabletDesktop

## Sparkline

MobileTabletDesktop

## Stats With Chart

MobileTabletDesktop

## Traffic Source

MobileTabletDesktop

## With Custom Tooltip

MobileTabletDesktop

## With Dots

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.line-chart` — Root container wrapping `ResponsiveContainer` and the Recharts chart.


### Recharts Theming

The following CSS rules target Recharts internal class names to apply HeroUI design tokens automatically:



- `.line-chart .recharts-cartesian-axis-tick-value` — Axis tick labels. 10px muted text.

- `.line-chart .recharts-cartesian-axis-line` — Axis lines. Hidden by default.

- `.line-chart .recharts-cartesian-axis-tick-line` — Tick lines. Hidden by default.

- `.line-chart .recharts-cartesian-grid line` — Cartesian grid lines. Muted stroke at 0.15 opacity.

- `.line-chart .recharts-tooltip-cursor` — Tooltip cursor. Dashed vertical line on hover.

- `.line-chart .recharts-active-dot circle` — Active dot. Outlined with surface color for contrast.


## API Reference



### LineChart

The root wrapper. Renders a `ResponsiveContainer` + Recharts `LineChart` with HeroUI CSS theming applied automatically.

PropTypeDefaultDescription`data``Record<string, number | string>[]`—Chart data — array of objects with numeric/string fields for each series.`height``number``300`Chart height in pixels.`width``number | `${number}%` ``"100%"`Chart width in pixels or percentage string.`margin``{ top?: number; right?: number; bottom?: number; left?: number }``{ top: 8, right: 8, bottom: 0, left: 0 }`Recharts margin around the chart area.`children``ReactNode`—Recharts child components (`LineChart.Line`, `LineChart.XAxis`, etc.).

Also supports all native `div` HTML attributes.


### LineChart.Line


Re-exported Recharts `Line` component. Follows the Recharts Line API.


### LineChart.XAxis


Re-exported Recharts `XAxis` component. Follows the Recharts XAxis API.


### LineChart.YAxis


Re-exported Recharts `YAxis` component. Follows the Recharts YAxis API.


### LineChart.Grid


Re-exported Recharts `CartesianGrid` component. Follows the Recharts CartesianGrid API.


### LineChart.Tooltip


Re-exported Recharts `Tooltip` component. Follows the Recharts Tooltip API. Use with `LineChart.TooltipContent` for styled tooltips.


### LineChart.TooltipContent


Pre-built tooltip renderer for Recharts. Pass as the `content` prop of `LineChart.Tooltip`. See ChartTooltip for full props.

Composed Chart

A composed chart that combines Bar, Line, and Area series in a single cartesian chart for multi-metric dashboards.

Pie Chart

A pie and donut chart for proportional data with labels, legends, and nested ring support.