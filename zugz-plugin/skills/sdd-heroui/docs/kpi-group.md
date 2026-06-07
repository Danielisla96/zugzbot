# KPI Group

Copy MarkdownA layout component for arranging multiple KPI cards in horizontal or vertical stacks with consistent spacing.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the KPIGroup component and access all parts using dot notation.



```tsx
import {KPIGroup} from "@heroui-pro/react";

<KPIGroup>
  <KPIGroup.Separator />
</KPIGroup>
```


## Vertical

MobileTabletDesktop

## With From Suffix

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.kpi-group` - Base group container with shared surface background and rounded corners


### Orientation Classes



- `.kpi-group--horizontal` - Horizontal layout with equal-width children

- `.kpi-group--vertical` - Vertical layout stacking children


### Element Classes



- `.kpi-group__separator` - Divider between KPI cards (width or height based on orientation)


## API Reference


### KPIGroup

The root component. Groups KPI cards with shared styling.

PropTypeDefaultDescription`orientation``'horizontal' | 'vertical'``'horizontal'`Layout direction`children``ReactNode`-KPI cards and separators

Also supports all native `div` HTML attributes.


### KPIGroup.Separator


A visual divider between KPI cards. Renders as a 1px line.


Also supports all native `span` HTML attributes.

KPI

A key performance indicator card displaying a metric value with trend chip, sparkline chart, and contextual details.

List View

A single-column interactive list with keyboard navigation, selection, and accessible item actions — built on RAC GridList.