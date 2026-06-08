# ColorArea

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/color-area
> A 2D color picker that allows users to select colors from a gradient area


## Import

```tsx
import { ColorArea } from '@heroui/react';

```

### Usage

```tsx
import {ColorArea} from "@heroui/react";

export function ColorAreaBasic() {
  return (
    <ColorArea defaultValue="rgb(116, 52, 255)">
      <ColorArea.Thumb />
    </ColorArea>
  );
}

```

### Anatomy

```tsx
import { ColorArea } from '@heroui/react';

export default () => (
  <ColorArea>
    <ColorArea.Thumb />
  </ColorArea>
);

```

### With Dots

```tsx
import {ColorArea} from "@heroui/react";

export function ColorAreaWithDots() {
  return (
    <ColorArea showDots defaultValue="hsl(200, 100%, 50%)">
      <ColorArea.Thumb />
    </ColorArea>
  );
}

```

### Controlled

```tsx
"use client";

import type {Color} from "@heroui/react";

import {ColorArea, ColorSwatch, parseColor} from "@heroui/react";
import {useState} from "react";

export function ColorAreaControlled() {
  const [color, setColor] = useState<Color>(parseColor("#9B80FF"));

  return (
    <div className="flex flex-col gap-4">
      <ColorArea colorSpace="rgb" value={color} xChannel="red" yChannel="green" onChange={setColor}>
        <ColorArea.Thumb />
      </ColorArea>
      <div className="flex w-[300px] items-center gap-3">
        <ColorSwatch color={color} size="md" />
        <p className="text-sm text-muted">
          Current color:{" "}
          <span className="font-medium">{color ? color.toString("hex") : "(empty)"}</span>
        </p>
      </div>
    </div>
  );
}

```

### Color Space & Channels

Use `colorSpace` to set the color space (RGB, HSL, HSB) and `xChannel`/`yChannel` props to customize which color channels are displayed on each axis.

```tsx
"use client";

import type {ColorSpace, Key} from "@heroui/react";

import {ColorArea, Label, ListBox, Select, parseColor} from "@heroui/react";
import {useState} from "react";

type ColorChannel = "hue" | "saturation" | "brightness" | "lightness" | "red" | "green" | "blue";

interface ChannelOption {
  id: ColorChannel;
  name: string;
}

const colorSpaces: Array<{id: ColorSpace; name: string}> = [
  {id: "rgb", name: "RGB"},
  {id: "hsl", name: "HSL"},
  {id: "hsb", name: "HSB"},
];

const channelsBySpace: Record<ColorSpace, ChannelOption[]> = {
  hsb: [
    {id: "hue", name: "Hue"},
    {id: "saturation", name: "Saturation"},
    {id: "brightness", name: "Brightness"},
  ],
  hsl: [
    {id: "hue", name: "Hue"},
    {id: "saturation", name: "Saturation"},
    {id: "lightness", name: "Lightness"},
  ],
  rgb: [
    {id: "red", name: "Red"},
    {id: "green", name: "Green"},
    {id: "blue", name: "Blue"},
  ],
};

export function ColorAreaSpaceAndChannels() {
  const [colorSpace, setColorSpace] = useState<ColorSpace>("hsb");
  const [color, setColor] = useState(() => parseColor("hsb(219, 58%, 93%)"));

  const channels = channelsBySpace[colorSpace];
  const defaultX = colorSpace === "rgb" ? "blue" : "saturation";
  const defaultY =
    colorSpace === "rgb" ? "green" : colorSpace === "hsl" ? "lightness" : "brightness";

  const [xChannel, setXChannel] = useState<ColorChannel>(defaultX);
  const [yChannel, setYChannel] = useState<ColorChannel>(defaultY);

  const handleColorSpaceChange = (newSpace: Key | null) => {
    if (!newSpace) return;
    const space = newSpace as ColorSpace;

    setColorSpace(space);
    // Reset channels to appropriate defaults for the new color space
    if (space === "rgb") {
      setXChannel("blue");
      setYChannel("green");
    } else if (space === "hsl") {
      setXChannel("saturation");
      setYChannel("lightness");
    } else {
      setXChannel("saturation");
      setYChannel("brightness");
    }
  };

  // Filter out the other channel from options (can't have same channel on both axes)
  const xChannelOptions = channels.filter((c) => c.id !== yChannel);
  const yChannelOptions = channels.filter((c) => c.id !== xChannel);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Controls */}
      <div className="flex gap-4">
        {/* Color Space Select */}
        <Select className="w-32" value={colorSpace} onChange={handleColorSpaceChange}>
          <Label>Color Space</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {colorSpaces.map((space) => (
                <ListBox.Item key={space.id} id={space.id} textValue={space.name}>
                  {space.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {/* X Channel Select */}
        <Select
          className="w-36"
          value={xChannel}
          onChange={(value) => value && setXChannel(value as ColorChannel)}
        >
          <Label>X Axis</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {xChannelOptions.map((channel) => (
                <ListBox.Item key={channel.id} id={channel.id} textValue={channel.name}>
                  {channel.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {/* Y Channel Select */}
        <Select
          className="w-36"
          value={yChannel}
          onChange={(value) => value && setYChannel(value as ColorChannel)}
        >
          <Label>Y Axis</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {yChannelOptions.map((channel) => (
                <ListBox.Item key={channel.id} id={channel.id} textValue={channel.name}>
                  {channel.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      {/* Color Area */}
      <ColorArea
        colorSpace={colorSpace}
        value={color}
        xChannel={xChannel}
        yChannel={yChannel}
        onChange={setColor}
      >
        <ColorArea.Thumb />
      </ColorArea>

      {/* Color Value Display */}
      <div className="flex items-center gap-3">
        <div
          className="size-8 rounded-md border border-default"
          style={{backgroundColor: color.toString("css")}}
        />
        <code className="rounded bg-default/50 px-2 py-1 text-sm">
          {color.toString(colorSpace)}
        </code>
      </div>
    </div>
  );
}

```

### Disabled

```tsx
import {ColorArea} from "@heroui/react";

export function ColorAreaDisabled() {
  return (
    <ColorArea isDisabled defaultValue="hsl(200, 100%, 50%)">
      <ColorArea.Thumb />
    </ColorArea>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {ColorArea} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <ColorArea
      defaultValue="rgb(116, 52, 255)"
      render={(props) => <div {...props} data-custom="slider" />}
    >
      <ColorArea.Thumb render={(props) => <div {...props} data-custom="thumb" />} />
    </ColorArea>
  );
}

```

## Related Components

* **ColorSwatch**: Visual preview of a color value
* **ColorSwatchPicker**: Color swatch selection from a list of colors
* **ColorField**: Input for entering color values with hex format

## Styling

### Passing Tailwind CSS classes

```tsx
import { ColorArea } from '@heroui/react';

function CustomColorArea() {
  return (
    <ColorArea className="max-w-72 rounded-3xl">
      <ColorArea.Thumb />
    </ColorArea>
  );
}

```

### Customizing the component classes

To customize the ColorArea component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .color-area {
    @apply rounded-3xl;
  }

  .color-area__thumb {
    @apply size-5 border-4;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The ColorArea component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/color-area.css)):

#### Base Classes

* `.color-area` - Base styles with gradient background and inner shadow
* `.color-area--show-dots` - Adds dot grid overlay for precision picking

#### Element Classes

* `.color-area__thumb` - Draggable thumb indicator

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Disabled**: `[data-disabled="true"]`
* **Focus**: `[data-focus-visible="true"]`
* **Dragging**: `[data-dragging="true"]` (thumb only)

## API Reference

### ColorArea Props

Inherits from [React Aria ColorArea](https://react-spectrum.adobe.com/react-aria/ColorArea.html).

| Prop           | Type                                                                         | Default        | Description                                                      |
| -------------- | ---------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| `value`        | `string \| Color`                                                            | -              | The current color value (controlled)                             |
| `defaultValue` | `string \| Color`                                                            | -              | The default color value (uncontrolled)                           |
| `onChange`     | `(color: Color) => void`                                                     | -              | Handler called when the color changes while dragging             |
| `onChangeEnd`  | `(color: Color) => void`                                                     | -              | Handler called when the user stops dragging                      |
| `xChannel`     | `ColorChannel`                                                               | `"saturation"` | Color channel for the horizontal axis                            |
| `yChannel`     | `ColorChannel`                                                               | `"brightness"` | Color channel for the vertical axis                              |
| `colorSpace`   | `ColorSpace`                                                                 | -              | The color space for the channels                                 |
| `isDisabled`   | `boolean`                                                                    | `false`        | Whether the color area is disabled                               |
| `showDots`     | `boolean`                                                                    | `false`        | Whether to show the dot grid overlay                             |
| `className`    | `string`                                                                     | -              | Additional CSS classes                                           |
| `render`       | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, ColorAreaRenderProps>` | -              | Overrides the default DOM element with a custom render function. |

### ColorArea.Thumb Props

| Prop        | Type                                                                          | Default | Description                                                      |
| ----------- | ----------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `className` | `string`                                                                      | -       | Additional CSS classes                                           |
| `style`     | `CSSProperties \| ((renderProps) => CSSProperties)`                           | -       | Inline styles or render props function                           |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, ColorThumbRenderProps>` | -       | Overrides the default DOM element with a custom render function. |
