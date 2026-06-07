# Area Chart

Copy MarkdownAn area chart for visualizing trends with gradient fills, stacked series, and sparkline variants.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the AreaChart component and access all parts using dot notation.



```tsx
import {AreaChart} from "@heroui-pro/react";

<AreaChart>
  <AreaChart.Grid />
  <AreaChart.XAxis />
  <AreaChart.YAxis />
  <AreaChart.Area />
  <AreaChart.Tooltip />
</AreaChart>
```


## Custom Tooltip

MobileTabletDesktop

## KPI With Area Chart

MobileTabletDesktop

## Multi Area

MobileTabletDesktop

## Sparkline

MobileTabletDesktop

## Stacked

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.area-chart` — Root container wrapping `ResponsiveContainer` and the Recharts chart.


### Recharts Theming

The following CSS rules target Recharts internal class names to apply HeroUI design tokens automatically:



- `.area-chart .recharts-cartesian-axis-tick-value` — Axis tick labels. 10px muted text.

- `.area-chart .recharts-cartesian-axis-line` — Axis lines. Hidden by default.

- `.area-chart .recharts-cartesian-axis-tick-line` — Tick lines. Hidden by default.

- `.area-chart .recharts-cartesian-grid line` — Cartesian grid lines. Muted stroke at 0.15 opacity.

- `.area-chart .recharts-tooltip-cursor` — Tooltip cursor. Dashed vertical line on hover.

- `.area-chart .recharts-active-dot circle` — Active dot. Outlined with surface color for contrast.


## API Reference



### AreaChart

The root wrapper. Renders a `ResponsiveContainer` + Recharts `AreaChart` with HeroUI CSS theming applied automatically.

PropTypeDefaultDescription`data``Record<string, number | string>[]`—Chart data — array of objects with numeric/string fields for each series.`height``number``300`Chart height in pixels.`width``number | `${number}%` ``"100%"`Chart width in pixels or percentage string.`margin``{ top?: number; right?: number; bottom?: number; left?: number }``{ top: 8, right: 8, bottom: 0, left: 0 }`Recharts margin around the chart area.`children``ReactNode`—Recharts child components (`AreaChart.Area`, `AreaChart.XAxis`, etc.).

Also supports all native `div` HTML attributes.


### AreaChart.Area


Re-exported Recharts `Area` component. Follows the Recharts Area API.


### AreaChart.XAxis


Re-exported Recharts `XAxis` component. Follows the Recharts XAxis API.


### AreaChart.YAxis


Re-exported Recharts `YAxis` component. Follows the Recharts YAxis API.


### AreaChart.Grid


Re-exported Recharts `CartesianGrid` component. Follows the Recharts CartesianGrid API.


### AreaChart.Tooltip


Re-exported Recharts `Tooltip` component. Follows the Recharts Tooltip API. Use with `AreaChart.TooltipContent` for styled tooltips.


### AreaChart.TooltipContent


Pre-built tooltip renderer for Recharts. Pass as the `content` prop of `AreaChart.Tooltip`. See ChartTooltip for full props.

All Components

Explore the full list of Pro components available in HeroUI React. More are on the way.

Bar Chart

A bar chart for comparing categorical data with grouped, stacked, and horizontal layout support.