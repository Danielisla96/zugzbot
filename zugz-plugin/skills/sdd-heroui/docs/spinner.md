# Spinner

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/spinner
> A loading indicator component to show pending states


## Import

```tsx
import { Spinner } from '@heroui/react';

```

### Usage

```tsx
import {Spinner} from "@heroui/react";

export function SpinnerBasic() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
    </div>
  );
}

```

### Colors

```tsx
import {Spinner} from "@heroui/react";

export function SpinnerColors() {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Spinner color="current" />
        <span className="text-xs text-muted">Current</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner color="accent" />
        <span className="text-xs text-muted">Accent</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner color="success" />
        <span className="text-xs text-muted">Success</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner color="warning" />
        <span className="text-xs text-muted">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner color="danger" />
        <span className="text-xs text-muted">Danger</span>
      </div>
    </div>
  );
}

```

### Sizes

```tsx
import {Spinner} from "@heroui/react";

export function SpinnerSizes() {
  return (
    <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span className="text-xs text-muted">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="md" />
        <span className="text-xs text-muted">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span className="text-xs text-muted">Large</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="xl" />
        <span className="text-xs text-muted">Extra Large</span>
      </div>
    </div>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import {Spinner} from '@heroui/react';

function CustomSpinner() {
  return (
    <Spinner className="text-blue-500" />
  );
}

```

### Customizing the component classes

To customize the Spinner component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .spinner {
    @apply animate-spin;
  }

  .spinner--accent {
    color: var(--accent);
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Spinner component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/spinner.css)):

#### Base & Size Classes

* `.spinner` - Base spinner styles with default size
* `.spinner--sm` - Small size variant
* `.spinner--md` - Medium size variant (default)
* `.spinner--lg` - Large size variant
* `.spinner--xl` - Extra large size variant

#### Color Classes

* `.spinner--current` - Inherits current text color
* `.spinner--accent` - Accent color variant
* `.spinner--danger` - Danger color variant
* `.spinner--success` - Success color variant
* `.spinner--warning` - Warning color variant

## API Reference

### Spinner Props

| Prop        | Type                                                          | Default     | Description                  |
| ----------- | ------------------------------------------------------------- | ----------- | ---------------------------- |
| `size`      | `"sm" \| "md" \| "lg" \| "xl"`                                | `"md"`      | Size of the spinner          |
| `color`     | `"current" \| "accent" \| "success" \| "warning" \| "danger"` | `"current"` | Color variant of the spinner |
| `className` | `string`                                                      | -           | Additional CSS classes       |
