# Accordion

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/accordion
> A collapsible content panel for organizing information in a compact space


## Import

```tsx
import { Accordion } from '@heroui/react';

```

### Usage

```tsx
import {
  ArrowsRotateLeft,
  Box,
  ChevronDown,
  CreditCard,
  PlanetEarth,
  Receipt,
  ShoppingBag,
} from "@gravity-ui/icons";
import {Accordion} from "@heroui/react";

const items = [
  {
    content:
      "Browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping and payment information to complete your purchase.",
    icon: <ShoppingBag />,
    title: "How do I place an order?",
  },
  {
    content:
      "Yes, you can modify or cancel your order before it's shipped. Once your order is processed, you can't make changes.",
    icon: <Receipt />,
    title: "Can I modify or cancel my order?",
  },
  {
    content: "We accept all major credit cards, including Visa, Mastercard, and American Express.",
    icon: <CreditCard />,
    title: "What payment methods do you accept?",
  },
  {
    content:
      "Shipping costs vary based on your location and the size of your order. We offer free shipping for orders over $50.",
    icon: <Box />,
    title: "How much does shipping cost?",
  },
  {
    content:
      "Yes, we ship to most countries. Please check our shipping rates and policies for more information.",
    icon: <PlanetEarth />,
    title: "Do you ship internationally?",
  },
  {
    content:
      "If you're not satisfied with your purchase, you can request a refund within 30 days of purchase. Please contact our customer support team for assistance.",
    icon: <ArrowsRotateLeft />,
    title: "How do I request a refund?",
  },
];

export function Basic() {
  return (
    <Accordion className="w-full max-w-md">
      {items.map((item, index) => (
        <Accordion.Item key={index}>
          <Accordion.Heading>
            <Accordion.Trigger>
              {item.icon ? (
                <span className="mr-3 size-4 shrink-0 text-muted">{item.icon}</span>
              ) : null}
              {item.title}
              <Accordion.Indicator>
                <ChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

```

### Anatomy

Import the Accordion component and access all parts using dot notation.

```tsx
import { Accordion } from '@heroui/react';

export default () => (
  <Accordion>
    <Accordion.Item>
      <Accordion.Heading>
        <Accordion.Trigger>
          <Accordion.Indicator />
        </Accordion.Trigger>
      </Accordion.Heading>
      <Accordion.Panel>
        <Accordion.Body/>
      </Accordion.Panel>
    </Accordion.Item>
  </Accordion>
)

```

### Surface

```tsx
import {
  ArrowsRotateLeft,
  Box,
  ChevronDown,
  CreditCard,
  PlanetEarth,
  Receipt,
  ShoppingBag,
} from "@gravity-ui/icons";
import {Accordion} from "@heroui/react";

const items = [
  {
    content:
      "Browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping and payment information to complete your purchase.",
    icon: <ShoppingBag />,
    title: "How do I place an order?",
  },
  {
    content:
      "Yes, you can modify or cancel your order before it's shipped. Once your order is processed, you can't make changes.",
    icon: <Receipt />,
    title: "Can I modify or cancel my order?",
  },
  {
    content: "We accept all major credit cards, including Visa, Mastercard, and American Express.",
    icon: <CreditCard />,
    title: "What payment methods do you accept?",
  },
  {
    content:
      "Shipping costs vary based on your location and the size of your order. We offer free shipping for orders over $50.",
    icon: <Box />,
    title: "How much does shipping cost?",
  },
  {
    content:
      "Yes, we ship to most countries. Please check our shipping rates and policies for more information.",
    icon: <PlanetEarth />,
    title: "Do you ship internationally?",
  },
  {
    content:
      "If you're not satisfied with your purchase, you can request a refund within 30 days of purchase. Please contact our customer support team for assistance.",
    icon: <ArrowsRotateLeft />,
    title: "How do I request a refund?",
  },
];

export function Surface() {
  return (
    <Accordion className="w-full max-w-md" variant="surface">
      {items.map((item, index) => (
        <Accordion.Item key={index}>
          <Accordion.Heading>
            <Accordion.Trigger>
              {item.icon ? (
                <span className="mr-3 size-4 shrink-0 text-muted">{item.icon}</span>
              ) : null}
              {item.title}
              <Accordion.Indicator>
                <ChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

```

### Multiple Expanded

```tsx
import {Accordion} from "@heroui/react";

export function Multiple() {
  return (
    <Accordion allowsMultipleExpanded className="w-full max-w-md">
      <Accordion.Item>
        <Accordion.Heading>
          <Accordion.Trigger>
            Getting Started
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            Learn the basics of HeroUI and how to integrate it into your React project. This section
            covers installation, setup, and your first component.
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item>
        <Accordion.Heading>
          <Accordion.Trigger>
            Core Concepts
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            Understand the fundamental concepts behind HeroUI, including the compound component
            pattern, styling with Tailwind CSS, and accessibility features.
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item>
        <Accordion.Heading>
          <Accordion.Trigger>
            Advanced Usage
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            Explore advanced features like custom variants, theme customization, and integration
            with other libraries in your React ecosystem.
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item>
        <Accordion.Heading>
          <Accordion.Trigger>
            Best Practices
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            Follow our recommended best practices for building performant, accessible, and
            maintainable applications with HeroUI components.
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

```

### Controlled

```tsx
"use client";

import {ChevronDown, ChevronUp} from "@gravity-ui/icons";
import {Accordion, Button, useDisclosureGroupNavigation} from "@heroui/react";
import React from "react";

const items = [
  {
    content:
      "Learn the basics of HeroUI and how to integrate it into your React project. This section covers installation, setup, and your first component.",
    id: "getting-started",
    title: "Getting Started",
  },
  {
    content:
      "Understand the fundamental concepts behind HeroUI, including the compound component pattern, styling with Tailwind CSS, and accessibility features.",
    id: "core-concepts",
    title: "Core Concepts",
  },
  {
    content:
      "Explore advanced features like custom variants, theme customization, and integration with other libraries in your React ecosystem.",
    id: "advanced-usage",
    title: "Advanced Usage",
  },
];

export function Controlled() {
  const [expandedKeys, setExpandedKeys] = React.useState(
    new Set<string | number>(["getting-started"]),
  );
  const itemIds = items.map((item) => item.id);

  const {isNextDisabled, isPrevDisabled, onNext, onPrevious} = useDisclosureGroupNavigation({
    expandedKeys,
    itemIds,
    onExpandedChange: setExpandedKeys,
  });

  return (
    <div className="w-full max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">
          Expanded: <strong>{[...expandedKeys].join(", ") || "none"}</strong>
        </p>
        <div className="flex gap-2">
          <Button
            aria-label="Previous item"
            isDisabled={isPrevDisabled}
            size="sm"
            variant="secondary"
            onPress={onPrevious}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            aria-label="Next item"
            isDisabled={isNextDisabled}
            size="sm"
            variant="secondary"
            onPress={onNext}
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
      </div>
      <Accordion expandedKeys={expandedKeys} onExpandedChange={setExpandedKeys}>
        {items.map((item) => (
          <Accordion.Item key={item.id} id={item.id}>
            <Accordion.Heading>
              <Accordion.Trigger>
                {item.title}
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>{item.content}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}

```

### Custom Indicator

```tsx
"use client";

import type {Key} from "@heroui/react";

import {ChevronsDown, CircleChevronDown, Minus, Plus} from "@gravity-ui/icons";
import {Accordion} from "@heroui/react";
import React from "react";

export function CustomIndicator() {
  const [expandedKeys, setExpandedKeys] = React.useState<Set<Key>>(new Set([""]));

  return (
    <Accordion
      className="w-full max-w-md"
      expandedKeys={expandedKeys}
      variant="surface"
      onExpandedChange={setExpandedKeys}
    >
      <Accordion.Item id="1">
        <Accordion.Heading>
          <Accordion.Trigger>
            Using Plus/Minus Icon
            <Accordion.Indicator>
              {expandedKeys.has("1") ? <Minus /> : <Plus />}
            </Accordion.Indicator>
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            This accordion uses a plus icon that transforms when expanded. The icon automatically
            rotates 45 degrees to form an X.
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item id="2">
        <Accordion.Heading>
          <Accordion.Trigger>
            Using Caret Icon
            <Accordion.Indicator>
              <CircleChevronDown />
            </Accordion.Indicator>
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            This item uses a caret icon for the indicator. The rotation animation is applied
            automatically.
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item id="3">
        <Accordion.Heading>
          <Accordion.Trigger>
            Using Arrow Icon
            <Accordion.Indicator>
              <ChevronsDown />
            </Accordion.Indicator>
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            This item uses an arrow icon. Any icon you pass will receive the rotation animation when
            the item expands.
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

```

### Disabled State

```tsx
import {Accordion} from "@heroui/react";

export function Disabled() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="w-full max-w-md space-y-2">
        <h3 className="text-sm font-medium text-muted">Entire accordion disabled</h3>
        <Accordion isDisabled className="w-full max-w-md">
          <Accordion.Item>
            <Accordion.Heading>
              <Accordion.Trigger>
                Disabled Item 1
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>
                This content cannot be accessed when the accordion is disabled.
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item>
            <Accordion.Heading>
              <Accordion.Trigger>
                Disabled Item 2
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>
                This content cannot be accessed when the accordion is disabled.
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>

      <div className="w-full max-w-md space-y-2">
        <h3 className="text-sm font-medium text-muted">Individual items disabled</h3>
        <Accordion className="w-full max-w-md">
          <Accordion.Item>
            <Accordion.Heading>
              <Accordion.Trigger>
                Active Item
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>This item is active and can be toggled normally.</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item isDisabled>
            <Accordion.Heading>
              <Accordion.Trigger>
                Disabled Item
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>
                This content cannot be accessed when the item is disabled.
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item>
            <Accordion.Heading>
              <Accordion.Trigger>
                Another Active Item
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>This item is also active and can be toggled.</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}

```

### FAQ Layout

```tsx
import {ChevronDown} from "@gravity-ui/icons";
import {Accordion} from "@heroui/react";

export function FAQ() {
  const categories = [
    {
      items: [
        {
          content:
            "Browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping and payment information to complete your purchase.",
          title: "How do I place an order?",
        },
        {
          content:
            "Yes, you can modify or cancel your order before it's shipped. Once your order is processed, you can't make changes.",
          title: "Can I modify or cancel my order?",
        },
      ],
      title: "General",
    },
    {
      items: [
        {
          content:
            "You can purchase a license directly from our website. Select the license type that fits your needs and proceed to checkout.",
          title: "How do I purchase a license?",
        },
        {
          content:
            "A standard license is for personal use or small projects, while a pro license includes commercial use rights and priority support.",
          title: "What is the difference between a standard and a pro license?",
        },
      ],
      title: "Licensing",
    },
    {
      items: [
        {
          content:
            "You can reach our support team through the contact form on our website, or email us directly at support@example.com.",
          title: "How do I get support?",
        },
      ],
      title: "Support",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <p className="mb-4 text-lg font-medium text-muted">
          Everything you need to know about licensing and usage.
        </p>
      </div>
      {categories.map((category) => (
        <div key={category.title}>
          <p className="text-md mb-2 font-medium text-muted">{category.title}</p>
          <Accordion className="w-full" variant="surface">
            {category.items.map((item, index) => (
              <Accordion.Item key={index}>
                <Accordion.Heading>
                  <Accordion.Trigger>
                    {item.title}
                    <Accordion.Indicator>
                      <ChevronDown />
                    </Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>{item.content}</Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}

```

### Custom Styles

```tsx
import {ChevronDown} from "@gravity-ui/icons";
import {Accordion, cn} from "@heroui/react";

const items = [
  {
    content: "Stay informed about your account activity with real-time notifications. ",
    iconUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/bell-small.png",
    subtitle: "Receive account activity updates",
    title: "Set Up Notifications",
  },
  {
    content: "Enhance your browsing experience by installing our official browser extension",
    iconUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/compass-small.png",
    subtitle: "Connect you browser to your account",
    title: "Set up Browser Extension",
  },
  {
    content:
      "Begin your journey into the world of digital collectibles by creating your first NFT. ",
    iconUrl:
      "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/mint-collective-small.png",
    subtitle: "Create your first collectible",
    title: "Mint Collectible",
  },
];

export function CustomStyles() {
  return (
    <Accordion className="bg-surface-1/10 w-full max-w-md rounded-2xl" variant="surface">
      {items.map((item, index) => (
        <Accordion.Item
          key={index}
          className={cn(
            "group/item",
            "first:[&_[data-slot=accordion-trigger]]:rounded-t-2xl", // First trigger we want to round the top
            "last:[&:not(:has([data-slot=accordion-trigger][aria-expanded='true']))_[data-slot=accordion-trigger]]:rounded-b-2xl", // Last trigger we want to round the bottom
          )}
        >
          <Accordion.Heading>
            <Accordion.Trigger className="hover:bgsurface group flex items-center gap-2 transition-none">
              {item.iconUrl ? (
                <img
                  alt={item.title}
                  className="h-11 w-11 transition-[scale,rotate] duration-300 ease-out group-hover/item:scale-120 group-hover/item:-rotate-10 group-hover/item:drop-shadow-lg"
                  src={item.iconUrl}
                />
              ) : null}
              <div className="flex flex-col gap-0">
                <span className="leading-5 font-medium">{item.title}</span>
                <span className="leading-6 font-normal text-muted/80">{item.subtitle}</span>
              </div>
              <Accordion.Indicator className="text-muted/50 [&>svg]:size-4">
                <ChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="text-muted/80">{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

```

### Without Separator

```tsx
import {ChevronDown, CreditCard, Receipt, ShoppingBag} from "@gravity-ui/icons";
import {Accordion} from "@heroui/react";

const items = [
  {
    content:
      "Browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping and payment information to complete your purchase.",
    icon: <ShoppingBag />,
    title: "How do I place an order?",
  },
  {
    content:
      "Yes, you can modify or cancel your order before it's shipped. Once your order is processed, you can't make changes.",
    icon: <Receipt />,
    title: "Can I modify or cancel my order?",
  },
  {
    content: "We accept all major credit cards, including Visa, Mastercard, and American Express.",
    icon: <CreditCard />,
    title: "What payment methods do you accept?",
  },
];

export function WithoutSeparator() {
  return (
    <Accordion hideSeparator className="w-full max-w-md">
      {items.map((item, index) => (
        <Accordion.Item key={index}>
          <Accordion.Heading>
            <Accordion.Trigger>
              {item.icon ? (
                <span className="mr-3 size-4 shrink-0 text-muted">{item.icon}</span>
              ) : null}
              {item.title}
              <Accordion.Indicator>
                <ChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {
  ArrowsRotateLeft,
  Box,
  ChevronDown,
  CreditCard,
  PlanetEarth,
  Receipt,
  ShoppingBag,
} from "@gravity-ui/icons";
import {Accordion} from "@heroui/react";

const items = [
  {
    content:
      "Browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping and payment information to complete your purchase.",
    icon: <ShoppingBag />,
    title: "How do I place an order?",
  },
  {
    content:
      "Yes, you can modify or cancel your order before it's shipped. Once your order is processed, you can't make changes.",
    icon: <Receipt />,
    title: "Can I modify or cancel my order?",
  },
  {
    content: "We accept all major credit cards, including Visa, Mastercard, and American Express.",
    icon: <CreditCard />,
    title: "What payment methods do you accept?",
  },
  {
    content:
      "Shipping costs vary based on your location and the size of your order. We offer free shipping for orders over $50.",
    icon: <Box />,
    title: "How much does shipping cost?",
  },
  {
    content:
      "Yes, we ship to most countries. Please check our shipping rates and policies for more information.",
    icon: <PlanetEarth />,
    title: "Do you ship internationally?",
  },
  {
    content:
      "If you're not satisfied with your purchase, you can request a refund within 30 days of purchase. Please contact our customer support team for assistance.",
    icon: <ArrowsRotateLeft />,
    title: "How do I request a refund?",
  },
];

export function CustomRenderFunction() {
  return (
    <Accordion
      className="w-full max-w-md"
      render={(props) => <div data-custom="accordion" {...props} />}
    >
      {items.map((item, index) => (
        <Accordion.Item key={index} render={(props) => <div data-custom="item" {...props} />}>
          <Accordion.Heading render={(props) => <div data-custom="heading" {...props} />}>
            <Accordion.Trigger render={(props) => <button data-custom="trigger" {...props} />}>
              {item.icon ? (
                <span className="mr-3 size-4 shrink-0 text-muted">{item.icon}</span>
              ) : null}
              {item.title}
              <Accordion.Indicator>
                <ChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel render={(props) => <div data-custom="panel" {...props} />}>
            <Accordion.Body>{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

```

## Related Components

* **DisclosureGroup**: Group of collapsible panels
* **Disclosure**: Single collapsible content section

## Styling

### Passing Tailwind CSS classes

```tsx
"use client";

import { Accordion, cn } from "@heroui/react";
import {Icon} from "@iconify/react";

const items = [
  {
    content:
      "Stay informed about your account activity with real-time notifications. You'll receive instant alerts for important events like transactions, new messages, security updates, and system announcements. ",
    iconUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/bell-small.png",
    title: "Set Up Notifications",
    subtitle: "Receive account activity updates",
  },
  {
    content:
      "Enhance your browsing experience by installing our official browser extension. The extension provides seamless integration with your account, allowing you to receive notifications directly in your browser, quickly access your dashboard, and interact with web3 applications securely. Compatible with Chrome, Firefox, Edge, and Brave browsers.",
    iconUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/compass-small.png",
    title: "Set up Browser Extension",
    subtitle: "Connect you browser to your account",
  },
  {
    content:
      "Begin your journey into the world of digital collectibles by creating your first NFT. Our intuitive minting process guides you through uploading your artwork, setting metadata, choosing royalty percentages, and deploying to the blockchain. Whether you're an artist, creator, or collector, you'll find all the tools you need to bring your digital assets to life. Your collectibles are stored on IPFS for permanent decentralized storage.",
    iconUrl:
      "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/mint-collective-small.png",
    title: "Mint Collectible",
    subtitle: "Create your first collectible",
  },
];

export function CustomStyles() {
  return (
    <Accordion className="bg-surface-secondary w-full max-w-md rounded-2xl" variant="surface">
      {items.map((item, index) => (
        <Accordion.Item
          key={index}
          className={cn(
            "group/item",
            "first:[&_[data-slot=accordion-trigger]]:rounded-t-2xl", // First trigger we want to round the top
            "last:[&:not(:has([data-slot=accordion-trigger][aria-expanded='true']))_[data-slot=accordion-trigger]]:rounded-b-2xl", // Last trigger we want to round the bottom
          )}
        >
          <Accordion.Heading>
            <Accordion.Trigger className="hover:bg-surface-tertiary group flex items-center gap-2">
              {item.iconUrl ? (
                <img
                  alt={item.title}
                  className="group-hover/item:scale-120 group-hover/item:-rotate-10 h-11 w-11 transition-[scale,rotate] duration-300 ease-out group-hover/item:drop-shadow-lg"
                  src={item.iconUrl}
                />
              ) : null}
              <div className="flex flex-col gap-0">
                <span className="font-medium leading-5">{item.title}</span>
                <span className="text-muted/80 font-normal leading-6">{item.subtitle}</span>
              </div>
              <Accordion.Indicator className="text-muted/50 [&>svg]:size-4">
                <Icon icon="gravity-ui:chevron-down" />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="text-muted/80">{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

```

### Customizing the component classes

To customize the Accordion component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .accordion {
    @apply rounded-xl bg-gray-50;
  }

  .accordion__trigger {
    @apply font-semibold text-lg;
  }

  .accordion--outline {
    @apply shadow-lg border-2;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Accordion component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/accordion.css)):

#### Base Classes

* `.accordion` - Base accordion container
* `.accordion__body` - Content body container
* `.accordion__heading` - Heading wrapper
* `.accordion__indicator` - Expand/collapse indicator icon
* `.accordion__item` - Individual accordion item
* `.accordion__panel` - Collapsible panel container
* `.accordion__trigger` - Clickable trigger button

#### Variant Classes

* `.accordion--outline` - Outline variant with border and background

#### State Classes

* `.accordion__trigger[aria-expanded="true"]` - Expanded state
* `.accordion__panel[aria-hidden="false"]` - Panel visible state

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Hover**: `:hover` or `[data-hovered="true"]` on trigger
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` on trigger
* **Disabled**: `:disabled` or `[aria-disabled="true"]` on trigger
* **Expanded**: `[aria-expanded="true"]` on trigger

## API Reference

### Accordion Props

| Prop                     | Type                                                                         | Default     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `allowsMultipleExpanded` | `boolean`                                                                    | `false`     | Whether multiple items can be expanded at once                   |
| `defaultExpandedKeys`    | `Iterable<Key>`                                                              | -           | The initial expanded keys                                        |
| `expandedKeys`           | `Iterable<Key>`                                                              | -           | The controlled expanded keys                                     |
| `onExpandedChange`       | `(keys: Set<Key>) => void`                                                   | -           | Handler called when expanded keys change                         |
| `isDisabled`             | `boolean`                                                                    | `false`     | Whether the entire accordion is disabled                         |
| `variant`                | `"default" \| "surface"`                                                     | `"default"` | The visual variant of the accordion                              |
| `hideSeparator`          | `boolean`                                                                    | `false`     | Hide separator lines between accordion items                     |
| `className`              | `string`                                                                     | -           | Additional CSS classes                                           |
| `children`               | `ReactNode`                                                                  | -           | The accordion items                                              |
| `render`                 | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, AccordionRenderProps>` | -           | Overrides the default DOM element with a custom render function. |

### Accordion.Item Props

| Prop               | Type                                                                             | Default | Description                                                      |
| ------------------ | -------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `id`               | `Key`                                                                            | -       | Unique identifier for the item                                   |
| `isDisabled`       | `boolean`                                                                        | `false` | Whether this item is disabled                                    |
| `defaultExpanded`  | `boolean`                                                                        | `false` | Whether item is initially expanded                               |
| `isExpanded`       | `boolean`                                                                        | -       | Controlled expanded state                                        |
| `onExpandedChange` | `(isExpanded: boolean) => void`                                                  | -       | Handler for expanded state changes                               |
| `className`        | `string`                                                                         | -       | Additional CSS classes                                           |
| `children`         | `ReactNode`                                                                      | -       | The item content                                                 |
| `render`           | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, AccordionItemRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### Accordion.Trigger Props

| Prop         | Type                                                                       | Default | Description                                                      |
| ------------ | -------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `className`  | `string`                                                                   | -       | Additional CSS classes                                           |
| `children`   | `ReactNode \| RenderFunction`                                              | -       | Trigger content or render function                               |
| `onPress`    | `() => void`                                                               | -       | Additional press handler                                         |
| `isDisabled` | `boolean`                                                                  | -       | Whether trigger is disabled                                      |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, TriggerRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### Accordion.Panel Props

| Prop        | Type                                                                              | Default | Description                                                      |
| ----------- | --------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `className` | `string`                                                                          | -       | Additional CSS classes                                           |
| `children`  | `ReactNode`                                                                       | -       | Panel content                                                    |
| `render`    | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, AccordionPanelRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### Accordion.Indicator Props

| Prop        | Type        | Default | Description            |
| ----------- | ----------- | ------- | ---------------------- |
| `className` | `string`    | -       | Additional CSS classes |
| `children`  | `ReactNode` | -       | Custom indicator icon  |

### Accordion.Body Props

| Prop        | Type        | Default | Description            |
| ----------- | ----------- | ------- | ---------------------- |
| `className` | `string`    | -       | Additional CSS classes |
| `children`  | `ReactNode` | -       | Body content           |
