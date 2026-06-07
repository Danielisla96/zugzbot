# Radial Chart

Copy MarkdownA radial chart for gauge, progress ring, and circular data visualizations with customizable arcs and labels.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the RadialChart component and access all parts using dot notation.



```tsx
import {RadialChart} from "@heroui-pro/react";

<RadialChart>
  <RadialChart.AngleAxis />
  <RadialChart.Bar>
    <RadialChart.Cell />
  </RadialChart.Bar>
  <RadialChart.Tooltip />
</RadialChart>
```


## Gauge

MobileTabletDesktop

## Gauge Grid

MobileTabletDesktop

## Progress Ring

MobileTabletDesktop

## With Legend

MobileTabletDesktop

## CSS Classes


### Element Classes



- `.radial-chart` — Root container wrapping `ResponsiveContainer` and the Recharts chart.


### Recharts Theming

The following CSS rules target Recharts internal class names to apply HeroUI design tokens automatically:



- `.radial-chart .recharts-tooltip-cursor` — Tooltip cursor. Hidden for radial charts.

- `.radial-chart .recharts-tooltip-wrapper` — Tooltip wrapper. Elevated z-index to render above center content.

- `.radial-chart .recharts-radial-bar-background-sector` — Bar background track. Uses the separator token for a subtle fill.


## API Reference



### RadialChart

The root wrapper. Renders a `ResponsiveContainer` + Recharts `RadialBarChart` with HeroUI CSS theming applied automatically.

PropTypeDefaultDescription`data``Record<string, number | string>[]`—Chart data — array of objects. Each entry becomes a concentric ring.`height``number``300`Chart height in pixels.`width``number | `${number}%` ``"100%"`Chart width in pixels or percentage string.`barSize``number``10`Bar thickness in pixels.`innerRadius``number | string``"30%"`Inner radius of the bar area.`outerRadius``number | string``"80%"`Outer radius of the bar area.`startAngle``number``90`Start angle in degrees.`endAngle``number``-270`End angle in degrees.`children``ReactNode`—Recharts child components (`RadialChart.Bar`, `RadialChart.Cell`, etc.).

Also supports all native `div` HTML attributes.


### RadialChart.Bar


Re-exported Recharts `RadialBar` component. Follows the Recharts RadialBar API.


### RadialChart.Cell


Re-exported Recharts `Cell` component. Follows the Recharts Cell API.


### RadialChart.AngleAxis


Re-exported Recharts `PolarAngleAxis` component. Follows the Recharts PolarAngleAxis API.


### RadialChart.Tooltip


Re-exported Recharts `Tooltip` component. Follows the Recharts Tooltip API. Use with `RadialChart.TooltipContent` for styled tooltips.


### RadialChart.TooltipContent


Pre-built tooltip renderer for Recharts. Pass as the `content` prop of `RadialChart.Tooltip`. See ChartTooltip for full props.

Radar Chart

A radar chart for comparing multivariate data across axes with fill, dot, and multi-series variants.

Agenda

A composable calendar component with day, week, and month views for displaying and managing events with drag interactions.