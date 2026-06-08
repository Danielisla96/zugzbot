# CloseButton

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/close-button
> Button component for closing dialogs, modals, or dismissing content


## Import

```tsx
import { CloseButton } from "@heroui/react";

```

### Usage

```tsx
import {CloseButton} from "@heroui/react";

export function Default() {
  return <CloseButton />;
}

```

### With Custom Icon

```tsx
import {CircleXmark, Xmark} from "@gravity-ui/icons";
import {CloseButton} from "@heroui/react";

export function WithCustomIcon() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <CloseButton>
          <CircleXmark />
        </CloseButton>
        <span className="text-xs text-muted">Custom Icon</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <CloseButton>
          <Xmark />
        </CloseButton>
        <span className="text-xs text-muted">Alternative Icon</span>
      </div>
    </div>
  );
}

```

### Interactive

```tsx
"use client";

import {CloseButton} from "@heroui/react";
import {useState} from "react";

export function Interactive() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <CloseButton
        aria-label={`Close (clicked ${count} times)`}
        onPress={() => setCount(count + 1)}
      />
      <span className="text-sm text-muted">Clicked: {count} times</span>
    </div>
  );
}

```

## Related Components

* **Alert**: Display important messages and notifications
* **AlertDialog**: Critical confirmations requiring user attention
* **Chip**: Compact elements for tags and filters

## Styling

### Passing Tailwind CSS classes

```tsx
import {CloseButton} from "@heroui/react";

function CustomCloseButton() {
  return <CloseButton className="text-red-600 hover:bg-red-100">Close</CloseButton>;
}

```

### Customizing the component classes

To customize the CloseButton component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .close-button {
    @apply bg-red-100 text-red-800 hover:bg-red-200;
  }

  .close-button--custom {
    @apply rounded-full border-2 border-red-300;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The CloseButton component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/close-button.css)):

#### Base Classes

* `.close-button` - Base component styles

#### Variant Classes

* `.close-button--default` - Default variant

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Hover**: `:hover` or `[data-hovered="true"]`
* **Active/Pressed**: `:active` or `[data-pressed="true"]`
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]`
* **Disabled**: `:disabled` or `[aria-disabled="true"]`

## API Reference

### CloseButton Props

| Prop         | Type                    | Default         | Description                                 |
| ------------ | ----------------------- | --------------- | ------------------------------------------- |
| `variant`    | `"default"`             | `"default"`     | Visual variant of the button                |
| `children`   | `ReactNode \| function` | `<CloseIcon />` | Content to display (defaults to close icon) |
| `onPress`    | `() => void`            | -               | Handler called when the button is pressed   |
| `isDisabled` | `boolean`               | `false`         | Whether the button is disabled              |

### React Aria Button Props

CloseButton extends all React Aria Button props. Common props include:

| Prop               | Type     | Description                             |
| ------------------ | -------- | --------------------------------------- |
| `aria-label`       | `string` | Accessible label for screen readers     |
| `aria-labelledby`  | `string` | ID of element that labels the button    |
| `aria-describedby` | `string` | ID of element that describes the button |

### RenderProps

When using the render prop pattern, these values are provided:

| Prop         | Type      | Description                    |
| ------------ | --------- | ------------------------------ |
| `isHovered`  | `boolean` | Whether the button is hovered  |
| `isPressed`  | `boolean` | Whether the button is pressed  |
| `isFocused`  | `boolean` | Whether the button is focused  |
| `isDisabled` | `boolean` | Whether the button is disabled |
