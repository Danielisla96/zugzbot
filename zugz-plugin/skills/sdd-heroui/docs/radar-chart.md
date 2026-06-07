# Radar Chart

Copy MarkdownA radar chart for comparing multivariate data across axes with fill, dot, and multi-series variants.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the RadarChart component and access all parts using dot notation.



```tsx
import {RadarChart} from "@heroui-pro/react";

<RadarChart>
  <RadarChart.Grid />
  <RadarChart.AngleAxis />
  <RadarChart.RadiusAxis />
  <RadarChart.Radar />
  <RadarChart.Tooltip />
</RadarChart>
```


## Comparison

MobileTabletDesktop

## Dots Only

MobileTabletDesktop

## Multi Series

MobileTabletDesktop

## With Radius Axis

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.radar-chart` — Root container wrapping `ResponsiveContainer` and the Recharts chart.


### Recharts Theming

The following CSS rules target Recharts internal class names to apply HeroUI design tokens automatically:



- `.radar-chart .recharts-polar-angle-axis-tick-value` — Angle axis tick labels. 11px muted text.

- `.radar-chart .recharts-polar-radius-axis-tick-value` — Radius axis tick labels. 10px muted text.

- `.radar-chart .recharts-polar-grid-concentric-polygon` / `.recharts-polar-grid-concentric-circle` — Concentric grid shapes. Muted stroke at 0.2 opacity.

- `.radar-chart .recharts-polar-grid-angle line` — Angle grid lines. Muted stroke at 0.2 opacity.

- `.radar-chart .recharts-tooltip-cursor` — Tooltip cursor. Hidden for radar charts.


## API Reference



### RadarChart

The root wrapper. Renders a `ResponsiveContainer` + Recharts `RadarChart` with HeroUI CSS theming applied automatically.

PropTypeDefaultDescription`data``Record<string, number | string>[]`—Chart data — array of objects with a category key and numeric series fields.`height``number``300`Chart height in pixels.`width``number | `${number}%` ``"100%"`Chart width in pixels or percentage string.`children``ReactNode`—Recharts child components (`RadarChart.Radar`, `RadarChart.Grid`, etc.).

Also supports all native `div` HTML attributes.


### RadarChart.Radar


Re-exported Recharts `Radar` component. Follows the Recharts Radar API.


### RadarChart.Grid


Re-exported Recharts `PolarGrid` component. Follows the Recharts PolarGrid API.


### RadarChart.AngleAxis


Re-exported Recharts `PolarAngleAxis` component. Follows the Recharts PolarAngleAxis API.


### RadarChart.RadiusAxis


Re-exported Recharts `PolarRadiusAxis` component. Follows the Recharts PolarRadiusAxis API.


### RadarChart.Tooltip


Re-exported Recharts `Tooltip` component. Follows the Recharts Tooltip API. Use with `RadarChart.TooltipContent` for styled tooltips.


### RadarChart.TooltipContent


Pre-built tooltip renderer for Recharts. Pass as the `content` prop of `RadarChart.Tooltip`. See ChartTooltip for full props.

Pie Chart

A pie and donut chart for proportional data with labels, legends, and nested ring support.

Radial Chart

A radial chart for gauge, progress ring, and circular data visualizations with customizable arcs and labels.