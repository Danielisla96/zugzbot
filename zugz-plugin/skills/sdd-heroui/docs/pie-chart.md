# Pie Chart

Copy MarkdownA pie and donut chart for proportional data with labels, legends, and nested ring support.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the PieChart component and access all parts using dot notation.



```tsx
import {PieChart} from "@heroui-pro/react";

<PieChart>
  <PieChart.Pie>
    <PieChart.Cell />
    <PieChart.Label />
  </PieChart.Pie>
  <PieChart.Tooltip />
</PieChart>
```


## Custom Tooltip

MobileTabletDesktop

## Donut

MobileTabletDesktop

## Donut With Content

MobileTabletDesktop

## Donut With Label

MobileTabletDesktop

## Nested Donut

MobileTabletDesktop

## With Breakdown

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.pie-chart` — Root container wrapping `ResponsiveContainer` and the Recharts chart.


### Recharts Theming

The following CSS rules target Recharts internal class names to apply HeroUI design tokens automatically:



- `.pie-chart .recharts-pie-sector path` — Pie sector strokes. Removed to avoid messy convergence at the center; use `paddingAngle` on `<PieChart.Pie>` for clean slice separation.

- `.pie-chart .recharts-pie-label-text` — Outside label text. 11px muted.

- `.pie-chart .recharts-pie-label-line` — Connector lines from slice to label. Muted at 0.3 opacity.

- `.pie-chart .recharts-label` — Center label text for donut charts. Uses foreground color.

- `.pie-chart .recharts-tooltip-cursor` — Tooltip cursor. Hidden for pie charts.

- `.pie-chart .recharts-tooltip-wrapper` — Tooltip wrapper. Elevated z-index to render above center content.


## API Reference



### PieChart

The root wrapper. Renders a `ResponsiveContainer` + Recharts `PieChart` with HeroUI CSS theming applied automatically.

PropTypeDefaultDescription`height``number``300`Chart height in pixels.`width``number | `${number}%` ``"100%"`Chart width in pixels or percentage string.`children``ReactNode`—Recharts child components (`PieChart.Pie`, `PieChart.Cell`, etc.).

Also supports all native `div` HTML attributes.


### PieChart.Pie


Re-exported Recharts `Pie` component. Follows the Recharts Pie API.


### PieChart.Cell


Re-exported Recharts `Cell` component. Follows the Recharts Cell API.


### PieChart.Label


Re-exported Recharts `Label` component. Follows the Recharts Label API.


### PieChart.Tooltip


Re-exported Recharts `Tooltip` component. Follows the Recharts Tooltip API. Use with `PieChart.TooltipContent` for styled tooltips.


### PieChart.TooltipContent


Pre-built tooltip renderer for Recharts. Pass as the `content` prop of `PieChart.Tooltip`. See ChartTooltip for full props.

Line Chart

A line chart for visualizing trends over time with multi-series, sparkline, and custom tooltip support.

Radar Chart

A radar chart for comparing multivariate data across axes with fill, dot, and multi-series variants.