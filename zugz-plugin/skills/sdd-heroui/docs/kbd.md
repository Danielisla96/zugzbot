# Kbd

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/kbd
> Display keyboard shortcuts and key combinations


## Import

```tsx
import { Kbd } from "@heroui/react";

```

### Usage

```tsx
import {Kbd} from "@heroui/react";

export function Basic() {
  return (
    <div className="flex items-center gap-4">
      <Kbd>
        <Kbd.Abbr keyValue="command" />
        <Kbd.Content>K</Kbd.Content>
      </Kbd>
      <Kbd>
        <Kbd.Abbr keyValue="shift" />
        <Kbd.Content>P</Kbd.Content>
      </Kbd>
      <Kbd>
        <Kbd.Abbr keyValue="ctrl" />
        <Kbd.Content>C</Kbd.Content>
      </Kbd>
      <Kbd>
        <Kbd.Abbr keyValue="option" />
        <Kbd.Content>D</Kbd.Content>
      </Kbd>
    </div>
  );
}

```

### Anatomy

Import the Kbd component and access all parts using dot notation.

```tsx
import { Kbd } from "@heroui/react";

export default () => (
  <Kbd>
    <Kbd.Abbr title="Command">⌘</Kbd.Abbr>
    <Kbd.Content>K</Kbd.Content>
  </Kbd>
);

```

### Navigation Keys

```tsx
import {Kbd} from "@heroui/react";

export function NavigationKeys() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Arrow Keys:</span>
        <div className="flex items-center gap-2">
          <Kbd>
            <Kbd.Abbr keyValue="up" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="down" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="left" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="right" />
          </Kbd>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Page Navigation:</span>
        <div className="flex items-center gap-2">
          <Kbd>
            <Kbd.Abbr keyValue="pageup" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="pagedown" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="home" />
          </Kbd>
          <Kbd>
            <Kbd.Abbr keyValue="end" />
          </Kbd>
        </div>
      </div>
    </div>
  );
}

```

### Inline Usage

```tsx
import {Kbd} from "@heroui/react";

export function InlineUsage() {
  return (
    <div className="space-y-4">
      <p className="text-sm">
        Press{" "}
        <Kbd>
          <Kbd.Content>Esc</Kbd.Content>
        </Kbd>{" "}
        to close the dialog.
      </p>
      <p className="text-sm">
        Use{" "}
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>K</Kbd.Content>
        </Kbd>{" "}
        to open the command palette.
      </p>
      <p className="text-sm">
        Navigate with{" "}
        <Kbd>
          <Kbd.Abbr keyValue="up" />
        </Kbd>{" "}
        and{" "}
        <Kbd>
          <Kbd.Abbr keyValue="down" />
        </Kbd>{" "}
        arrow keys.
      </p>
      <p className="text-sm">
        Save your work with{" "}
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>S</Kbd.Content>
        </Kbd>{" "}
        regularly.
      </p>
    </div>
  );
}

```

### Instructional Text

```tsx
import {Kbd} from "@heroui/react";

export function InstructionalText() {
  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-surface p-4">
        <h4 className="mb-2 text-sm font-semibold">Quick Actions</h4>
        <ul className="space-y-2 text-sm">
          <li>
            • Open search:{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>K</Kbd.Content>
            </Kbd>
          </li>
          <li>
            • Toggle sidebar:{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>B</Kbd.Content>
            </Kbd>
          </li>
          <li>
            • New file:{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>N</Kbd.Content>
            </Kbd>
          </li>
          <li>
            • Quick save:{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>S</Kbd.Content>
            </Kbd>
          </li>
        </ul>
      </div>
    </div>
  );
}

```

### Special Keys

```tsx
import {Kbd} from "@heroui/react";

export function SpecialKeys() {
  return (
    <div className="space-y-3">
      <p className="text-sm">
        Press{" "}
        <Kbd>
          <Kbd.Abbr keyValue="enter" />
        </Kbd>{" "}
        to confirm or{" "}
        <Kbd>
          <Kbd.Abbr keyValue="escape" />
        </Kbd>{" "}
        to cancel.
      </p>
      <p className="text-sm">
        Use{" "}
        <Kbd>
          <Kbd.Abbr keyValue="tab" />
        </Kbd>{" "}
        to navigate between form fields and{" "}
        <Kbd>
          <Kbd.Abbr keyValue="shift" />
          <Kbd.Abbr keyValue="tab" />
        </Kbd>{" "}
        to go back.
      </p>
      <p className="text-sm">
        Hold{" "}
        <Kbd>
          <Kbd.Abbr keyValue="space" />
        </Kbd>{" "}
        to temporarily enable panning mode.
      </p>
    </div>
  );
}

```

### Variants

```tsx
import {Kbd} from "@heroui/react";

export function Variants() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span>Copy:</span>
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>C</Kbd.Content>
        </Kbd>
        <Kbd variant="light">
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>C</Kbd.Content>
        </Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Paste:</span>
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>V</Kbd.Content>
        </Kbd>
        <Kbd variant="light">
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>V</Kbd.Content>
        </Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Cut:</span>
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>X</Kbd.Content>
        </Kbd>
        <Kbd variant="light">
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>X</Kbd.Content>
        </Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Undo:</span>
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>Z</Kbd.Content>
        </Kbd>
        <Kbd variant="light">
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>Z</Kbd.Content>
        </Kbd>
      </div>
      <div className="flex items-center gap-2">
        <span>Redo:</span>
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Abbr keyValue="shift" />
          <Kbd.Content>Z</Kbd.Content>
        </Kbd>
        <Kbd variant="light">
          <Kbd.Abbr keyValue="command" />
          <Kbd.Abbr keyValue="shift" />
          <Kbd.Content>Z</Kbd.Content>
        </Kbd>
      </div>
    </div>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import { Kbd } from "@heroui/react";

function CustomKbd() {
  return (
    <Kbd className="bg-gray-100 dark:bg-gray-800">
      <Kbd.Content>K</Kbd.Content>
    </Kbd>
  );
}

```

### Customizing the component classes

To customize the Kbd component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .kbd {
    @apply bg-gray-100 dark:bg-gray-800 border-gray-300;
  }

  .kbd__abbr {
    @apply font-bold;
  }

  .kbd__content {
    @apply text-sm;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Kbd component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/kbd.css)):

#### Base Classes

* `.kbd` - Base keyboard key styles with background, border, and spacing
* `.kbd__abbr` - Abbreviation element for modifier keys
* `.kbd__content` - Content wrapper for key text

## API Reference

### Kbd Props

| Prop        | Type              | Default   | Description        |                             |
| ----------- | ----------------- | --------- | ------------------ | --------------------------- |
| `children`  | `React.ReactNode` | -         | Content of the key |                             |
| `variant`   | \`"default"       | "light"\` | `default`          | Variant of the keyboard key |
| `className` | `string`          | -         | Custom CSS classes |                             |

### Kbd.Abbr Props

| Prop        | Type              | Default | Description                                               |
| ----------- | ----------------- | ------- | --------------------------------------------------------- |
| `title`     | `string`          | -       | Title attribute for accessibility (e.g., "Command" for ⌘) |
| `children`  | `React.ReactNode` | -       | The symbol or text to display (e.g., ⌘, ⌥, ⇧)             |
| `className` | `string`          | -       | Custom CSS classes                                        |

### Kbd.Key Props

| Prop        | Type              | Default | Description             |
| ----------- | ----------------- | ------- | ----------------------- |
| `children`  | `React.ReactNode` | -       | Text content of the key |
| `className` | `string`          | -       | Custom CSS classes      |

### Kbd.Content Type

Available key values for the `keyValue` prop:

| Modifier Keys | Special Keys | Navigation Keys | Function Keys |
| ------------- | ------------ | --------------- | ------------- |
| `command`     | `enter`      | `up`            | `fn`          |
| `shift`       | `delete`     | `down`          |               |
| `ctrl`        | `escape`     | `left`          |               |
| `option`      | `tab`        | `right`         |               |
| `alt`         | `space`      | `pageup`        |               |
| `win`         | `capslock`   | `pagedown`      |               |
|               | `help`       | `home`          |               |
|               |              | `end`           |               |
