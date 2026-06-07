# Bar Chart

Copy MarkdownA bar chart for comparing categorical data with grouped, stacked, and horizontal layout support.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the BarChart component and access all parts using dot notation.



```tsx
import {BarChart} from "@heroui-pro/react";

<BarChart>
  <BarChart.Grid />
  <BarChart.XAxis />
  <BarChart.YAxis />
  <BarChart.Bar />
  <BarChart.Tooltip />
</BarChart>
```


## Comparison

MobileTabletDesktop

## Custom Tooltip

MobileTabletDesktop

## Grouped

MobileTabletDesktop

## Horizontal

MobileTabletDesktop

## Horizontal Stacked

MobileTabletDesktop

## KPIWith Bar Chart

MobileTabletDesktop

## Stacked

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.bar-chart` — Root container wrapping `ResponsiveContainer` and the Recharts chart.


### Recharts Theming

The following CSS rules target Recharts internal class names to apply HeroUI design tokens automatically:



- `.bar-chart .recharts-cartesian-axis-tick-value` — Axis tick labels. 10px muted text.

- `.bar-chart .recharts-cartesian-axis-line` — Axis lines. Hidden by default.

- `.bar-chart .recharts-cartesian-axis-tick-line` — Tick lines. Hidden by default.

- `.bar-chart .recharts-cartesian-grid line` — Cartesian grid lines. Muted stroke at 0.15 opacity.

- `.bar-chart .recharts-tooltip-cursor` — Tooltip cursor. Subtle filled rectangle behind the hovered bar.


## API Reference



### BarChart

The root wrapper. Renders a `ResponsiveContainer` + Recharts `BarChart` with HeroUI CSS theming applied automatically.

PropTypeDefaultDescription`data``Record<string, number | string>[]`—Chart data — array of objects with numeric/string fields for each series.`height``number``300`Chart height in pixels.`width``number | `${number}%` ``"100%"`Chart width in pixels or percentage string.`layout``"horizontal" | "vertical"``"horizontal"`Bar layout direction. Use `"vertical"` for horizontal bar charts.`margin``{ top?: number; right?: number; bottom?: number; left?: number }``{ top: 8, right: 8, bottom: 0, left: 0 }`Recharts margin around the chart area.`children``ReactNode`—Recharts child components (`BarChart.Bar`, `BarChart.XAxis`, etc.).

Also supports all native `div` HTML attributes.


### BarChart.Bar


Re-exported Recharts `Bar` component. Follows the Recharts Bar API.


### BarChart.XAxis


Re-exported Recharts `XAxis` component. Follows the Recharts XAxis API.


### BarChart.YAxis


Re-exported Recharts `YAxis` component. Follows the Recharts YAxis API.


### BarChart.Grid


Re-exported Recharts `CartesianGrid` component. Follows the Recharts CartesianGrid API.


### BarChart.Tooltip


Re-exported Recharts `Tooltip` component. Follows the Recharts Tooltip API. Use with `BarChart.TooltipContent` for styled tooltips.


### BarChart.TooltipContent


Pre-built tooltip renderer for Recharts. Pass as the `content` prop of `BarChart.Tooltip`. See ChartTooltip for full props.

Area Chart

An area chart for visualizing trends with gradient fills, stacked series, and sparkline variants.

Chart Tooltip

A composable tooltip for chart data points with customizable indicators, labels, and value formatters.