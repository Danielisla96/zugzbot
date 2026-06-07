# Number Value

Copy MarkdownA formatted number display with locale-aware rendering for currency, percentages, and compact notation.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the NumberValue component and access all parts using dot notation.



```tsx
import {NumberValue} from "@heroui-pro/react";

<NumberValue>
  <NumberValue.Prefix />
  <NumberValue.Suffix />
</NumberValue>
```


## Compact

MobileTabletDesktop

## Currency

MobileTabletDesktop

## Format Options

MobileTabletDesktop

## Percent

MobileTabletDesktop

## Sign Display

MobileTabletDesktop

## Tabular Nums

MobileTabletDesktop

## With Prefix Suffix

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.number-value` - Base inline-flex wrapper


### Element Classes



- `.number-value__prefix` - Text before the formatted number

- `.number-value__value` - The formatted number

- `.number-value__suffix` - Text after the formatted number


## API Reference


### NumberValue

The root component. Formats and displays a number using locale-aware `Intl.NumberFormat`.

PropTypeDefaultDescription`value``number`-Required. The numeric value to format`style``'decimal' | 'currency' | 'percent' | 'unit'``'decimal'`Formatting style`currency``string`-Currency code (e.g. `"USD"`). Required when `style` is `"currency"``unit``string`-Unit type (e.g. `"degree"`). Required when `style` is `"unit"``notation``'standard' | 'compact' | 'scientific' | 'engineering'``'standard'`Notation style`signDisplay``'auto' | 'always' | 'exceptZero' | 'never'`-Controls when the sign is displayed`minimumFractionDigits``number`-Minimum number of fraction digits`maximumFractionDigits``number`-Maximum number of fraction digits`locale``string`-Override the locale from the nearest I18nProvider`formatOptions``NumberFormatOptions`-Format options passed directly to `NumberFormatter`. Overrides individual convenience props`children``ReactNode | ((formatted: string) => ReactNode)`-Prefix/Suffix sub-components or a render function receiving the formatted string

Also supports all native `span` HTML attributes except `children` and `style`.


### NumberValue.Prefix


Text displayed before the formatted number.

PropTypeDefaultDescription`children``ReactNode`-Prefix text

Also supports all native `span` HTML attributes.


### NumberValue.Suffix


Text displayed after the formatted number.

PropTypeDefaultDescription`children``ReactNode`-Suffix text

Also supports all native `span` HTML attributes.

Emoji Reaction Button

An animated emoji reaction button with count display and toggle state for social interactions.

Pressable Feedback

A press interaction layer adding ripple, highlight, hold-to-confirm, and progress feedback effects to any element.