# Separator

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/separator
> Visually divide content sections


## Import

```tsx
import { Separator } from '@heroui/react';

```

### Usage

```tsx
import {Separator} from "@heroui/react";

export function Basic() {
  return (
    <div className="max-w-md">
      <div className="space-y-1">
        <h4 className="text-medium font-medium">HeroUI v3 Components</h4>
        <p className="text-small text-default-400">Beautiful, fast and modern React UI library.</p>
      </div>
      <Separator className="my-4" />
      <div className="text-small flex h-5 items-center space-x-4">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  );
}

```

### Vertical

```tsx
import {Separator} from "@heroui/react";

export function Vertical() {
  return (
    <div className="text-small flex h-5 items-center space-x-4">
      <div>Blog</div>
      <Separator orientation="vertical" />
      <div>Docs</div>
      <Separator orientation="vertical" />
      <div>Source</div>
    </div>
  );
}

```

### With Content

```tsx
import {Separator} from "@heroui/react";

const items = [
  {
    iconUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/bell-small.png",
    subtitle: "Receive account activity updates",
    title: "Set Up Notifications",
  },
  {
    iconUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/compass-small.png",
    subtitle: "Connect your browser to your account",
    title: "Set up Browser Extension",
  },
  {
    iconUrl:
      "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/mint-collective-small.png",
    subtitle: "Create your first collectible",
    title: "Mint Collectible",
  },
];

export function WithContent() {
  return (
    <div className="max-w-md space-y-4">
      {items.map((item, index) => (
        <div key={index}>
          <div className="flex items-center gap-3">
            <img alt={item.title} className="size-12" src={item.iconUrl} />
            <div className="flex-1 space-y-0">
              <h4 className="text-small font-medium">{item.title}</h4>
              <p className="text-sm text-muted">{item.subtitle}</p>
            </div>
          </div>
          {index < items.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
}

```

### Variants

```tsx
import {Separator} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex max-w-md flex-col items-center gap-3">
      <div>Default Variant</div>
      <Separator variant="default" />
      <div>Secondary Variant</div>
      <Separator variant="secondary" />
      <div>Tertiary Variant</div>
      <Separator variant="tertiary" />
    </div>
  );
}

```

### With Surface

The Separator component adapts to different surface backgrounds for better visibility.

```tsx
import {Separator, Surface} from "@heroui/react";

export function WithSurface() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Surface className="flex min-w-[320px] flex-col gap-3 rounded-3xl p-6" variant="default">
          <h3 className="text-base font-semibold text-foreground">Default Surface</h3>
          <Separator />
          <p className="text-sm text-muted">Surface Content</p>
        </Surface>
      </div>

      <div className="flex flex-col gap-2">
        <Surface className="flex min-w-[320px] flex-col gap-3 rounded-3xl p-6" variant="secondary">
          <h3 className="text-base font-semibold text-foreground">Secondary Surface</h3>
          <Separator variant="secondary" />
          <p className="text-sm text-muted">Surface Content</p>
        </Surface>
      </div>

      <div className="flex flex-col gap-2">
        <Surface className="flex min-w-[320px] flex-col gap-3 rounded-3xl p-6" variant="tertiary">
          <h3 className="text-base font-semibold text-foreground">Tertiary Surface</h3>
          <Separator variant="tertiary" />
          <p className="text-sm text-muted">Surface Content</p>
        </Surface>
      </div>

      <div className="flex flex-col gap-2">
        <Surface
          className="flex min-w-[320px] flex-col gap-3 rounded-3xl border p-6"
          variant="transparent"
        >
          <h3 className="text-base font-semibold text-foreground">Transparent Surface</h3>
          <Separator />
          <p className="text-sm text-muted">Surface Content</p>
        </Surface>
      </div>
    </div>
  );
}

```

## Related Components

* **Card**: Content container with header, body, and footer
* **Chip**: Compact elements for tags and filters
* **Avatar**: Display user profile images

### Custom Render Function

```tsx
"use client";

import {Separator} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <div className="max-w-md">
      <div className="space-y-1">
        <h4 className="text-medium font-medium">HeroUI v3 Components</h4>
        <p className="text-small text-default-400">Beautiful, fast and modern React UI library.</p>
      </div>
      <Separator className="my-4" render={(props) => <div {...props} data-custom="foo" />} />
      <div className="text-small flex h-5 items-center space-x-4">
        <div>Blog</div>
        <Separator
          orientation="vertical"
          render={(props) => <div {...props} data-custom="foo" />}
        />
        <div>Docs</div>
        <Separator
          orientation="vertical"
          render={(props) => <div {...props} data-custom="foo" />}
        />
        <div>Source</div>
      </div>
    </div>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import {Separator} from '@heroui/react';

function CustomSeparator() {
  return (
    <Separator className="my-8 bg-linear-to-r from-transparent via-default-500 to-transparent" />
  );
}

```

### Customizing the component classes

To customize the Separator component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .separator {
    @apply bg-accent h-[2px];
  }

  .separator--vertical {
    @apply bg-accent w-[2px];
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Separator component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/separator.css)):

#### Base & Orientation Classes

* `.separator` - Base separator styles with default horizontal orientation
* `.separator--horizontal` - Horizontal orientation (full width, 1px height)
* `.separator--vertical` - Vertical orientation (full height, 1px width)

#### Variant Classes

* `.separator--default` - Default variant with standard contrast
* `.separator--secondary` - Secondary variant with medium contrast
* `.separator--tertiary` - Tertiary variant with subtle contrast

## API Reference

### Separator Props

| Prop          | Type                                                              | Default        | Description                                                      |
| ------------- | ----------------------------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'`                                      | `'horizontal'` | The orientation of the separator                                 |
| `variant`     | `'default' \| 'secondary' \| 'tertiary'`                          | `'default'`    | The visual variant of the separator                              |
| `className`   | `string`                                                          | -              | Additional CSS classes                                           |
| `render`      | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, undefined>` | -              | Overrides the default DOM element with a custom render function. |
