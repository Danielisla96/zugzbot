# ColorPicker

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/color-picker
> A composable color picker that synchronizes color value between multiple color components


## Import

```tsx
import {
  ColorPicker,
  ColorArea,
  ColorSlider,
  ColorSwatch,
  ColorField,
  ColorSwatchPicker,
} from '@heroui/react';

```

### Usage

```tsx
import {ColorArea, ColorPicker, ColorSlider, ColorSwatch, Label} from "@heroui/react";

export function Basic() {
  return (
    <ColorPicker defaultValue="#0485F7">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <Label>Pick a color</Label>
      </ColorPicker.Trigger>
      <ColorPicker.Popover>
        <ColorArea
          aria-label="Color area"
          className="max-w-full"
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
        >
          <ColorArea.Thumb />
        </ColorArea>
        <ColorSlider channel="hue" className="gap-1 px-1" colorSpace="hsb">
          <Label>Hue</Label>
          <ColorSlider.Output className="text-muted" />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}

```

### Anatomy

The ColorPicker is a composable component that combines multiple color components:

```tsx
import { ColorPicker, ColorArea, ColorSlider, ColorSwatch, Label } from '@heroui/react';

export default () => (
  <ColorPicker defaultValue="#0485F7">
    <ColorPicker.Trigger>
      <ColorSwatch />
      <Label>Pick a color</Label>
    </ColorPicker.Trigger>
    <ColorPicker.Popover>
      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness">
        <ColorArea.Thumb />
      </ColorArea>
      <ColorSlider channel="hue" colorSpace="hsb">
        <ColorSlider.Track>
          <ColorSlider.Thumb />
        </ColorSlider.Track>
      </ColorSlider>
    </ColorPicker.Popover>
  </ColorPicker>
);

```

### Controlled

```tsx
"use client";

import {
  Button,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Label,
  parseColor,
} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useState} from "react";

export function Controlled() {
  const [color, setColor] = useState(parseColor("#325578"));

  const colorPresets = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
  ];

  const shuffleColor = () => {
    const randomHue = Math.floor(Math.random() * 360);
    const randomSaturation = 50 + Math.floor(Math.random() * 50); // 50-100%
    const randomLightness = 40 + Math.floor(Math.random() * 30); // 40-70%

    setColor(parseColor(`hsl(${randomHue}, ${randomSaturation}%, ${randomLightness}%)`));
  };

  return (
    <div className="flex flex-col gap-4">
      <ColorPicker value={color} onChange={setColor}>
        <ColorPicker.Trigger>
          <ColorSwatch size="lg" />
          <Label>Pick a color</Label>
        </ColorPicker.Trigger>
        <ColorPicker.Popover className="gap-2">
          <ColorSwatchPicker className="justify-center pt-2" size="xs">
            {colorPresets.map((preset) => (
              <ColorSwatchPicker.Item key={preset} color={preset}>
                <ColorSwatchPicker.Swatch />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>
          <ColorArea
            aria-label="Color area"
            className="max-w-full"
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
          >
            <ColorArea.Thumb />
          </ColorArea>
          <div className="flex items-center gap-2 px-1">
            <ColorSlider aria-label="Hue slider" channel="hue" className="flex-1" colorSpace="hsb">
              <ColorSlider.Track>
                <ColorSlider.Thumb />
              </ColorSlider.Track>
            </ColorSlider>
            <Button
              isIconOnly
              aria-label="Shuffle color"
              size="sm"
              variant="tertiary"
              onPress={shuffleColor}
            >
              <Icon className="size-4" icon="gravity-ui:shuffle" />
            </Button>
          </div>
          <ColorField aria-label="Color field">
            <ColorField.Group variant="secondary">
              <ColorField.Prefix>
                <ColorSwatch size="xs" />
              </ColorField.Prefix>
              <ColorField.Input />
            </ColorField.Group>
          </ColorField>
        </ColorPicker.Popover>
      </ColorPicker>
      <p className="w-60 text-sm text-muted">
        Selected: <span className="font-medium">{color.toString("hex")}</span>
      </p>
    </div>
  );
}

```

### With Swatches

```tsx
import {
  ColorArea,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  Label,
} from "@heroui/react";

export function WithSwatches() {
  const presets = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
  ];

  return (
    <ColorPicker defaultValue="#F43F5E">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <Label>Brand Color</Label>
      </ColorPicker.Trigger>
      <ColorPicker.Popover>
        <ColorArea
          aria-label="Color area"
          className="max-w-full"
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
        >
          <ColorArea.Thumb />
        </ColorArea>
        <ColorSlider aria-label="Hue slider" channel="hue" className="gap-1 px-1" colorSpace="hsb">
          <Label>Hue</Label>
          <ColorSlider.Output className="text-muted" />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
        <ColorSwatchPicker className="justify-center px-1" size="xs">
          {presets.map((preset) => (
            <ColorSwatchPicker.Item key={preset} color={preset}>
              <ColorSwatchPicker.Swatch />
            </ColorSwatchPicker.Item>
          ))}
        </ColorSwatchPicker>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}

```

### With Fields

Use `ColorField` to allow users to edit individual color channel values with a `Select` to switch between color spaces.

```tsx
"use client";

import type {ColorChannel, ColorSpace} from "@heroui/react";

import {
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  Label,
  ListBox,
  Select,
} from "@heroui/react";
import {useState} from "react";

export function WithFields() {
  const [colorSpace, setColorSpace] = useState<ColorSpace>("hsl");

  const colorChannelsByColorSpace: Record<ColorSpace, ColorChannel[]> = {
    hsb: ["hue", "saturation", "brightness"],
    hsl: ["hue", "saturation", "lightness"],
    rgb: ["red", "green", "blue"],
  };

  return (
    <ColorPicker defaultValue="hsla(220, 90%, 50%, 0.8)">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <Label>Pick a color</Label>
      </ColorPicker.Trigger>
      <ColorPicker.Popover className="max-w-62 gap-2">
        <ColorArea
          className="max-w-full"
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
        >
          <ColorArea.Thumb />
        </ColorArea>
        <ColorSlider channel="hue" className="gap-1 px-1" colorSpace="hsb">
          <Label>Hue</Label>
          <ColorSlider.Output className="text-muted" />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
        <Select
          aria-label="Color space"
          value={colorSpace}
          variant="secondary"
          onChange={(value) => setColorSpace(value as ColorSpace)}
        >
          <Select.Trigger>
            <Select.Value className="uppercase" />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {Object.keys(colorChannelsByColorSpace).map((space) => (
                <ListBox.Item key={space} className="uppercase" id={space} textValue={space}>
                  {space}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <div className="grid w-full grid-cols-3 items-center gap-2">
          {colorChannelsByColorSpace[colorSpace].map((channel) => (
            <ColorField
              key={channel}
              aria-label={channel}
              channel={channel}
              colorSpace={colorSpace}
            >
              <ColorField.Group variant="secondary">
                <ColorField.Input />
              </ColorField.Group>
            </ColorField>
          ))}
        </div>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}

```

### With Sliders

Use multiple `ColorSlider` components to adjust each channel of a color value.

```tsx
"use client";

import type {ColorChannel, ColorSpace} from "@heroui/react";

import {ColorPicker, ColorSlider, ColorSwatch, Label, ListBox, Select} from "@heroui/react";
import {useState} from "react";

export function WithSliders() {
  const [colorSpace, setColorSpace] = useState<ColorSpace>("hsl");

  const colorChannelsByColorSpace: Record<ColorSpace, ColorChannel[]> = {
    hsb: ["hue", "saturation", "brightness", "alpha"],
    hsl: ["hue", "saturation", "lightness", "alpha"],
    rgb: ["red", "green", "blue", "alpha"],
  };

  return (
    <ColorPicker defaultValue="hsl(219, 58%, 93%)">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <Label>Pick a color</Label>
      </ColorPicker.Trigger>
      <ColorPicker.Popover className="max-w-62 gap-2 px-2 py-3">
        <Select
          aria-label="Color space"
          value={colorSpace}
          variant="secondary"
          onChange={(value) => setColorSpace(value as ColorSpace)}
        >
          <Select.Trigger>
            <Select.Value className="uppercase" />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {Object.keys(colorChannelsByColorSpace).map((space) => (
                <ListBox.Item key={space} className="uppercase" id={space} textValue={space}>
                  {space}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <div className="flex flex-col gap-2">
          {colorChannelsByColorSpace[colorSpace].map((channel: ColorChannel) => (
            // @ts-expect-error - TypeScript can't correlate dynamic colorSpace with channel type
            <ColorSlider
              key={channel}
              aria-label={channel}
              channel={channel}
              className="gap-1 px-1"
              colorSpace={colorSpace}
            >
              <Label className="capitalize">{channel}</Label>
              <ColorSlider.Output className="text-muted" />
              <ColorSlider.Track>
                <ColorSlider.Thumb />
              </ColorSlider.Track>
            </ColorSlider>
          ))}
        </div>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}

```

## Related Components

* **ColorArea**: 2D color picker for selecting colors from a gradient area
* **ColorSlider**: Slider for adjusting individual color channel values
* **ColorSwatch**: Visual preview of a color value

## Styling

### Passing Tailwind CSS classes

```tsx
import { ColorPicker, ColorArea, ColorSlider, ColorSwatch, Label } from '@heroui/react';

function CustomColorPicker() {
  return (
    <ColorPicker defaultValue="#0485F7">
      <ColorPicker.Trigger className="gap-4">
        <ColorSwatch className="rounded-lg" />
        <Label>Pick a color</Label>
      </ColorPicker.Trigger>
      <ColorPicker.Popover className="p-4 rounded-xl">
        <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness">
          <ColorArea.Thumb />
        </ColorArea>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}

```

### Customizing the component classes

To customize the ColorPicker component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .color-picker {
    @apply inline-flex;
  }

  .color-picker__trigger {
    @apply inline-flex items-center gap-4 rounded-lg;
  }

  .color-picker__popover {
    @apply p-4 rounded-xl;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The ColorPicker component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/color-picker.css)):

#### Base Classes

* `.color-picker` - Base container
* `.color-picker__trigger` - Trigger button
* `.color-picker__popover` - Popover container

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Focus**: `:focus-visible` or `[data-focus-visible="true"]`
* **Disabled**: `:disabled` or `[data-disabled="true"]`

## API Reference

### ColorPicker Props

Inherits from [React Aria ColorPicker](https://react-spectrum.adobe.com/react-aria/ColorPicker.html).

| Prop           | Type                     | Default | Description                                          |
| -------------- | ------------------------ | ------- | ---------------------------------------------------- |
| `value`        | `string \| Color`        | -       | The current color value (controlled)                 |
| `defaultValue` | `string \| Color`        | -       | The default color value (uncontrolled)               |
| `onChange`     | `(color: Color) => void` | -       | Handler called when the color changes                |
| `children`     | `React.ReactNode`        | -       | Content of the color picker (Trigger, Popover, etc.) |
| `className`    | `string`                 | -       | Additional CSS classes                               |

### ColorPicker.Trigger Props

| Prop        | Type                                                    | Default | Description                    |
| ----------- | ------------------------------------------------------- | ------- | ------------------------------ |
| `children`  | `React.ReactNode \| ((renderProps) => React.ReactNode)` | -       | Trigger content or render prop |
| `className` | `string`                                                | -       | Additional CSS classes         |

### ColorPicker.Popover Props

| Prop        | Type              | Default         | Description              |
| ----------- | ----------------- | --------------- | ------------------------ |
| `placement` | `Placement`       | `"bottom left"` | Placement of the popover |
| `children`  | `React.ReactNode` | -               | Popover content          |
| `className` | `string`          | -               | Additional CSS classes   |

### Related Types

#### Color

Represents a color value. See [React Aria Color](https://react-spectrum.adobe.com/react-aria/ColorPicker.html#color) for full API.

| Method                             | Description                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `toString(format)`                 | Converts the color to a string in the given format (hex, rgb, hsl, hsb, css) |
| `toFormat(format)`                 | Converts the color to the given format and returns a new Color object        |
| `getChannelValue(channel)`         | Returns the numeric value for a given channel                                |
| `withChannelValue(channel, value)` | Sets the numeric value for a channel and returns a new Color                 |

#### parseColor

```tsx
import { parseColor } from 'react-aria-components';

// Parse from string
const color = parseColor('#ff0000');
const hslColor = parseColor('hsl(0, 100%, 50%)');

```
