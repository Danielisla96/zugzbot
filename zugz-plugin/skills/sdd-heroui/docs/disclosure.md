# Disclosure

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/disclosure
> A disclosure is a collapsible section with a header containing a heading and a trigger button, and a panel that wraps the content.


## Import

```tsx
import { Disclosure } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {QrCode} from "@gravity-ui/icons";
import {Button, Disclosure} from "@heroui/react";
import {Icon} from "@iconify/react";
import React from "react";

export function Basic() {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="w-full max-w-md text-center">
      <Disclosure isExpanded={isExpanded} onExpandedChange={setIsExpanded}>
        <Disclosure.Heading>
          <Button slot="trigger" variant="secondary">
            <QrCode />
            Preview HeroUI Native
            <Disclosure.Indicator />
          </Button>
        </Disclosure.Heading>
        <Disclosure.Content>
          <Disclosure.Body className="shadow-panel flex flex-col items-center rounded-3xl bg-surface p-4 text-center">
            <p className="text-sm text-muted">
              Scan this QR code with your camera app to preview the HeroUI native components.
            </p>
            <img
              alt="Expo Go QR Code"
              className="aspect-square w-full max-w-54 object-cover"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/qr-code-native.png"
            />
            <p className="text-sm text-muted">Expo must be installed on your device.</p>
            <Button className="mt-4" variant="primary">
              <Icon icon="tabler:brand-apple-filled" />
              Download on App Store
            </Button>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}

```

### Anatomy

Import the Disclosure component and access all parts using dot notation.

```tsx
import { Disclosure } from '@heroui/react';

export default () => (
  <Disclosure>
    <Disclosure.Heading>
      <Disclosure.Trigger>
        <Disclosure.Indicator />
      </Disclosure.Trigger>
    </Disclosure.Heading>
    <Disclosure.Content/>
  </Disclosure>
)

```



## Related Components

* **Accordion**: Collapsible content sections
* **DisclosureGroup**: Group of collapsible panels
* **Button**: Allows a user to perform an action

### Custom Render Function

```tsx
"use client";

import {QrCode} from "@gravity-ui/icons";
import {Button, Disclosure} from "@heroui/react";
import {Icon} from "@iconify/react";
import React from "react";

export function CustomRenderFunction() {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="w-full max-w-md text-center">
      <Disclosure
        isExpanded={isExpanded}
        render={(props) => <div {...props} data-custom="foo" />}
        onExpandedChange={setIsExpanded}
      >
        <Disclosure.Heading>
          <Button slot="trigger" variant="secondary">
            <QrCode />
            Preview HeroUI Native
            <Disclosure.Indicator />
          </Button>
        </Disclosure.Heading>
        <Disclosure.Content render={(props) => <div data-custom="bar" {...props} />}>
          <Disclosure.Body className="shadow-panel flex flex-col items-center rounded-3xl bg-surface p-4 text-center">
            <p className="text-sm text-muted">
              Scan this QR code with your camera app to preview the HeroUI native components.
            </p>
            <img
              alt="Expo Go QR Code"
              className="aspect-square w-full max-w-54 object-cover"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/qr-code-native.png"
            />
            <p className="text-sm text-muted">Expo must be installed on your device.</p>
            <Button className="mt-4" variant="primary">
              <Icon icon="tabler:brand-apple-filled" />
              Download on App Store
            </Button>
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </div>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import { Disclosure } from '@heroui/react';

function CustomDisclosure() {
  return (
    <Disclosure className="border rounded-lg p-4">
      <Disclosure.Heading>
        <Disclosure.Trigger className="text-lg font-semibold">
          Click to expand
          <Disclosure.Indicator />
        </Disclosure.Trigger>
      </Disclosure.Heading>
      <Disclosure.Content>
        <Disclosure.Body className="mt-4 text-gray-600">
          Hidden content
        </Disclosure.Body>
      </Disclosure.Content>
    </Disclosure>
  );
}

```

### Customizing the component classes

To customize the Disclosure component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .disclosure {
    @apply relative;
  }

  .disclosure__trigger {
    @apply cursor-pointer;
  }

  .disclosure__indicator {
    @apply transition-transform duration-300;
  }

  .disclosure__content {
    @apply overflow-hidden transition-all;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Disclosure component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/disclosure.css)):

#### Base Classes

* `.disclosure` - Base container styles
* `.disclosure__heading` - Heading wrapper
* `.disclosure__trigger` - Trigger button styles
* `.disclosure__indicator` - Chevron indicator styles
* `.disclosure__content` - Content container with animations

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Expanded**: `[data-expanded="true"]` on indicator for rotation
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` on trigger
* **Disabled**: `:disabled` or `[aria-disabled="true"]` on trigger
* **Hidden**: `[aria-hidden="false"]` on content for visibility

## API Reference

### Disclosure Props

| Prop               | Type                                                                          | Default | Description                                                      |
| ------------------ | ----------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `isExpanded`       | `boolean`                                                                     | `false` | Controls the expanded state                                      |
| `onExpandedChange` | `(isExpanded: boolean) => void`                                               | -       | Callback when expanded state changes                             |
| `isDisabled`       | `boolean`                                                                     | `false` | Whether the disclosure is disabled                               |
| `children`         | `ReactNode \| RenderFunction`                                                 | -       | Content to render                                                |
| `className`        | `string`                                                                      | -       | Additional CSS classes                                           |
| `render`           | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, DisclosureRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### DisclosureTrigger Props

| Prop        | Type                          | Default | Description            |
| ----------- | ----------------------------- | ------- | ---------------------- |
| `children`  | `ReactNode \| RenderFunction` | -       | Trigger content        |
| `className` | `string`                      | -       | Additional CSS classes |

### DisclosureContent Props

| Prop        | Type                                                                                 | Default | Description                                                      |
| ----------- | ------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------- |
| `children`  | `ReactNode`                                                                          | -       | Content to show/hide                                             |
| `className` | `string`                                                                             | -       | Additional CSS classes                                           |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, DisclosureContentRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### RenderProps

When using the render prop pattern, these values are provided:

| Prop         | Type      | Description                    |
| ------------ | --------- | ------------------------------ |
| `isExpanded` | `boolean` | Current expanded state         |
| `isDisabled` | `boolean` | Whether disclosure is disabled |
