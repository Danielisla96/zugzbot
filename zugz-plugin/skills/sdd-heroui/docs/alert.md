# Alert

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/alert
> Display important messages and notifications to users with status indicators


## Import

```tsx
import { Alert } from '@heroui/react';

```

### Usage

```tsx
import {Alert, Button, CloseButton, Spinner} from "@heroui/react";
import React from "react";

export function Basic() {
  return (
    <div className="grid w-full max-w-xl gap-4">
      {/* Default - General information */}
      <Alert>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>New features available</Alert.Title>
          <Alert.Description>
            Check out our latest updates including dark mode support and improved accessibility
            features.
          </Alert.Description>
        </Alert.Content>
      </Alert>

      {/* Accent - Important information with action */}
      <Alert status="accent">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Update available</Alert.Title>
          <Alert.Description>
            A new version of the application is available. Please refresh to get the latest features
            and bug fixes.
          </Alert.Description>
          <Button className="mt-2 sm:hidden" size="sm" variant="primary">
            Refresh
          </Button>
        </Alert.Content>
        <Button className="hidden sm:block" size="sm" variant="primary">
          Refresh
        </Button>
      </Alert>

      {/* Danger - Error with detailed steps */}
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Unable to connect to server</Alert.Title>
          <Alert.Description>
            We're experiencing connection issues. Please try the following:
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
            </ul>
          </Alert.Description>
          <Button className="mt-2 sm:hidden" size="sm" variant="danger">
            Retry
          </Button>
        </Alert.Content>
        <Button className="hidden sm:block" size="sm" variant="danger">
          Retry
        </Button>
      </Alert>

      {/* Without description */}
      <Alert status="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Profile updated successfully</Alert.Title>
        </Alert.Content>
        <CloseButton />
      </Alert>

      {/* Custom indicator - Loading state */}
      <Alert status="accent">
        <Alert.Indicator>
          <Spinner size="sm" />
        </Alert.Indicator>
        <Alert.Content>
          <Alert.Title>Processing your request</Alert.Title>
          <Alert.Description>
            Please wait while we sync your data. This may take a few moments.
          </Alert.Description>
        </Alert.Content>
      </Alert>

      {/* Without close button */}
      <Alert status="warning">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Scheduled maintenance</Alert.Title>
          <Alert.Description>
            Our services will be unavailable on Sunday, March 15th from 2:00 AM to 6:00 AM UTC for
            scheduled maintenance.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    </div>
  );
}

```

### Anatomy

Import the Alert component and access all parts using dot notation.

```tsx
import { Alert } from '@heroui/react';

export default () => (
  <Alert>
    <Alert.Indicator />
    <Alert.Content>
      <Alert.Title />
      <Alert.Description />
    </Alert.Content>
  </Alert>
)

```

## Related Components

* **CloseButton**: Button for dismissing overlays
* **Button**: Allows a user to perform an action
* **Spinner**: Loading indicator

## Styling

### Passing Tailwind CSS classes

```tsx
import { Alert } from "@heroui/react";

function CustomAlert() {
  return (
    <Alert className="border-2 border-blue-500 rounded-xl" status="accent">
      <Alert.Indicator className="text-blue-600" />
      <Alert.Content className="gap-1">
        <Alert.Title className="font-bold text-lg">Custom Alert</Alert.Title>
        <Alert.Description className="text-sm opacity-80">
          This alert has custom styling applied
        </Alert.Description>
      </Alert.Content>
    </Alert>
  );
}

```

### Customizing the component classes

To customize the Alert component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .alert {
    @apply rounded-2xl shadow-lg;
  }

  .alert__title {
    @apply font-bold text-lg;
  }

  .alert--danger {
    @apply border-l-4 border-red-600;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Alert component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/alert.css)):

#### Base Classes

* `.alert` - Base alert container
* `.alert__indicator` - Icon/indicator container
* `.alert__content` - Content wrapper for title and description
* `.alert__title` - Alert title text
* `.alert__description` - Alert description text

#### Status Variant Classes

* `.alert--default` - Default gray status
* `.alert--accent` - Accent blue status
* `.alert--success` - Success green status
* `.alert--warning` - Warning yellow/orange status
* `.alert--danger` - Danger red status

### Interactive States

The Alert component is primarily informational and doesn't have interactive states on the base component. However, it can contain interactive elements like buttons or close buttons.

## API Reference

### Alert Props

| Prop        | Type                                                          | Default     | Description                    |
| ----------- | ------------------------------------------------------------- | ----------- | ------------------------------ |
| `status`    | `"default" \| "accent" \| "success" \| "warning" \| "danger"` | `"default"` | The visual status of the alert |
| `className` | `string`                                                      | -           | Additional CSS classes         |
| `children`  | `ReactNode`                                                   | -           | The alert content              |

### Alert.Indicator Props

| Prop        | Type        | Default | Description                                     |
| ----------- | ----------- | ------- | ----------------------------------------------- |
| `className` | `string`    | -       | Additional CSS classes                          |
| `children`  | `ReactNode` | -       | Custom indicator icon (defaults to status icon) |

### Alert.Content Props

| Prop        | Type        | Default | Description                               |
| ----------- | ----------- | ------- | ----------------------------------------- |
| `className` | `string`    | -       | Additional CSS classes                    |
| `children`  | `ReactNode` | -       | Content (typically Title and Description) |

### Alert.Title Props

| Prop        | Type        | Default | Description            |
| ----------- | ----------- | ------- | ---------------------- |
| `className` | `string`    | -       | Additional CSS classes |
| `children`  | `ReactNode` | -       | The alert title text   |

### Alert.Description Props

| Prop        | Type        | Default | Description                |
| ----------- | ----------- | ------- | -------------------------- |
| `className` | `string`    | -       | Additional CSS classes     |
| `children`  | `ReactNode` | -       | The alert description text |
