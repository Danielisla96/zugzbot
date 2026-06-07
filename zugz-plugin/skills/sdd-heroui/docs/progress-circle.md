# ProgressCircle

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/progress-circle
> A circular progress indicator that shows determinate or indeterminate progress.


## Import

```tsx
import { ProgressCircle } from '@heroui/react';

```

### Usage

```tsx
import {ProgressCircle} from "@heroui/react";

export function Basic() {
  return (
    <ProgressCircle aria-label="Loading" value={60}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}

```

### Anatomy

```tsx
import { ProgressCircle } from '@heroui/react';

export default () => (
  <ProgressCircle aria-label="Loading" value={60}>
    <ProgressCircle.Track>
      <ProgressCircle.TrackCircle />
      <ProgressCircle.FillCircle />
    </ProgressCircle.Track>
  </ProgressCircle>
);

```

### Sizes

```tsx
import {ProgressCircle} from "@heroui/react";

export function Sizes() {
  return (
    <div className="flex items-center gap-6">
      <ProgressCircle aria-label="Loading" size="sm" value={40}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <ProgressCircle aria-label="Loading" size="md" value={60}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <ProgressCircle aria-label="Loading" size="lg" value={80}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
    </div>
  );
}

```

### Colors

```tsx
import {ProgressCircle} from "@heroui/react";

export function Colors() {
  return (
    <div className="flex items-center gap-6">
      <ProgressCircle aria-label="Default" color="default" value={60}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <ProgressCircle aria-label="Accent" color="accent" value={60}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <ProgressCircle aria-label="Success" color="success" value={60}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <ProgressCircle aria-label="Warning" color="warning" value={60}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <ProgressCircle aria-label="Danger" color="danger" value={60}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
    </div>
  );
}

```

### Indeterminate

Use `isIndeterminate` when progress cannot be determined.

```tsx
import {ProgressCircle} from "@heroui/react";

export function Indeterminate() {
  return (
    <ProgressCircle isIndeterminate aria-label="Loading">
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}

```

### With Label

```tsx
import {Label, ProgressCircle} from "@heroui/react";

export function WithLabel() {
  return (
    <div className="flex items-center gap-3">
      <ProgressCircle aria-label="Loading" value={75}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <Label>75% Complete</Label>
    </div>
  );
}

```

### Custom SVG Props

Since each part is a composable component, you can override SVG attributes like `strokeWidth`, `r`, `cx`, `cy`, and `viewBox` directly.

```tsx
import {ProgressCircle} from "@heroui/react";

export function CustomSvg() {
  return (
    <div className="flex items-end gap-6">
      <ProgressCircle aria-label="Thin circle" value={60}>
        <ProgressCircle.Track strokeWidth={2} viewBox="0 0 36 36">
          <ProgressCircle.TrackCircle cx={18} cy={18} r={17} strokeWidth={2} />
          <ProgressCircle.FillCircle cx={18} cy={18} r={17} strokeWidth={2} />
        </ProgressCircle.Track>
      </ProgressCircle>

      <ProgressCircle aria-label="Default circle" value={60}>
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>

      <ProgressCircle aria-label="Thick circle" value={60}>
        <ProgressCircle.Track strokeWidth={6} viewBox="0 0 36 36">
          <ProgressCircle.TrackCircle cx={18} cy={18} r={15} strokeWidth={6} />
          <ProgressCircle.FillCircle cx={18} cy={18} r={15} strokeWidth={6} />
        </ProgressCircle.Track>
      </ProgressCircle>
    </div>
  );
}

```

## Styling

### Passing Tailwind CSS classes

You can customize individual ProgressCircle parts:

```tsx
import { ProgressCircle } from '@heroui/react';

function CustomProgressCircle() {
  return (
    <ProgressCircle aria-label="Loading" value={60}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle className="stroke-purple-500" />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}

```

### Customizing the component classes

To customize the ProgressCircle component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .progress-circle {
    @apply inline-flex;
  }

  .progress-circle__track {
    @apply size-12;
  }

  .progress-circle__fill-circle {
    stroke: purple;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The ProgressCircle component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/progress-circle.css)):

#### Base & Element Classes

* `.progress-circle` - Base container
* `.progress-circle__track` - SVG element
* `.progress-circle__track-circle` - Background circle
* `.progress-circle__fill-circle` - Progress arc

#### Size Classes

* `.progress-circle--sm` - Small size variant
* `.progress-circle--md` - Medium size variant (default)
* `.progress-circle--lg` - Large size variant

#### Color Classes

* `.progress-circle--default` - Default color variant
* `.progress-circle--accent` - Accent color variant
* `.progress-circle--success` - Success color variant
* `.progress-circle--warning` - Warning color variant
* `.progress-circle--danger` - Danger color variant

## API Reference

### ProgressCircle Props

Inherits from [React Aria ProgressBar](https://react-spectrum.adobe.com/react-aria/ProgressBar.html).

| Prop              | Type                                                          | Default              | Description                         |
| ----------------- | ------------------------------------------------------------- | -------------------- | ----------------------------------- |
| `value`           | `number`                                                      | `0`                  | The current value                   |
| `minValue`        | `number`                                                      | `0`                  | The minimum value                   |
| `maxValue`        | `number`                                                      | `100`                | The maximum value                   |
| `isIndeterminate` | `boolean`                                                     | `false`              | Whether progress is indeterminate   |
| `size`            | `"sm" \| "md" \| "lg"`                                        | `"md"`               | Size of the circle                  |
| `color`           | `"default" \| "accent" \| "success" \| "warning" \| "danger"` | `"accent"`           | Color of the progress arc           |
| `formatOptions`   | `Intl.NumberFormatOptions`                                    | `{style: 'percent'}` | Number format for the value display |
| `children`        | `ReactNode \| (values: ProgressBarRenderProps) => ReactNode`  | -                    | Content or render prop              |

### ProgressBarRenderProps

When using the render prop pattern, these values are provided:

| Prop              | Type      | Description                            |
| ----------------- | --------- | -------------------------------------- |
| `percentage`      | `number`  | The percentage of the progress (0-100) |
| `valueText`       | `string`  | The formatted value text               |
| `isIndeterminate` | `boolean` | Whether progress is indeterminate      |
