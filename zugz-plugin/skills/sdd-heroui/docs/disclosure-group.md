# DisclosureGroup

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/disclosure-group
> Container that manages multiple Disclosure items with coordinated expanded states


## Import

```tsx
import { DisclosureGroup } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {QrCode} from "@gravity-ui/icons";
import {Button, Disclosure, DisclosureGroup, Separator} from "@heroui/react";
import {Icon} from "@iconify/react";
import React from "react";
import {cn} from "tailwind-variants";

export function Basic() {
  const [expandedKeys, setExpandedKeys] = React.useState(new Set<string | number>(["preview"]));

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col gap-4 bg-transparent p-4">
        <DisclosureGroup expandedKeys={expandedKeys} onExpandedChange={setExpandedKeys}>
          <Disclosure aria-label="Preview HeroUI Native" id="preview">
            <Disclosure.Heading>
              <Button
                slot="trigger"
                variant={expandedKeys.has("preview") ? "secondary" : "tertiary"}
                className={cn("w-full border-none", {
                  "bg-transparent": !expandedKeys.has("preview"),
                })}
              >
                <div className="flex w-full items-center justify-start gap-2">
                  <QrCode />
                  Preview HeroUI Native
                </div>
                <Disclosure.Indicator className="text-muted" />
              </Button>
            </Disclosure.Heading>
            <Disclosure.Content>
              <Disclosure.Body className="mx-2 flex flex-col items-center gap-2 p-4 text-center">
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
                  <Icon className="[&_path]:fill-accent-foreground" icon="logos:expo-icon" />
                  Preview on Expo Go
                </Button>
              </Disclosure.Body>
            </Disclosure.Content>
          </Disclosure>
          <Separator className="my-2" />
          <Disclosure id="download">
            <Disclosure.Heading aria-label="Download HeroUI Native">
              <Button
                slot="trigger"
                variant={expandedKeys.has("download") ? "secondary" : "tertiary"}
                className={cn("w-full border-none", {
                  "bg-transparent": !expandedKeys.has("download"),
                })}
              >
                <div className="flex w-full items-center justify-start gap-2">
                  <Icon icon="tabler:brand-apple-filled" />
                  Download App
                </div>
                <Disclosure.Indicator className="text-muted" />
              </Button>
            </Disclosure.Heading>
            <Disclosure.Content>
              <Disclosure.Body className="mx-2 flex flex-col items-center gap-2 p-4 text-center">
                <p className="text-sm text-muted">
                  Download the HeroUI native app to explore our mobile components directly on your
                  device.
                </p>
                <img
                  alt="App Store QR Code"
                  className="aspect-square w-full max-w-54 object-cover"
                  src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/qr-code-native.png"
                />
                <p className="text-sm text-muted">Available on iOS and Android devices.</p>
                <Button className="mt-4" variant="primary">
                  <Icon icon="tabler:brand-apple-filled" />
                  Download on App Store
                </Button>
              </Disclosure.Body>
            </Disclosure.Content>
          </Disclosure>
        </DisclosureGroup>
      </div>
    </div>
  );
}

```

### Anatomy

Import all parts and piece them together.

```tsx
import {DisclosureGroup, Disclosure} from '@heroui/react';

export default () => (
  <DisclosureGroup>
    <Disclosure id="item1">
      <Disclosure.Heading>
        <Disclosure.Trigger>
          <Disclosure.Indicator />
        </Disclosure.Trigger>
      </Disclosure.Heading>
      <Disclosure.Content />
    </Disclosure>
  </DisclosureGroup>
)

```

### Controlled

You can control which disclosures are expanded with external navigation controls using the `expandedKeys` and `onExpandedChange` props.

```tsx
"use client";

import {ChevronDown, ChevronUp, QrCode} from "@gravity-ui/icons";
import {
  Button,
  Disclosure,
  DisclosureGroup,
  Separator,
  useDisclosureGroupNavigation,
} from "@heroui/react";
import {Icon} from "@iconify/react";
import React from "react";
import {cn} from "tailwind-variants";

export function Controlled() {
  const [expandedKeys, setExpandedKeys] = React.useState(new Set<string | number>(["preview"]));
  const itemIds = ["preview", "download"]; // Track our disclosure items

  const {isNextDisabled, isPrevDisabled, onNext, onPrevious} = useDisclosureGroupNavigation({
    expandedKeys,
    itemIds,
    onExpandedChange: setExpandedKeys,
  });

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col gap-4 rounded-3xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">HeroUI Native</h3>
          <div className="flex gap-2">
            <Button
              aria-label="Previous disclosure"
              isDisabled={isPrevDisabled}
              size="sm"
              variant="secondary"
              onPress={onPrevious}
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              aria-label="Next disclosure"
              isDisabled={isNextDisabled}
              size="sm"
              variant="secondary"
              onPress={onNext}
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
        </div>
        <DisclosureGroup expandedKeys={expandedKeys} onExpandedChange={setExpandedKeys}>
          <Disclosure aria-label="Preview HeroUI Native" id="preview">
            <Disclosure.Heading>
              <Button
                slot="trigger"
                variant={expandedKeys.has("preview") ? "secondary" : "tertiary"}
                className={cn("w-full border-none", {
                  "bg-transparent": !expandedKeys.has("preview"),
                })}
              >
                <div className="flex w-full items-center justify-start gap-2">
                  <QrCode />
                  Preview HeroUI Native
                </div>
                <Disclosure.Indicator className="text-muted" />
              </Button>
            </Disclosure.Heading>
            <Disclosure.Content>
              <Disclosure.Body className="mx-2 flex flex-col items-center gap-2 p-4 text-center">
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
                  <Icon className="[&_path]:fill-accent-foreground" icon="logos:expo-icon" />
                  Preview on Expo Go
                </Button>
              </Disclosure.Body>
            </Disclosure.Content>
          </Disclosure>
          <Separator className="my-2" />
          <Disclosure id="download">
            <Disclosure.Heading aria-label="Download HeroUI Native">
              <Button
                slot="trigger"
                variant={expandedKeys.has("download") ? "secondary" : "tertiary"}
                className={cn("w-full border-none", {
                  "bg-transparent": !expandedKeys.has("download"),
                })}
              >
                <div className="flex w-full items-center justify-start gap-2">
                  <Icon icon="tabler:brand-apple-filled" />
                  Download HeroUI Native
                </div>
                <Disclosure.Indicator className="text-muted" />
              </Button>
            </Disclosure.Heading>
            <Disclosure.Content>
              <Disclosure.Body className="mx-2 flex flex-col items-center gap-2 p-4 text-center">
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
        </DisclosureGroup>
      </div>
    </div>
  );
}

```



## Related Components

* **Accordion**: Collapsible content sections
* **Disclosure**: Single collapsible content section
* **Button**: Allows a user to perform an action

## Styling

### Passing Tailwind CSS classes

```tsx
import {
  DisclosureGroup,
  Disclosure,
  DisclosureTrigger,
  DisclosurePanel
} from '@heroui/react';

function CustomDisclosureGroup() {
  return (
    <DisclosureGroup className="border rounded-lg p-4 space-y-2">
      <Disclosure id="first" className="border-b pb-2">
        <DisclosureTrigger>Item 1</DisclosureTrigger>
        <DisclosurePanel>Content 1</DisclosurePanel>
      </Disclosure>
      <Disclosure id="second">
        <DisclosureTrigger>Item 2</DisclosureTrigger>
        <DisclosurePanel>Content 2</DisclosurePanel>
      </Disclosure>
    </DisclosureGroup>
  );
}

```

### Customizing the component classes

To customize the DisclosureGroup component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .disclosure-group {
    @apply w-full;

    /* Performance optimization */
    contain: layout style;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The DisclosureGroup component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/disclosure-group.css)):

#### Base Classes

* `.disclosure-group` - Base container styles with layout containment

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Disabled**: `:disabled` or `[aria-disabled="true"]` on entire group
* **Expanded Management**: Automatically manages `[data-expanded]` states on child Disclosure items

## API Reference

### DisclosureGroup Props

| Prop                     | Type                          | Default | Description                                           |
| ------------------------ | ----------------------------- | ------- | ----------------------------------------------------- |
| `expandedKeys`           | `Set<Key>`                    | -       | The currently expanded items (controlled)             |
| `defaultExpandedKeys`    | `Iterable<Key>`               | -       | The initially expanded items (uncontrolled)           |
| `onExpandedChange`       | `(keys: Set<Key>) => void`    | -       | Handler called when expanded items change             |
| `allowsMultipleExpanded` | `boolean`                     | `false` | Whether multiple items can be expanded simultaneously |
| `isDisabled`             | `boolean`                     | `false` | Whether all disclosures in the group are disabled     |
| `children`               | `ReactNode \| RenderFunction` | -       | Disclosure items to render                            |
| `className`              | `string`                      | -       | Additional CSS classes                                |

### RenderProps

When using the render prop pattern, these values are provided:

| Prop           | Type       | Description                   |
| -------------- | ---------- | ----------------------------- |
| `expandedKeys` | `Set<Key>` | Currently expanded item keys  |
| `isDisabled`   | `boolean`  | Whether the group is disabled |
