# FieldError

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/field-error
> Displays validation error messages for form fields


## Import

```tsx
import { FieldError } from '@heroui/react';

```

## Usage

The FieldError component displays validation error messages for form fields. It automatically appears when the parent field is marked as invalid and provides smooth opacity transitions.

```tsx
"use client";

import {FieldError, Input, Label, TextField} from "@heroui/react";
import {useState} from "react";

export function Basic() {
  const [value, setValue] = useState("jr");
  const isInvalid = value.length > 0 && value.length < 3;

  return (
    <TextField className="w-64" isInvalid={isInvalid}>
      <Label htmlFor="username">Username</Label>
      <Input
        id="username"
        placeholder="Enter username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <FieldError>Username must be at least 3 characters</FieldError>
    </TextField>
  );
}

```

## Related Components

* **TextField**: Composition-friendly fields with labels and validation
* **Input**: Single-line text input built on React Aria
* **TextArea**: Multiline text input with focus management

## API

### FieldError Props

| Prop        | Type                                                         | Default | Description                              |
| ----------- | ------------------------------------------------------------ | ------- | ---------------------------------------- |
| `className` | `string`                                                     | -       | Additional CSS classes                   |
| `children`  | `ReactNode \| ((validation: ValidationResult) => ReactNode)` | -       | Error message content or render function |

## Accessibility

The FieldError component ensures accessibility by:

* Using proper ARIA attributes for error announcement
* Supporting screen readers with semantic HTML
* Providing visual and programmatic error indication
* Automatically managing visibility based on validation state

## Styling

The FieldError component uses the following CSS classes:

* `.field-error` - Base error styles with danger color
* Only shows when the `data-visible` attribute is present
* Text is truncated with ellipsis for long messages

## Examples

### Basic Validation

```tsx
export function Basic() {
  const [value, setValue] = useState("");
  const isInvalid = value.length > 0 && value.length < 3;

  return (
    <TextField className="w-64" isInvalid={isInvalid}>
      <Label htmlFor="username">Username</Label>
      <Input
        id="username"
        placeholder="Enter username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <FieldError>Username must be at least 3 characters</FieldError>
    </TextField>
  );
}

```

### With Dynamic Messages

```tsx
<TextField isInvalid={errors.length > 0}>
  <Label>Password</Label>
  <Input type="password" />
  <FieldError>
    {(validation) => validation.validationErrors.join(', ')}
  </FieldError>
</TextField>

```

### Custom Validation Logic

```tsx
function EmailField() {
  const [email, setEmail] = useState('');
  const isInvalid = email.length > 0 && !email.includes('@');

  return (
    <TextField isInvalid={isInvalid}>
      <Label>Email</Label>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <FieldError>Email must include @ symbol</FieldError>
    </TextField>
  );
}

```

### Multiple Error Messages

```tsx
<TextField isInvalid={hasErrors}>
  <Label>Username</Label>
  <Input />
  <FieldError>
    {errors.map((error, i) => (
      <div key={i}>{error}</div>
    ))}
  </FieldError>
</TextField>
```
