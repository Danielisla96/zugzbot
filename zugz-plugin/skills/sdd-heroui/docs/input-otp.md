# InputOTP

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/input-otp
> A one-time password input component for verification codes and secure authentication


## Import

```tsx
import { InputOTP } from '@heroui/react';

```

### Usage

```tsx
import {InputOTP, Label, Link} from "@heroui/react";

export function Basic() {
  return (
    <div className="flex w-[280px] flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label>Verify account</Label>
        <p className="text-sm text-muted">We&apos;ve sent a code to a****@gmail.com</p>
      </div>
      <InputOTP maxLength={6}>
        <InputOTP.Group>
          <InputOTP.Slot index={0} />
          <InputOTP.Slot index={1} />
          <InputOTP.Slot index={2} />
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group>
          <InputOTP.Slot index={3} />
          <InputOTP.Slot index={4} />
          <InputOTP.Slot index={5} />
        </InputOTP.Group>
      </InputOTP>
      <div className="flex items-center gap-[5px] px-1 pt-1">
        <p className="text-sm text-muted">Didn&apos;t receive a code?</p>
        <Link className="text-foreground underline" href="#">
          Resend
        </Link>
      </div>
    </div>
  );
}

```

### Anatomy

Import the InputOTP component and access all parts using dot notation.

```tsx
import { InputOTP } from '@heroui/react';

export default () => (
  <InputOTP maxLength={6}>
    <InputOTP.Group>
      <InputOTP.Slot index={0} />
      <InputOTP.Slot index={1} />
      {/* ...rest of the slots */}
    </InputOTP.Group>
    <InputOTP.Separator />
    <InputOTP.Group>
      <InputOTP.Slot index={3} />
      {/* ...rest of the slots */}
    </InputOTP.Group>
  </InputOTP>
)

```

> **InputOTP** is built on top of [input-otp](https://github.com/guilhermerodz/input-otp) by [@guilherme\_rodz](https://twitter.com/guilherme_rodz), providing a flexible and accessible foundation for OTP input components.

### Four Digits

```tsx
import {InputOTP, Label} from "@heroui/react";

export function FourDigits() {
  return (
    <div className="flex w-[280px] flex-col gap-2">
      <Label>Enter PIN</Label>
      <InputOTP maxLength={4}>
        <InputOTP.Group>
          <InputOTP.Slot index={0} />
          <InputOTP.Slot index={1} />
          <InputOTP.Slot index={2} />
          <InputOTP.Slot index={3} />
        </InputOTP.Group>
      </InputOTP>
    </div>
  );
}

```

### Disabled State

```tsx
import {Description, InputOTP, Label} from "@heroui/react";

export function Disabled() {
  return (
    <div className="flex w-[280px] flex-col gap-2">
      <Label isDisabled>Verify account</Label>
      <Description>Code verification is currently disabled</Description>
      <InputOTP isDisabled maxLength={6}>
        <InputOTP.Group>
          <InputOTP.Slot index={0} />
          <InputOTP.Slot index={1} />
          <InputOTP.Slot index={2} />
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group>
          <InputOTP.Slot index={3} />
          <InputOTP.Slot index={4} />
          <InputOTP.Slot index={5} />
        </InputOTP.Group>
      </InputOTP>
    </div>
  );
}

```

### With Pattern

Use the `pattern` prop to restrict input to specific characters. HeroUI exports common patterns like `REGEXP_ONLY_CHARS` and `REGEXP_ONLY_DIGITS`.

```tsx
import {Description, InputOTP, Label, REGEXP_ONLY_CHARS} from "@heroui/react";

export function WithPattern() {
  return (
    <div className="flex w-[280px] flex-col gap-2">
      <Label>Enter code (letters only)</Label>
      <Description>Only alphabetic characters are allowed</Description>
      <InputOTP maxLength={6} pattern={REGEXP_ONLY_CHARS}>
        <InputOTP.Group>
          <InputOTP.Slot index={0} />
          <InputOTP.Slot index={1} />
          <InputOTP.Slot index={2} />
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group>
          <InputOTP.Slot index={3} />
          <InputOTP.Slot index={4} />
          <InputOTP.Slot index={5} />
        </InputOTP.Group>
      </InputOTP>
    </div>
  );
}

```

### Controlled

Control the value to synchronize with state, clear the input, or implement custom validation.

```tsx
"use client";

import {Description, InputOTP, Label} from "@heroui/react";
import React from "react";

export function Controlled() {
  const [value, setValue] = React.useState("");

  return (
    <div className="flex w-[280px] flex-col gap-2">
      <Label>Verify account</Label>
      <InputOTP maxLength={6} value={value} onChange={setValue}>
        <InputOTP.Group>
          <InputOTP.Slot index={0} />
          <InputOTP.Slot index={1} />
          <InputOTP.Slot index={2} />
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group>
          <InputOTP.Slot index={3} />
          <InputOTP.Slot index={4} />
          <InputOTP.Slot index={5} />
        </InputOTP.Group>
      </InputOTP>
      <Description>
        {value.length > 0 ? (
          <>
            Value: {value} ({value.length}/6) •{" "}
            <button className="font-medium text-foreground underline" onClick={() => setValue("")}>
              Clear
            </button>
          </>
        ) : (
          "Enter a 6-digit code"
        )}
      </Description>
    </div>
  );
}

```

### With Validation

Use `isInvalid` together with validation messages to surface errors.

```tsx
"use client";

import {Button, Description, Form, InputOTP, Label} from "@heroui/react";
import React from "react";

export function WithValidation() {
  const [value, setValue] = React.useState("");
  const [isInvalid, setIsInvalid] = React.useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get("code");

    if (code !== "123456") {
      setIsInvalid(true);

      return;
    }

    setIsInvalid(false);
    setValue("");

    alert("Code verified successfully!");
  };

  const handleChange = (val: string) => {
    setValue(val);
    setIsInvalid(false);
  };

  return (
    <div className="flex w-[280px] flex-col gap-2">
      <Form className="flex flex-col gap-2" onSubmit={onSubmit}>
        <Label>Verify account</Label>
        <Description>Hint: The code is 123456</Description>
        <InputOTP
          aria-describedby={isInvalid ? "code-error" : undefined}
          isInvalid={isInvalid}
          maxLength={6}
          name="code"
          value={value}
          onChange={handleChange}
        >
          <InputOTP.Group>
            <InputOTP.Slot index={0} />
            <InputOTP.Slot index={1} />
            <InputOTP.Slot index={2} />
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group>
            <InputOTP.Slot index={3} />
            <InputOTP.Slot index={4} />
            <InputOTP.Slot index={5} />
          </InputOTP.Group>
        </InputOTP>
        <span className="field-error" data-visible={isInvalid} id="code-error">
          Invalid code. Please try again.
        </span>
        <Button isDisabled={value.length !== 6} type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
}

```

### On Complete

Use the `onComplete` callback to trigger actions when all slots are filled.

```tsx
"use client";

import {Button, Form, InputOTP, Label, Spinner} from "@heroui/react";
import React from "react";

export function OnComplete() {
  const [value, setValue] = React.useState("");
  const [isComplete, setIsComplete] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleComplete = (code: string) => {
    setIsComplete(true);

    console.log("Code complete:", code);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setValue("");
      setIsComplete(false);
    }, 2000);
  };

  return (
    <Form className="flex w-[280px] flex-col gap-2" onSubmit={handleSubmit}>
      <Label>Verify account</Label>
      <InputOTP
        maxLength={6}
        value={value}
        onComplete={handleComplete}
        onChange={(val) => {
          setValue(val);
          setIsComplete(false);
        }}
      >
        <InputOTP.Group>
          <InputOTP.Slot index={0} />
          <InputOTP.Slot index={1} />
          <InputOTP.Slot index={2} />
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group>
          <InputOTP.Slot index={3} />
          <InputOTP.Slot index={4} />
          <InputOTP.Slot index={5} />
        </InputOTP.Group>
      </InputOTP>
      <Button
        className="mt-2 w-full"
        isDisabled={!isComplete}
        isPending={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? (
          <>
            <Spinner color="current" size="sm" />
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </Button>
    </Form>
  );
}

```

### Form Example

A complete two-factor authentication form with validation and submission.

```tsx
"use client";

import {Button, Description, Form, InputOTP, Label, Link, Spinner} from "@heroui/react";
import React from "react";

export function FormExample() {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (value.length !== 6) {
      setError("Please enter all 6 digits");

      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      if (value === "123456") {
        console.log("Code verified successfully!");
        setValue("");
      } else {
        setError("Invalid code. Please try again.");
      }
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Form className="flex w-[280px] flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label>Two-factor authentication</Label>
        <Description>Enter the 6-digit code from your authenticator app</Description>
        <InputOTP
          isInvalid={!!error}
          maxLength={6}
          value={value}
          onChange={(val) => {
            setValue(val);
            setError("");
          }}
        >
          <InputOTP.Group>
            <InputOTP.Slot index={0} />
            <InputOTP.Slot index={1} />
            <InputOTP.Slot index={2} />
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group>
            <InputOTP.Slot index={3} />
            <InputOTP.Slot index={4} />
            <InputOTP.Slot index={5} />
          </InputOTP.Group>
        </InputOTP>
        <span className="field-error" data-visible={!!error} id="code-error">
          {error}
        </span>
      </div>
      <Button
        className="w-full"
        isDisabled={value.length !== 6}
        isPending={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? (
          <>
            <Spinner color="current" size="sm" />
            Verifying...
          </>
        ) : (
          "Verify"
        )}
      </Button>
      <div className="flex items-center justify-center gap-1">
        <p className="text-sm text-muted">Having trouble?</p>
        <Link className="text-sm text-foreground underline" href="#">
          Use backup code
        </Link>
      </div>
    </Form>
  );
}

```

### Variants

The InputOTP component supports two visual variants:

* **`primary`** (default) - Standard styling with shadow, suitable for most use cases
* **`secondary`** - Lower emphasis variant without shadow, suitable for use in Surface components

```tsx
import {InputOTP, Label} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Primary variant</Label>
        <InputOTP maxLength={6} variant="primary">
          <InputOTP.Group>
            <InputOTP.Slot index={0} />
            <InputOTP.Slot index={1} />
            <InputOTP.Slot index={2} />
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group>
            <InputOTP.Slot index={3} />
            <InputOTP.Slot index={4} />
            <InputOTP.Slot index={5} />
          </InputOTP.Group>
        </InputOTP>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Secondary variant</Label>
        <InputOTP maxLength={6} variant="secondary">
          <InputOTP.Group>
            <InputOTP.Slot index={0} />
            <InputOTP.Slot index={1} />
            <InputOTP.Slot index={2} />
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group>
            <InputOTP.Slot index={3} />
            <InputOTP.Slot index={4} />
            <InputOTP.Slot index={5} />
          </InputOTP.Group>
        </InputOTP>
      </div>
    </div>
  );
}

```

### In Surface

When used inside a [Surface](/docs/components/surface) component, use `variant="secondary"` to apply the lower emphasis variant suitable for surface backgrounds.

```tsx
import {InputOTP, Label, Link, Surface} from "@heroui/react";

export function OnSurface() {
  return (
    <Surface className="flex w-full flex-col gap-2 rounded-3xl p-6">
      <div className="flex flex-col gap-1">
        <Label>Verify account</Label>
        <p className="text-sm text-muted">We&apos;ve sent a code to a****@gmail.com</p>
      </div>
      <InputOTP maxLength={6} variant="secondary">
        <InputOTP.Group>
          <InputOTP.Slot index={0} />
          <InputOTP.Slot index={1} />
          <InputOTP.Slot index={2} />
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group>
          <InputOTP.Slot index={3} />
          <InputOTP.Slot index={4} />
          <InputOTP.Slot index={5} />
        </InputOTP.Group>
      </InputOTP>
      <div className="flex items-center gap-[5px] px-1 pt-1">
        <p className="text-sm text-muted">Didn&apos;t receive a code?</p>
        <Link className="text-foreground underline" href="#">
          Resend
        </Link>
      </div>
    </Surface>
  );
}

```

## Related Components

* **Input**: Single-line text input built on React Aria
* **Form**: Form validation and submission handling
* **Surface**: Base container surface

## Styling

### Passing Tailwind CSS classes

```tsx
import {InputOTP, Label} from '@heroui/react';

function CustomInputOTP() {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-semibold">Enter verification code</Label>
      <InputOTP
        className="gap-3"
        containerClassName="gap-4"
        maxLength={6}
      >
        <InputOTP.Group className="gap-3">
          <InputOTP.Slot
            className="size-12 rounded-lg border-2 text-lg font-bold"
            index={0}
          />
          <InputOTP.Slot
            className="size-12 rounded-lg border-2 text-lg font-bold"
            index={1}
          />
          <InputOTP.Slot
            className="size-12 rounded-lg border-2 text-lg font-bold"
            index={2}
          />
        </InputOTP.Group>
        <InputOTP.Separator className="bg-border h-1 w-2 rounded-full" />
        <InputOTP.Group className="gap-3">
          <InputOTP.Slot
            className="size-12 rounded-lg border-2 text-lg font-bold"
            index={3}
          />
          <InputOTP.Slot
            className="size-12 rounded-lg border-2 text-lg font-bold"
            index={4}
          />
          <InputOTP.Slot
            className="size-12 rounded-lg border-2 text-lg font-bold"
            index={5}
          />
        </InputOTP.Group>
      </InputOTP>
    </div>
  );
}

```

### Customizing the component classes

To customize the InputOTP component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .input-otp {
    @apply gap-3;
  }

  .input-otp__slot {
    @apply size-12 rounded-xl border-2 font-bold;
  }

  .input-otp__slot[data-active="true"] {
    @apply border-primary-500 ring-2 ring-primary-200;
  }

  .input-otp__separator {
    @apply w-2 h-1 bg-border-strong rounded-full;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The InputOTP component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/input-otp.css)):

#### Base Classes

* `.input-otp` - Base container
* `.input-otp__container` - Inner container from input-otp library
* `.input-otp__group` - Group of slots
* `.input-otp__slot` - Individual input slot
* `.input-otp__slot-value` - The character inside a slot
* `.input-otp__caret` - Blinking caret indicator
* `.input-otp__separator` - Visual separator between groups

#### State Classes

* `.input-otp__slot[data-active="true"]` - Currently active slot
* `.input-otp__slot[data-filled="true"]` - Slot with a character
* `.input-otp__slot[data-disabled="true"]` - Disabled slot
* `.input-otp__slot[data-invalid="true"]` - Invalid slot
* `.input-otp__container[data-disabled="true"]` - Disabled container

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Hover**: `:hover` or `[data-hovered="true"]` on slot
* **Active**: `[data-active="true"]` on slot (currently focused)
* **Filled**: `[data-filled="true"]` on slot (contains a character)
* **Disabled**: `[data-disabled="true"]` on container and slots
* **Invalid**: `[data-invalid="true"]` on slots

## API Reference

### InputOTP Props

InputOTP is built on top of the [input-otp](https://github.com/guilhermerodz/input-otp) library with additional features.

#### Base Props

| Prop                 | Type                       | Default     | Description                                                                                                                                                        |
| -------------------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `maxLength`          | `number`                   | -           | **Required.** Number of input slots.                                                                                                                               |
| `value`              | `string`                   | -           | Controlled value (uncontrolled if not provided).                                                                                                                   |
| `onChange`           | `(value: string) => void`  | -           | Handler called when the value changes.                                                                                                                             |
| `onComplete`         | `(value: string) => void`  | -           | Handler called when all slots are filled.                                                                                                                          |
| `className`          | `string`                   | -           | Additional CSS classes for the container.                                                                                                                          |
| `containerClassName` | `string`                   | -           | CSS classes for the inner container.                                                                                                                               |
| `variant`            | `"primary" \| "secondary"` | `"primary"` | Visual variant of the component. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |
| `children`           | `React.ReactNode`          | -           | InputOTP.Group, InputOTP.Slot, and InputOTP.Separator components.                                                                                                  |

#### Validation Props

| Prop                | Type            | Default | Description                               |
| ------------------- | --------------- | ------- | ----------------------------------------- |
| `isDisabled`        | `boolean`       | `false` | Whether the input is disabled.            |
| `isInvalid`         | `boolean`       | `false` | Whether the input is in an invalid state. |
| `validationErrors`  | `string[]`      | -       | Server-side or custom validation errors.  |
| `validationDetails` | `ValidityState` | -       | HTML5 validation details.                 |

#### Input Props

| Prop               | Type                                                                        | Default     | Description                                                        |
| ------------------ | --------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `pattern`          | `string`                                                                    | -           | Regex pattern for allowed characters (e.g., `REGEXP_ONLY_DIGITS`). |
| `textAlign`        | `'left' \| 'center' \| 'right'`                                             | `'left'`    | Text alignment within slots.                                       |
| `inputMode`        | `'numeric' \| 'text' \| 'decimal' \| 'tel' \| 'search' \| 'email' \| 'url'` | `'numeric'` | Virtual keyboard type on mobile devices.                           |
| `placeholder`      | `string`                                                                    | -           | Placeholder text for empty slots.                                  |
| `pasteTransformer` | `(text: string) => string`                                                  | -           | Transform pasted text (e.g., remove hyphens).                      |

#### Form Props

| Prop        | Type      | Default | Description                               |
| ----------- | --------- | ------- | ----------------------------------------- |
| `name`      | `string`  | -       | Name attribute for form submission.       |
| `autoFocus` | `boolean` | -       | Whether to focus the first slot on mount. |

### InputOTP.Group Props

| Prop        | Type              | Default | Description                           |
| ----------- | ----------------- | ------- | ------------------------------------- |
| `className` | `string`          | -       | Additional CSS classes for the group. |
| `children`  | `React.ReactNode` | -       | InputOTP.Slot components.             |

### InputOTP.Slot Props

| Prop        | Type     | Default | Description                                 |
| ----------- | -------- | ------- | ------------------------------------------- |
| `index`     | `number` | -       | **Required.** Zero-based index of the slot. |
| `className` | `string` | -       | Additional CSS classes for the slot.        |

### InputOTP.Separator Props

| Prop        | Type     | Default | Description                               |
| ----------- | -------- | ------- | ----------------------------------------- |
| `className` | `string` | -       | Additional CSS classes for the separator. |

### Exported Patterns

HeroUI re-exports common regex patterns from input-otp for convenience:

```tsx
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS_AND_CHARS } from '@heroui/react';

// Use with pattern prop
<InputOTP pattern={REGEXP_ONLY_DIGITS} maxLength={6}>
  {/* ... */}
</InputOTP>

```

* **REGEXP\_ONLY\_DIGITS** - Only numeric characters (0-9)
* **REGEXP\_ONLY\_CHARS** - Only alphabetic characters (a-z, A-Z)
* **REGEXP\_ONLY\_DIGITS\_AND\_CHARS** - Alphanumeric characters (0-9, a-z, A-Z)
