# Tabs

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/tabs
> Tabs organize content into multiple sections and allow users to navigate between them.


## Import

```tsx
import { Tabs } from '@heroui/react';

```

### Usage



### Anatomy

Import the Tabs component and access all parts using dot notation.

```tsx
import { Tabs } from '@heroui/react';

export default () => (
  <Tabs>
    <Tabs.ListContainer>
      <Tabs.List aria-label="Options">
        <Tabs.Tab>
          <Tabs.Separator /> {/* Optional */}
          <Tabs.Indicator />
        </Tabs.Tab>
      </Tabs.List>
    </Tabs.ListContainer>
    <Tabs.Panel/>
  </Tabs>
)

```

### Vertical



### Disabled Tab



### With Separator

Add `<Tabs.Separator />` inside each `<Tabs.Tab>` (except the first) to display separator lines between tabs.



### Custom Styles



### Secondary Variant



### Secondary Variant Vertical





## Related Components

* **Breadcrumbs**: Display the user's current location within a hierarchy

### Custom Render Function

```tsx
"use client";

import {Tabs} from "@heroui/react";
import Link from "next/link";

export function CustomRenderFunction() {
  return (
    <Tabs className="w-full max-w-md" render={(props) => <div {...props} data-custom="foo" />}>
      <Tabs.ListContainer>
        <Tabs.List aria-label="Options">
          <Tabs.Tab
            href="/docs/react/getting-started"
            id="getting-started"
            render={(domProps: any) => <Link {...domProps} />}
          >
            Getting Started
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab
            href="/docs/react/components"
            id="components"
            render={(domProps: any) => <Link {...domProps} />}
          >
            Components
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab
            href="/docs/react/releases"
            id="releases"
            render={(domProps: any) => <Link {...domProps} />}
          >
            Releases
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel className="pt-4" id="overview">
        <p>View your project overview and recent activity.</p>
      </Tabs.Panel>
      <Tabs.Panel className="pt-4" id="analytics">
        <p>Track your metrics and analyze performance data.</p>
      </Tabs.Panel>
      <Tabs.Panel className="pt-4" id="reports">
        <p>Generate and download detailed reports.</p>
      </Tabs.Panel>
    </Tabs>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx

import { Tabs } from '@heroui/react';

function CustomTabs() {
  return (
    <Tabs className="w-full max-w-lg text-center">
      <Tabs.ListContainer>
        <Tabs.List
          aria-label="Options"
          className="*:data-[selected=true]:text-accent-foreground w-fit *:h-6 *:w-fit *:px-3 *:text-sm *:font-normal"
        >
          <Tabs.Tab id="daily">Daily<Tabs.Indicator /></Tabs.Tab>
          <Tabs.Tab id="weekly">Weekly<Tabs.Indicator /></Tabs.Tab>
          <Tabs.Tab id="bi-weekly">Bi-Weekly<Tabs.Indicator /></Tabs.Tab>
          <Tabs.Tab id="monthly">Monthly<Tabs.Indicator /></Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel className="px-4" id="daily">
        <h3 className="mb-2 font-semibold">Daily</h3>
        <p className="text-sm text-gray-600">Manage your daily tasks and goals.</p>
      </Tabs.Panel>
      <Tabs.Panel className="px-4" id="weekly">
        <h3 className="mb-2 font-semibold">Weekly</h3>
        <p className="text-sm text-gray-600">Manage your weekly tasks and goals.</p>
      </Tabs.Panel>
      <Tabs.Panel className="px-4" id="bi-weekly">
        <h3 className="mb-2 font-semibold">Bi-Weekly</h3>
        <p className="text-sm text-gray-600">Manage your bi-weekly tasks and goals.</p>
      </Tabs.Panel>
      <Tabs.Panel className="px-4" id="monthly">
        <h3 className="mb-2 font-semibold">Monthly</h3>
        <p className="text-sm text-gray-600">Manage your monthly tasks and goals.</p>
      </Tabs.Panel>
    </Tabs>
  );
}

```

### CSS Classes

The Tabs component uses these CSS classes:

#### Base Classes

* `.tabs` - Base tabs container
* `.tabs__list-container` - Tab list container wrapper
* `.tabs__list` - Tab list container
* `.tabs__tab` - Individual tab button
* `.tabs__separator` - Separator between tabs
* `.tabs__panel` - Tab panel content
* `.tabs__indicator` - Tab indicator

#### Orientation Attributes

* `.tabs[data-orientation="horizontal"]` - Horizontal tab layout (default)
* `.tabs[data-orientation="vertical"]` - Vertical tab layout

#### Variant Classes

* `.tabs--secondary` - Secondary variant with underline indicator

### Interactive States

The component supports both CSS pseudo-classes and data attributes:

* **Selected**: `[aria-selected="true"]`
* **Hover**: `:hover` or `[data-hovered="true"]`
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]`
* **Disabled**: `[aria-disabled="true"]`

## API Reference

### Tabs Props

| Prop                 | Type                                                                    | Default        | Description                                                                                  |
| -------------------- | ----------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `variant`            | `"primary" \| "secondary"`                                              | `"primary"`    | Visual style variant. Primary uses a filled indicator, secondary uses an underline indicator |
| `orientation`        | `"horizontal" \| "vertical"`                                            | `"horizontal"` | Tab layout orientation                                                                       |
| `selectedKey`        | `string`                                                                | -              | Controlled selected tab key                                                                  |
| `defaultSelectedKey` | `string`                                                                | -              | Default selected tab key                                                                     |
| `onSelectionChange`  | `(key: Key) => void`                                                    | -              | Selection change handler                                                                     |
| `className`          | `string`                                                                | -              | Additional CSS classes                                                                       |
| `render`             | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, TabsRenderProps>` | -              | Overrides the default DOM element with a custom render function.                             |

### Tabs.List Props

| Prop         | Type                                                                       | Default | Description                                                      |
| ------------ | -------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `aria-label` | `string`                                                                   | -       | Accessibility label for tab list                                 |
| `className`  | `string`                                                                   | -       | Additional CSS classes                                           |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, TabListRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### Tabs.Tab Props

| Prop         | Type                                                                   | Default | Description                                                      |
| ------------ | ---------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `id`         | `string`                                                               | -       | Unique tab identifier                                            |
| `isDisabled` | `boolean`                                                              | `false` | Whether tab is disabled                                          |
| `className`  | `string`                                                               | -       | Additional CSS classes                                           |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, TabRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### Tabs.Separator Props

| Prop        | Type     | Default | Description            |
| ----------- | -------- | ------- | ---------------------- |
| `className` | `string` | -       | Additional CSS classes |

### Tabs.Panel Props

| Prop        | Type                                                                        | Default | Description                                                      |
| ----------- | --------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `id`        | `string`                                                                    | -       | Panel identifier matching tab id                                 |
| `className` | `string`                                                                    | -       | Additional CSS classes                                           |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, TabPanelRenderProps>` | -       | Overrides the default DOM element with a custom render function. |
