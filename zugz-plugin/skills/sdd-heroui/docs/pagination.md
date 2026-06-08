# Pagination

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/pagination
> Page navigation with composable page links, previous/next buttons, and ellipsis indicators


## Import

```tsx
import { Pagination } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {Pagination} from "@heroui/react";
import {useState} from "react";

export function PaginationBasic() {
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <Pagination className="justify-center">
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => p - 1)}>
            <Pagination.PreviousIcon />
            <span>Previous</span>
          </Pagination.Previous>
        </Pagination.Item>
        {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
          <Pagination.Item key={p}>
            <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
              {p}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => p + 1)}>
            <span>Next</span>
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

```

### Anatomy

Import the Pagination component and access all parts using dot notation.

```tsx
import { Pagination } from '@heroui/react';

export default () => (
  <Pagination>
    <Pagination.Summary>Showing 1-10 of 100 results</Pagination.Summary>
    <Pagination.Content>
      <Pagination.Item>
        <Pagination.Previous>
          <Pagination.PreviousIcon />
          <span>Previous</span>
        </Pagination.Previous>
      </Pagination.Item>
      <Pagination.Item>
        <Pagination.Link isActive>1</Pagination.Link>
      </Pagination.Item>
      <Pagination.Item>
        <Pagination.Ellipsis />
      </Pagination.Item>
      <Pagination.Item>
        <Pagination.Link>10</Pagination.Link>
      </Pagination.Item>
      <Pagination.Item>
        <Pagination.Next>
          <span>Next</span>
          <Pagination.NextIcon />
        </Pagination.Next>
      </Pagination.Item>
    </Pagination.Content>
  </Pagination>
);

```

### Sizes

```tsx
"use client";

import {Pagination} from "@heroui/react";
import {useState} from "react";

function SizePagination({size}: {size: "sm" | "md" | "lg"}) {
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted capitalize">{size}</span>
      <Pagination className="justify-center" size={size}>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => p - 1)}>
              <Pagination.PreviousIcon />
              <span>Previous</span>
            </Pagination.Previous>
          </Pagination.Item>
          {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
            <Pagination.Item key={p}>
              <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                {p}
              </Pagination.Link>
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => p + 1)}>
              <span>Next</span>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}

export function PaginationSizes() {
  return (
    <div className="flex flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <SizePagination key={size} size={size} />
      ))}
    </div>
  );
}

```

### With Ellipsis

```tsx
"use client";

import {Pagination} from "@heroui/react";
import {useState} from "react";

export function PaginationWithEllipsis() {
  const [page, setPage] = useState(1);
  const totalPages = 12;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    pages.push(1);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="w-full max-w-2xs overflow-x-auto sm:max-w-full">
      <Pagination className="justify-center">
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => p - 1)}>
              <Pagination.PreviousIcon />
              <span>Previous</span>
            </Pagination.Previous>
          </Pagination.Item>
          {getPageNumbers().map((p, i) =>
            p === "ellipsis" ? (
              <Pagination.Item key={`ellipsis-${i}`}>
                <Pagination.Ellipsis />
              </Pagination.Item>
            ) : (
              <Pagination.Item key={p}>
                <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                  {p}
                </Pagination.Link>
              </Pagination.Item>
            ),
          )}
          <Pagination.Item>
            <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => p + 1)}>
              <span>Next</span>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}

```

### Simple (Previous / Next)

```tsx
"use client";

import {Pagination} from "@heroui/react";
import {useState} from "react";

export function PaginationSimplePrevNext() {
  const [page, setPage] = useState(1);
  const totalPages = 10;
  const itemsPerPage = 5;
  const totalItems = 50;

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  return (
    <Pagination className="w-full">
      <Pagination.Summary>
        {startItem} to {endItem} of {totalItems} invoices
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => p - 1)}>
            <Pagination.PreviousIcon />
            <span>Prev</span>
          </Pagination.Previous>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => p + 1)}>
            <span>Next</span>
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

```

### With Summary

```tsx
"use client";

import {Pagination} from "@heroui/react";
import {useState} from "react";

export function PaginationWithSummary() {
  const [page, setPage] = useState(1);
  const totalPages = 12;
  const itemsPerPage = 10;
  const totalItems = 120;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    pages.push(1);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  return (
    <Pagination className="w-full">
      <Pagination.Summary>
        Showing {startItem}-{endItem} of {totalItems} results
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => p - 1)}>
            <Pagination.PreviousIcon />
            <span>Previous</span>
          </Pagination.Previous>
        </Pagination.Item>
        {getPageNumbers().map((p, i) =>
          p === "ellipsis" ? (
            <Pagination.Item key={`ellipsis-${i}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={p}>
              <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                {p}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}
        <Pagination.Item>
          <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => p + 1)}>
            <span>Next</span>
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

```

### Custom Icons

You can replace the default chevron icons by passing custom children to `PreviousIcon` and `NextIcon`.

```tsx
"use client";

import {Pagination} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useState} from "react";

export function PaginationCustomIcons() {
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <Pagination className="justify-center">
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => p - 1)}>
            <Pagination.PreviousIcon>
              <Icon icon="gravity-ui:arrow-left" />
            </Pagination.PreviousIcon>
            <span>Back</span>
          </Pagination.Previous>
        </Pagination.Item>
        {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
          <Pagination.Item key={p}>
            <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
              {p}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => p + 1)}>
            <span>Forward</span>
            <Pagination.NextIcon>
              <Icon icon="gravity-ui:arrow-right" />
            </Pagination.NextIcon>
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

```

### Controlled

```tsx
"use client";

import {Pagination} from "@heroui/react";
import {useState} from "react";

export function PaginationControlled() {
  const [page, setPage] = useState(1);
  const totalPages = 12;
  const itemsPerPage = 10;
  const totalItems = 120;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  return (
    <Pagination>
      <Pagination.Summary>
        Showing {startItem}-{endItem} of {totalItems} results
      </Pagination.Summary>
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => p - 1)}>
            <Pagination.PreviousIcon />
            <span>Previous</span>
          </Pagination.Previous>
        </Pagination.Item>
        {getPageNumbers().map((p, i) =>
          p === "ellipsis" ? (
            <Pagination.Item key={`ellipsis-${i}`}>
              <Pagination.Ellipsis />
            </Pagination.Item>
          ) : (
            <Pagination.Item key={p}>
              <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                {p}
              </Pagination.Link>
            </Pagination.Item>
          ),
        )}
        <Pagination.Item>
          <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => p + 1)}>
            <span>Next</span>
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

```

### Disabled

```tsx
"use client";

import {Pagination} from "@heroui/react";
import {useState} from "react";

export function PaginationDisabled() {
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <Pagination className="justify-center">
      <Pagination.Content>
        <Pagination.Item>
          <Pagination.Previous isDisabled onPress={() => setPage((p) => p - 1)}>
            <Pagination.PreviousIcon />
            <span>Previous</span>
          </Pagination.Previous>
        </Pagination.Item>
        {Array.from({length: totalPages}, (_, i) => i + 1).map((p) => (
          <Pagination.Item key={p}>
            <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
              {p}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next isDisabled onPress={() => setPage((p) => p + 1)}>
            <span>Next</span>
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

```

## Related Components

* **Button**: Allows a user to perform an action
* **Link**: Styled anchor links

## Styling

### Passing Tailwind CSS classes

You can customize individual Pagination parts:

```tsx
import { Pagination } from '@heroui/react';

function CustomPagination() {
  return (
    <Pagination className="gap-8">
      <Pagination.Content className="gap-2">
        <Pagination.Item>
          <Pagination.Link className="rounded-md" isActive>1</Pagination.Link>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}

```

### Customizing the component classes

To customize the Pagination component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .pagination {
    @apply gap-8;
  }

  .pagination__link {
    @apply rounded-md;
  }

  .pagination__summary {
    @apply text-xs font-semibold;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Pagination component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/pagination.css)):

#### Base & Layout Classes

* `.pagination` - Root navigation container with flex layout
* `.pagination__summary` - Left-side info text container
* `.pagination__content` - Container for pagination items
* `.pagination__item` - Individual item wrapper
* `.pagination__link` - Page number button (ghost button style)
* `.pagination__link--nav` - Navigation button modifier (Previous/Next)
* `.pagination__ellipsis` - Ellipsis indicator

#### Size Classes

* `.pagination--sm` - Small size variant
* `.pagination--md` - Medium size variant (default)
* `.pagination--lg` - Large size variant

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Active page**: `[data-active="true"]` or `[aria-current="page"]`
* **Hover**: `:hover` or `[data-hovered="true"]`
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]`
* **Disabled**: `:disabled` or `[aria-disabled="true"]`
* **Pressed**: `:active` or `[data-pressed="true"]`

## API Reference

### Pagination Props

| Prop        | Type                   | Default | Description                         |
| ----------- | ---------------------- | ------- | ----------------------------------- |
| `size`      | `"sm" \| "md" \| "lg"` | `"md"`  | Size of the pagination items        |
| `className` | `string`               | -       | Additional CSS classes              |
| `children`  | `ReactNode`            | -       | Pagination parts (Summary, Content) |

### Pagination.Summary Props

| Prop        | Type        | Default | Description                                   |
| ----------- | ----------- | ------- | --------------------------------------------- |
| `className` | `string`    | -       | Additional CSS classes                        |
| `children`  | `ReactNode` | -       | Summary content (e.g., "Showing 1-10 of 120") |

### Pagination.Content Props

| Prop        | Type        | Default | Description            |
| ----------- | ----------- | ------- | ---------------------- |
| `className` | `string`    | -       | Additional CSS classes |
| `children`  | `ReactNode` | -       | Pagination items       |

### Pagination.Item Props

| Prop        | Type        | Default | Description                                      |
| ----------- | ----------- | ------- | ------------------------------------------------ |
| `className` | `string`    | -       | Additional CSS classes                           |
| `children`  | `ReactNode` | -       | Item content (Link, Previous, Next, or Ellipsis) |

### Pagination.Link Props

| Prop         | Type                      | Default | Description                      |
| ------------ | ------------------------- | ------- | -------------------------------- |
| `isActive`   | `boolean`                 | `false` | Whether this is the current page |
| `isDisabled` | `boolean`                 | `false` | Whether the link is disabled     |
| `onPress`    | `(e: PressEvent) => void` | -       | Press handler (from React Aria)  |
| `className`  | `string`                  | -       | Additional CSS classes           |
| `children`   | `ReactNode`               | -       | Page number content              |

### Pagination.Previous / Pagination.Next Props

| Prop         | Type                      | Default | Description                                         |
| ------------ | ------------------------- | ------- | --------------------------------------------------- |
| `isDisabled` | `boolean`                 | `false` | Whether the button is disabled                      |
| `onPress`    | `(e: PressEvent) => void` | -       | Press handler (from React Aria)                     |
| `className`  | `string`                  | -       | Additional CSS classes                              |
| `children`   | `ReactNode`               | -       | Button content (compose with PreviousIcon/NextIcon) |

### Pagination.PreviousIcon / Pagination.NextIcon Props

| Prop        | Type        | Default             | Description                                |
| ----------- | ----------- | ------------------- | ------------------------------------------ |
| `className` | `string`    | -                   | Additional CSS classes                     |
| `children`  | `ReactNode` | Default chevron SVG | Custom icon to replace the default chevron |

### Pagination.Ellipsis Props

| Prop        | Type     | Default | Description            |
| ----------- | -------- | ------- | ---------------------- |
| `className` | `string` | -       | Additional CSS classes |

## Accessibility

The Pagination component is built on [React Aria's Button](https://react-spectrum.adobe.com/react-aria/Button.html) primitive for all interactive elements, providing:

* Semantic `<nav>` element with `aria-label="pagination"` and `role="navigation"`
* Active page indicated via `aria-current="page"` on the current link
* Keyboard navigation via Tab key through all interactive elements
* Press events handled across mouse, touch, and keyboard interactions via React Aria
* Focus ring on keyboard navigation via `:focus-visible`
* Ellipsis marked with `aria-hidden="true"` to avoid screen reader confusion
* Disabled states properly communicated to assistive technology via `isDisabled`

> **Note:** Pagination buttons use `onPress` instead of `onClick`. The `onPress` handler from React Aria normalizes press behavior across pointer types and provides accessibility improvements out of the box.
