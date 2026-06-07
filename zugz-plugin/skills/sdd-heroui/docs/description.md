# Description

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/description
> Provides supplementary text for form fields and other components


## Import

```tsx
import { Description } from '@heroui/react';

```

## Usage

```tsx
import {Description, Input, Label} from "@heroui/react";

export function Basic() {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor="email">Email</Label>
      <Input
        aria-describedby="email-description"
        className="w-64"
        id="email"
        placeholder="you@example.com"
        type="email"
      />
      <Description id="email-description">
        We'll never share your email with anyone else.
      </Description>
    </div>
  );
}

```

## Related Components

* **TextField**: Composition-friendly fields with labels and validation
* **Input**: Single-line text input built on React Aria
* **TextArea**: Multiline text input with focus management

## API

### Description Props

| Prop        | Type        | Default | Description                    |
| ----------- | ----------- | ------- | ------------------------------ |
| `className` | `string`    | -       | Additional CSS classes         |
| `children`  | `ReactNode` | -       | The content of the description |

## Accessibility

The Description component enhances accessibility by:

* Using semantic HTML that screen readers can identify
* Providing the `slot="description"` attribute for React Aria integration
* Supporting proper text contrast ratios

## Styling

The Description component uses the following CSS classes:

* `.description` - Base description styles with `muted` text color

## Examples

### With Form Fields

```tsx
<div className="flex flex-col gap-1">
  <Label htmlFor="password">Password</Label>
  <Input id="password" type="password" aria-describedby="password-description" />
  <Description id="password-description">
    Must be at least 8 characters with one uppercase letter
  </Description>
</div>

```

### Integration with TextField

```tsx
import {TextField, Label, Input, Description} from '@heroui/react';

<TextField type="email">
  <Label>Email</Label>
  <Input placeholder="Enter your email" />
  <Description>We'll never share your email</Description>
</TextField>

```

When using the [TextField](./text-field) component, accessibility attributes are automatically applied to the label and description.
