# Link

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/link
> A styled anchor component for navigation with built-in icon support


## Import

```tsx
import { Link } from '@heroui/react';

```

### Usage

```tsx
import {Link} from "@heroui/react";

export function LinkBasic() {
  return (
    <Link href="#">
      Call to action
      <Link.Icon />
    </Link>
  );
}

```

### Anatomy

Import the Link component and access all parts using dot notation.

```tsx
import { Link } from '@heroui/react';

export default () => (
  <Link href="#">
    Call to action
    <Link.Icon />
  </Link>
);

```

### Custom Icon

```tsx
import {ArrowUpRightFromSquare, Link as LinkIcon} from "@gravity-ui/icons";
import {Link} from "@heroui/react";

export function LinkCustomIcon() {
  return (
    <div className="flex flex-col gap-3">
      <Link href="#">
        External link
        <Link.Icon className="ml-1.5 size-3">
          <ArrowUpRightFromSquare />
        </Link.Icon>
      </Link>
      <Link className="gap-1" href="#">
        Go to page
        <Link.Icon className="size-3">
          <LinkIcon />
        </Link.Icon>
      </Link>
    </div>
  );
}

```

### Icon Placement

```tsx
import {Link} from "@heroui/react";

export function LinkIconPlacement() {
  return (
    <div className="flex flex-col gap-3">
      <Link href="#">
        Icon at end (default)
        <Link.Icon />
      </Link>
      <Link className="gap-1" href="#">
        <Link.Icon />
        Icon at start
      </Link>
    </div>
  );
}

```

### Text Decoration with Tailwind CSS

Link is underlined on hover by default. Use Tailwind CSS text-decoration utilities to make the underline always visible, remove it entirely, or customize its color, style, thickness, and offset.

```tsx
import {Link} from "@heroui/react";

export function LinkUnderlineAndOffset() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Default hover underline</p>
        <Link href="#">
          Hover to see the underline
          <Link.Icon />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Always visible underline</p>
        <Link className="underline" href="#">
          Underline always visible
          <Link.Icon />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">No underline</p>
        <Link className="no-underline" href="#">
          Link without any underline
          <Link.Icon />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Changing the underline offset</p>
        <div className="flex flex-col gap-3">
          <Link className="underline-offset-1" href="#">
            Offset 1 (1px space)
            <Link.Icon />
          </Link>
          <Link className="underline-offset-2" href="#">
            Offset 2 (2px space)
            <Link.Icon />
          </Link>
          <Link className="underline-offset-3" href="#">
            Offset 3 (3px space)
            <Link.Icon />
          </Link>
          <Link className="underline-offset-4" href="#">
            Offset 4 (4px space)
            <Link.Icon />
          </Link>
        </div>
      </div>
    </div>
  );
}

```

**Text Decoration Line:**

* `underline` - Always visible underline
* `no-underline` - Remove underline
* default `Link` styles - Underline appears on hover

**Text Decoration Color:**

* `decoration-primary`, `decoration-secondary`, etc. - Set underline color using theme colors
* `decoration-muted/50` - Use opacity modifiers for semi-transparent underlines

**Text Decoration Style:**

* `decoration-solid` - Solid line (default)
* `decoration-double` - Double line
* `decoration-dotted` - Dotted line
* `decoration-dashed` - Dashed line
* `decoration-wavy` - Wavy line

**Text Decoration Thickness:**

* `decoration-1`, `decoration-2`, `decoration-4`, etc. - Control underline thickness

**Underline Offset:**

* `underline-offset-1`, `underline-offset-2`, `underline-offset-4`, etc. - Adjust spacing between text and underline

For more details, see the Tailwind CSS documentation:

* [text-decoration-line](https://tailwindcss.com/docs/text-decoration-line)
* [text-decoration-color](https://tailwindcss.com/docs/text-decoration-color)
* [text-decoration-style](https://tailwindcss.com/docs/text-decoration-style)
* [text-decoration-thickness](https://tailwindcss.com/docs/text-decoration-thickness)
* [text-underline-offset](https://tailwindcss.com/docs/text-underline-offset)

Available BEM classes:

* Base: `link`
* Icon: `link__icon`

## Related Components

* **Breadcrumbs**: Display the user's current location within a hierarchy

### Custom Render Function

```tsx
"use client";

import {Link} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <Link href="#" render={(props) => <span {...props} data-custom="foo" />}>
      Call to action
      <Link.Icon />
    </Link>
  );
}

```

## Styling

### Passing Tailwind CSS classes

```tsx
import { Link } from '@heroui/react';

function CustomLink() {
  return (
    <Link
      href="#"
      className="text-lg font-bold text-accent hover:text-accent/80"
    >
      Custom styled link
    </Link>
  );
}

```

### Customizing the component classes

To customize the Link component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .link {
    @apply font-semibold;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Link component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/link.css)):

#### Base Classes

* `.link` - Base link styles
* `.link__icon` - Link icon styles

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Focus**: `:focus-visible` or `[data-focus-visible="true"]`
* **Hover**: `:hover` or `[data-hovered="true"]`
* **Pressed**: `:active` or `[data-pressed="true"]`
* **Disabled**: `:disabled` or `[aria-disabled="true"]`

## API Reference

### Link Props

| Prop         | Type                                                                    | Default   | Description                                                      |
| ------------ | ----------------------------------------------------------------------- | --------- | ---------------------------------------------------------------- |
| `href`       | `string`                                                                | -         | Destination URL for the anchor                                   |
| `target`     | `string`                                                                | `"_self"` | Controls where to open the linked document                       |
| `rel`        | `string`                                                                | -         | Relationship between the current and linked documents            |
| `download`   | `boolean \| string`                                                     | -         | Prompts file download instead of navigation                      |
| `isDisabled` | `boolean`                                                               | `false`   | Disables pointer and keyboard interaction                        |
| `className`  | `string`                                                                | -         | Custom classes merged with the default styles                    |
| `children`   | `React.ReactNode`                                                       | -         | Content rendered inside the link                                 |
| `onPress`    | `(e: PressEvent) => void`                                               | -         | Fired when the link is activated                                 |
| `autoFocus`  | `boolean`                                                               | -         | Whether the element should receive focus on render               |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, LinkRenderProps>` | -         | Overrides the default DOM element with a custom render function. |

### Link.Icon Props

| Prop        | Type              | Default | Description                                                           |
| ----------- | ----------------- | ------- | --------------------------------------------------------------------- |
| `children`  | `React.ReactNode` | -       | Custom icon element; defaults to the built-in arrow icon when omitted |
| `className` | `string`          | -       | Additional CSS classes                                                |

### Using with Routing Libraries

Use variant functions to style framework-specific links like Next.js:

```tsx
import { Link } from '@heroui/react';
import { linkVariants } from '@heroui/styles';
import NextLink from 'next/link';

export default function Demo() {
  const slots = linkVariants();

  return (
    <NextLink className={slots.base()} href="/about">
      About Page
      <Link.Icon className={slots.icon()} />
    </NextLink>
  );
}

```

### Direct Class Application

Since HeroUI uses [BEM](https://getbem.com/) classes, you can apply Link styles directly to any link element:

```tsx
import NextLink from 'next/link';

// Apply classes directly with Tailwind utilities
export default function Demo() {
  return (
    <NextLink href="/about" className="link underline-offset-2">
      About Page
    </NextLink>
  );
}

// Or with a native anchor
export default function NativeLink() {
  return (
    <a href="/about" className="link underline decoration-primary underline-offset-4">
      About Page
      <Link.Icon className="link__icon" />
    </a>
  );
}

```
