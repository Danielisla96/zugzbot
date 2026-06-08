# Breadcrumbs

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/breadcrumbs
> Navigation breadcrumbs showing the current page's location within a hierarchy


## Import

```tsx
import { Breadcrumbs } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {Breadcrumbs} from "@heroui/react";

export default function BreadcrumbsBasic() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Products</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Electronics</Breadcrumbs.Item>
      <Breadcrumbs.Item>Laptop</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}

```

### Anatomy

Import the Breadcrumbs component and access all parts using dot notation.

```tsx
import { Breadcrumbs } from '@heroui/react';

export default () => (
  <Breadcrumbs>
    <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
    <Breadcrumbs.Item href="#">Category</Breadcrumbs.Item>
    <Breadcrumbs.Item>Current Page</Breadcrumbs.Item>
  </Breadcrumbs>
)

```

### Navigation Levels

```tsx
"use client";

import {Breadcrumbs} from "@heroui/react";

export default function BreadcrumbsLevel2() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item>Current Page</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}

```

```tsx
"use client";

import {Breadcrumbs} from "@heroui/react";

export default function BreadcrumbsLevel3() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Category</Breadcrumbs.Item>
      <Breadcrumbs.Item>Current Page</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}

```

### Custom Separator

```tsx
"use client";

import {Breadcrumbs} from "@heroui/react";

export default function BreadcrumbsCustomSeparator() {
  return (
    <Breadcrumbs
      separator={
        <svg viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
          <path d="M249.3 235.8c10.2 12.6 9.5 31.1-2.2 42.8l-128 128c-9.2 9.2-22.9 11.9-34.9 6.9S64.5 396.9 64.5 384l0-256c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l128 128 2.2 2.4z" />
        </svg>
      }
    >
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Products</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Electronics</Breadcrumbs.Item>
      <Breadcrumbs.Item>Laptop</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}

```

### Disabled State

```tsx
"use client";

import {Breadcrumbs} from "@heroui/react";

export default function BreadcrumbsDisabled() {
  return (
    <Breadcrumbs isDisabled>
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Products</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Electronics</Breadcrumbs.Item>
      <Breadcrumbs.Item>Laptop</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {Breadcrumbs} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <Breadcrumbs render={(props) => <ol {...props} data-custom="foo" />}>
      <Breadcrumbs.Item render={(props) => <li {...(props as any)} data-custom="bar" />}>
        Home
      </Breadcrumbs.Item>
      <Breadcrumbs.Item render={(props) => <li {...(props as any)} data-custom="bar" />}>
        Products
      </Breadcrumbs.Item>
      <Breadcrumbs.Item render={(props) => <li {...(props as any)} data-custom="bar" />}>
        Electronics
      </Breadcrumbs.Item>
      <Breadcrumbs.Item render={(props) => <li {...(props as any)} data-custom="bar" />}>
        Laptop
      </Breadcrumbs.Item>
    </Breadcrumbs>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import { Breadcrumbs } from '@heroui/react';

function CustomBreadcrumbs() {
  return (
    <Breadcrumbs className="gap-2">
      <Breadcrumbs.Item href="#" className="text-blue-600">
        Home
      </Breadcrumbs.Item>
      <Breadcrumbs.Item>Current</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}

```

### Customizing the component classes

To customize the Breadcrumbs component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .breadcrumbs {
    @apply gap-4 text-lg;
  }

  .breadcrumbs__link {
    @apply font-semibold;
  }

  .breadcrumbs__separator {
    @apply text-blue-500;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Breadcrumbs component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/breadcrumbs.css)):

#### Base Classes

* `.breadcrumbs` - Base breadcrumbs container
* `.breadcrumbs__item` - Individual breadcrumb item wrapper
* `.breadcrumbs__link` - Breadcrumb link element
* `.breadcrumbs__separator` - Separator icon between items

#### State Classes

* `.breadcrumbs__link[data-current="true"]` - Current page indicator (not a link)

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Current**: `[data-current="true"]` on link (indicates current page)
* **Hover**: Link elements support standard hover states
* **Disabled**: `isDisabled` prop disables all links

## API Reference

### Breadcrumbs Props

| Prop         | Type                                                              | Default            | Description                                                     |
| ------------ | ----------------------------------------------------------------- | ------------------ | --------------------------------------------------------------- |
| `separator`  | `ReactNode`                                                       | chevron-right icon | Custom separator between breadcrumb items                       |
| `isDisabled` | `boolean`                                                         | `false`            | Whether all breadcrumb links are disabled                       |
| `className`  | `string`                                                          | -                  | Additional CSS classes                                          |
| `children`   | `ReactNode`                                                       | -                  | The breadcrumb items                                            |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, undefined>` | -                  | Overrides the default DOM element with a custom render function |

### Breadcrumbs.Item Props

| Prop        | Type                                                                          | Default | Description                                                     |
| ----------- | ----------------------------------------------------------------------------- | ------- | --------------------------------------------------------------- |
| `href`      | `string`                                                                      | -       | The URL to link to (omit for current page)                      |
| `className` | `string`                                                                      | -       | Additional CSS classes                                          |
| `children`  | `ReactNode \| RenderFunction`                                                 | -       | Item content or render function                                 |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, BreadcrumbRenderProps>` | -       | Overrides the default DOM element with a custom render function |

## Accessibility

Breadcrumbs uses React Aria Components' Breadcrumbs primitive, which provides:

* Proper ARIA attributes for navigation landmarks
* Current page indication via `aria-current="page"`
* Keyboard navigation support
* Screen reader announcements for navigation context

The last breadcrumb item (without `href`) automatically becomes the current page indicator.
