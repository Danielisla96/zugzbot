# Composed Chart

Copy MarkdownA composed chart that combines Bar, Line, and Area series in a single cartesian chart for multi-metric dashboards.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the ComposedChart component and access all parts using dot notation.



```tsx
import {ComposedChart} from "@heroui-pro/react";

<ComposedChart>
  <ComposedChart.Grid />
  <ComposedChart.XAxis />
  <ComposedChart.YAxis />
  <ComposedChart.Bar />
  <ComposedChart.Line />
  <ComposedChart.Area />
  <ComposedChart.Tooltip />
</ComposedChart>
```


## Stacked Bar With Line

MobileTabletDesktop

## Area With Line

MobileTabletDesktop

## Bar With Area

MobileTabletDesktop

## Multi Type

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.composed-chart` — Root container wrapping `ResponsiveContainer` and the Recharts chart.


### Recharts Theming

The following CSS rules target Recharts internal class names to apply HeroUI design tokens automatically:



- `.composed-chart .recharts-cartesian-axis-tick-value` — Axis tick labels. 10px muted text.

- `.composed-chart .recharts-cartesian-axis-line` — Axis lines. Hidden by default.

- `.composed-chart .recharts-cartesian-axis-tick-line` — Tick lines. Hidden by default.

- `.composed-chart .recharts-cartesian-grid line` — Cartesian grid lines. Muted stroke at 0.15 opacity.

- `.composed-chart .recharts-tooltip-cursor` — Tooltip cursor. Dashed vertical line on hover.

- `.composed-chart .recharts-active-dot circle` — Active dot. Outlined with surface color for contrast.


## API Reference



### ComposedChart

The root wrapper. Renders a `ResponsiveContainer` + Recharts `ComposedChart` with HeroUI CSS theming applied automatically.

PropTypeDefaultDescription`data``Record<string, number | string>[]`—Chart data — array of objects with numeric/string fields for each series.`height``number``300`Chart height in pixels.`width``number | `${number}%` ``"100%"`Chart width in pixels or percentage string.`margin``{ top?: number; right?: number; bottom?: number; left?: number }``{ top: 8, right: 8, bottom: 0, left: 0 }`Recharts margin around the chart area.`children``ReactNode`—Recharts child components (`ComposedChart.Bar`, `ComposedChart.Line`, `ComposedChart.Area`, etc.).

Also supports all native `div` HTML attributes.


### ComposedChart.Bar


Re-exported Recharts `Bar` component. Follows the Recharts Bar API.


### ComposedChart.Line


Re-exported Recharts `Line` component. Follows the Recharts Line API.


### ComposedChart.Area


Re-exported Recharts `Area` component. Follows the Recharts Area API.


### ComposedChart.XAxis


Re-exported Recharts `XAxis` component. Follows the Recharts XAxis API.


### ComposedChart.YAxis


Re-exported Recharts `YAxis` component. Follows the Recharts YAxis API.


### ComposedChart.Grid


Re-exported Recharts `CartesianGrid` component. Follows the Recharts CartesianGrid API.


### ComposedChart.Tooltip


Re-exported Recharts `Tooltip` component. Follows the Recharts Tooltip API. Use with `ComposedChart.TooltipContent` for styled tooltips.


### ComposedChart.TooltipContent


Pre-built tooltip renderer for Recharts. Pass as the `content` prop of `ComposedChart.Tooltip`. See ChartTooltip for full props.

Chart Tooltip

A composable tooltip for chart data points with customizable indicators, labels, and value formatters.

Line Chart

A line chart for visualizing trends over time with multi-series, sparkline, and custom tooltip support.