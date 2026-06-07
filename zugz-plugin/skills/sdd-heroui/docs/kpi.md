# KPI

Copy MarkdownA key performance indicator card displaying a metric value with trend chip, sparkline chart, and contextual details.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the KPI component and access all parts using dot notation.



```tsx
import {KPI} from "@heroui-pro/react";

<KPI>
  <KPI.Header />
  <KPI.Icon />
  <KPI.Title />
  <KPI.Value />
  <KPI.Trend />
  <KPI.Progress />
  <KPI.Chart />
  <KPI.Content />
  <KPI.Separator />
  <KPI.Actions />
  <KPI.Footer />
</KPI>
```


## With Actions

MobileTabletDesktop

## With Chart Bottom

MobileTabletDesktop

## With Chart Inline

MobileTabletDesktop

## With Footer

MobileTabletDesktop

## With Icon

MobileTabletDesktop

## With Progress

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.kpi` - Base card shell with flex column layout and padding


### Element Classes



- `.kpi__header` - Top row for icon, title, and actions

- `.kpi__content` - Grid layout container for value and trend side by side

- `.kpi__icon` - Status-tinted icon container

- `.kpi__actions` - Absolutely positioned action button area

- `.kpi__title` - Metric label text (`dt` element)

- `.kpi__value` - Large formatted number (`dd` element)

- `.kpi__trend` - Inline trend badge (wraps TrendChip)

- `.kpi__progress` - Full-width progress bar area

- `.kpi__chart` - Sparkline container with edge-fade mask

- `.kpi__separator` - Edge-to-edge divider

- `.kpi__footer` - Bottom section


### Data Attributes



- `[data-status="success"]` / `[data-status="warning"]` / `[data-status="danger"]` on `.kpi__icon` - Status color tinting


### CSS Variables



- `--kpi-chart-fade` - Edge fade width for the sparkline mask (default: `10%`)


## API Reference


### KPI

The root component. Wraps HeroUI Card.

PropTypeDefaultDescription`children``ReactNode`-KPI sub-components

Also supports all HeroUI Card props.


### KPI.Header


Top row container for icon, title, and actions.

PropTypeDefaultDescription`children``ReactNode`-Icon, Title, and Actions elements

Also supports all native `div` HTML attributes.


### KPI.Content


Grid layout container placing value and trend side by side.

PropTypeDefaultDescription`children``ReactNode`-Value, Trend, Progress, etc.

Also supports all native `div` HTML attributes.


### KPI.Icon


Status-tinted icon container.

PropTypeDefaultDescription`status``'success' | 'warning' | 'danger'`-Status color for icon background tinting`children``ReactNode`-Icon element

Also supports all native `div` HTML attributes.


### KPI.Title


Metric label rendered as a `dt` element.

PropTypeDefaultDescription`children``ReactNode`-Title text

Also supports all native `dt` HTML attributes.


### KPI.Value


Large formatted number display. Wraps NumberValue with a `dd` element for semantics.

PropTypeDefaultDescription`value``number`-Required. The numeric value to format`children``((formatted: string) => ReactNode)`-Optional render function receiving the formatted string

Also supports all NumberValue props except `children`.


### KPI.Trend


Inline trend badge. Wraps TrendChip.


Also supports all TrendChip props.


### KPI.Progress


Full-width progress bar.

PropTypeDefaultDescription`value``number`-Required. Progress value from 0 to 100`status``'success' | 'warning' | 'danger'``'success'`Status color for the progress bar

Also supports all native `div` HTML attributes.


### KPI.Actions


Action button (three-dot icon by default). Wraps HeroUI Button as a ghost icon-only button.

PropTypeDefaultDescription`children``ReactNode`-Custom icon replacing the default three-dot icon

Also supports all HeroUI Button props.


### KPI.Chart


Sparkline area chart using Recharts.

PropTypeDefaultDescription`data``Record<string, number | string>[]`-Required. Chart data array`dataKey``string``'value'`Key in each data object to use as the Y value`color``string``'currentColor'`Stroke/line color`fillColor``string`-Fill color for the area gradient. Defaults to `color` at 20% opacity`height``number``80`Chart height in pixels`strokeWidth``number``2`Stroke width

Also supports all native `div` HTML attributes.


### KPI.Separator


Edge-to-edge divider. Wraps HeroUI Separator.


Also supports all HeroUI Separator props.


### KPI.Footer


Bottom section for additional details or links.

PropTypeDefaultDescription`children``ReactNode`-Footer content

Also supports all native `div` HTML attributes.

Item Card Group

A layout component for grouping item cards in list or grid arrangements with section headers and dividers.

KPI Group

A layout component for arranging multiple KPI cards in horizontal or vertical stacks with consistent spacing.