# Toast

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/toast
> Display temporary notifications and messages to users with automatic dismissal and customizable placement


## Import

```tsx
import { Toast, toast } from '@heroui/react';

```

## Setup

Render the provider in the root of your app.

```tsx
import { Toast, Button, toast } from '@heroui/react';

function App() {
  return (
    <div>
      <Toast.Provider />
      <Button onPress={() => toast("Simple message")}>
        Show toast
      </Button>
    </div>
  );
}

```

### Usage

```tsx
"use client";

import {Persons} from "@gravity-ui/icons";
import {Button, toast} from "@heroui/react";

export function Default() {
  return (
    <div className="flex h-full max-w-xl flex-col items-center justify-center">
      <Button
        size="sm"
        variant="secondary"
        onPress={() => {
          toast("You have been invited to join a team", {
            actionProps: {
              children: "Dismiss",
              onPress: () => toast.clear(),
              variant: "tertiary",
            },
            description: "Bob sent you an invitation to join HeroUI team",
            indicator: <Persons />,
            variant: "default",
          });
        }}
      >
        Show toast
      </Button>
    </div>
  );
}

```

### Simple Toasts

```tsx
"use client";

import {Button, toast} from "@heroui/react";

export function Simple() {
  return (
    <div className="flex h-full max-w-xl flex-col items-center justify-center">
      <div className="flex w-full flex-wrap items-center justify-center gap-4">
        <Button size="sm" variant="secondary" onPress={() => toast("Simple message")}>
          Default
        </Button>
        <Button size="sm" variant="secondary" onPress={() => toast.success("Operation completed")}>
          Success
        </Button>
        <Button size="sm" variant="secondary" onPress={() => toast.info("New update available")}>
          Info
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => toast.warning("Please check your settings")}
        >
          Warning
        </Button>
        <Button size="sm" variant="secondary" onPress={() => toast.danger("Something went wrong")}>
          Error
        </Button>
      </div>
    </div>
  );
}

```

### Variants

```tsx
"use client";

import {HardDrive, Persons} from "@gravity-ui/icons";
import {Button, toast} from "@heroui/react";

const noop = () => {};

export function Variants() {
  return (
    <div className="flex h-full max-w-xl flex-col items-center justify-center">
      <div className="flex w-full flex-wrap items-center justify-center gap-4">
        <Button
          size="sm"
          variant="tertiary"
          onPress={() => {
            toast("You have been invited to join a team", {
              actionProps: {
                children: "Dismiss",
                onPress: () => toast.clear(),
                variant: "tertiary",
              },
              description: "Bob sent you an invitation to join HeroUI team",
              indicator: <Persons />,
              variant: "default",
            });
          }}
        >
          Default toast
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() =>
            toast.info("You have 2 credits left", {
              actionProps: {children: "Upgrade", onPress: noop},
              description: "Get a paid plan for more credits",
            })
          }
        >
          Accent toast
        </Button>
        <Button
          className="text-success-soft-foreground"
          size="sm"
          variant="tertiary"
          onPress={() =>
            toast.success("You have upgraded your plan", {
              actionProps: {
                children: "Billing",
                className: "bg-success text-success-foreground",
                onPress: noop,
              },
              description: "You can continue using HeroUI Chat",
            })
          }
        >
          Success toast
        </Button>
        <Button
          className="text-warning-soft-foreground"
          size="sm"
          variant="tertiary"
          onPress={() =>
            toast.warning("You have no credits left", {
              actionProps: {
                children: "Upgrade",
                className: "bg-warning text-warning-foreground",
                onPress: noop,
              },
              description: "Upgrade to a paid plan to continue",
            })
          }
        >
          Warning toast
        </Button>
        <Button
          size="sm"
          variant="danger-soft"
          onPress={() =>
            toast.danger("Storage is full", {
              actionProps: {children: "Remove", onPress: noop, variant: "danger"},
              description:
                "Remove files to release space. Adding more text to demonstrate longer content display",
              indicator: <HardDrive />,
            })
          }
        >
          Danger toast
        </Button>
      </div>
    </div>
  );
}

```

### Custom Indicators

```tsx
"use client";

import {Star} from "@gravity-ui/icons";
import {Button, toast} from "@heroui/react";

export function CustomIndicator() {
  return (
    <div className="flex h-full max-w-xl flex-col items-center justify-center">
      <Button
        size="sm"
        variant="secondary"
        onPress={() =>
          toast("Custom icon indicator", {
            indicator: <Star />,
          })
        }
      >
        Custom indicator
      </Button>
    </div>
  );
}

```

### Promise & Loading

```tsx
"use client";

import {Button, toast} from "@heroui/react";

const uploadFile = (): Promise<{filename: string; size: number}> => {
  return new Promise<{filename: string; size: number}>((resolve) => {
    setTimeout(() => resolve({filename: "document.pdf", size: 1024}), 2000);
  });
};

const createEvent = (): Promise<never> => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Network error. Please try again.")), 2000);
  });
};

const saveData = (): Promise<{count: number}> => {
  return new Promise<{count: number}>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve({count: 42});
      } else {
        reject(new Error("Failed to save data"));
      }
    }, 2000);
  });
};

const fetchUser = (): Promise<{name: string; email: string}> => {
  return new Promise<{name: string; email: string}>((resolve) => {
    setTimeout(() => resolve({email: "john@example.com", name: "John Doe"}), 2000);
  });
};

export function PromiseDemo() {
  return (
    <div className="flex h-full max-w-2xl flex-col items-center justify-center gap-8">
      {/* Promise API Section */}
      <div className="w-full space-y-3">
        <div className="text-center">
          <h3 className="text-sm font-medium">Using toast.promise()</h3>
          <p className="text-xs text-muted">
            Automatically handles loading, success, and error states
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center gap-4">
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              toast.promise(uploadFile(), {
                error: "Failed to upload file",
                loading: "Uploading file...",
                success: (data) => `File ${data.filename} uploaded (${data.size}KB)`,
              });
            }}
          >
            Upload file
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              toast.promise(createEvent(), {
                error: (err) => err.message,
                loading: "Creating event...",
                success: "Event created",
              });
            }}
          >
            Create event (error)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              toast.promise(saveData(), {
                error: (err) => err.message,
                loading: "Saving changes...",
                success: (data) => `Saved ${data.count} items`,
              });
            }}
          >
            Save data (random)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              toast.promise(fetchUser(), {
                error: "Failed to fetch user",
                loading: "Loading user...",
                success: (data) => `Welcome back, ${data.name}!`,
              });
            }}
          >
            Fetch user
          </Button>
        </div>
      </div>

      {/* Manual Loading Section */}
      <div className="w-full space-y-3">
        <div className="text-center">
          <h3 className="text-sm font-medium">Manual Loading State</h3>
          <p className="text-xs text-muted">Manually control loading state with isLoading prop</p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center gap-4">
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              const loadingId = toast("Uploading file...", {
                description: "Please wait while we upload your file",
                isLoading: true,
                timeout: 0,
              });

              setTimeout(() => {
                toast.close(loadingId);
                toast.success("File uploaded", {
                  description: "Your file has been uploaded successfully",
                });
              }, 3000);
            }}
          >
            Upload with loading
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              const loadingId = toast("Processing payment...", {
                isLoading: true,
                timeout: 0,
              });

              setTimeout(() => {
                toast.close(loadingId);
                toast.success("Payment processed", {
                  description: "Your payment has been processed successfully",
                });
              }, 2500);
            }}
          >
            Payment processing
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              const loadingId = toast("Saving changes...", {
                isLoading: true,
                timeout: 0,
              });

              setTimeout(() => {
                toast.close(loadingId);
                toast.danger("Failed to save", {
                  description: "Please try again",
                });
              }, 2000);
            }}
          >
            Loading to error
          </Button>
        </div>
      </div>
    </div>
  );
}

```

### Callbacks

```tsx
"use client";

import {Button, toast} from "@heroui/react";
import React from "react";

export function Callbacks() {
  const [closedHistory, setClosedHistory] = React.useState<Array<{message: string; time: string}>>(
    [],
  );

  const addToHistory = (message: string) => {
    const time = new Date().toLocaleTimeString();

    setClosedHistory((prev) => [{message, time}, ...prev].slice(0, 5));
  };

  return (
    <div className="flex h-full max-w-2xl flex-col items-center justify-center gap-6">
      {/* Toast Buttons */}
      <div className="flex w-full flex-wrap items-center justify-center gap-4">
        <Button
          size="sm"
          variant="secondary"
          onPress={() =>
            toast("File saved", {
              onClose: () => {
                addToHistory("File saved (closed after 3 seconds)");
              },
              timeout: 3000,
            })
          }
        >
          Custom timeout (3s)
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() =>
            toast("Changes saved", {
              onClose: () => {
                addToHistory("Changes saved (closed after 10 seconds)");
              },
              timeout: 10000,
            })
          }
        >
          Custom timeout (10s)
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() =>
            toast.success("Event created", {
              onClose: () => {
                addToHistory("Event created (closed after default timeout)");
              },
            })
          }
        >
          With onClose callback
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() =>
            toast("Important notification", {
              description: "This toast will stay until dismissed",
              onClose: () => {
                addToHistory("Important notification (manually closed)");
              },
              timeout: 0,
            })
          }
        >
          Persistent toast
        </Button>
      </div>

      {/* Closed History Panel */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Closed History</h3>
          {closedHistory.length > 0 && (
            <Button
              className="h-6 text-xs"
              size="sm"
              variant="tertiary"
              onPress={() => setClosedHistory([])}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="min-h-[120px] space-y-2 rounded-lg border border-border bg-surface p-4">
          {closedHistory.length === 0 ? (
            <p className="text-sm text-muted">No toasts closed yet. Try closing one above!</p>
          ) : (
            closedHistory.map((item, index) => (
              <div
                key={`${item.time}-${index}`}
                className="flex animate-in items-start justify-between gap-3 rounded-md border border-border bg-default px-3 py-2 text-sm duration-200 fade-in slide-in-from-top-2"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex-1">
                  <span className="font-medium">{item.message}</span>
                  <span className="ml-2 text-xs text-muted">({item.time})</span>
                </div>
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success-soft-foreground">
                  <svg
                    className="size-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

```

### Placements

```tsx
"use client";

import type {ToastVariants} from "@heroui/react";

import {Button, Toast, ToastQueue} from "@heroui/react";

type Placement = NonNullable<ToastVariants["placement"]>;

const placements = ["top start", "top", "top end", "bottom start", "bottom", "bottom end"] as const;

// Create a separate queue for each placement
const placementQueues = Object.fromEntries(
  placements.map((p) => [p, new ToastQueue({maxVisibleToasts: 3})]),
) as Record<Placement, ToastQueue>;

export function Placements() {
  const showToast = (placement: Placement) => {
    placementQueues[placement].add({
      description: "Event has been created",
      title: "Event created",
      variant: "default",
    });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      {/* Render a ToastProvider for each placement */}
      {placements.map((p) => (
        <Toast.Provider key={p} placement={p} queue={placementQueues[p]} />
      ))}
      <div className="flex max-w-xs flex-wrap justify-center gap-2">
        {placements.map((p) => (
          <Button key={p} size="sm" variant="secondary" onPress={() => showToast(p)}>
            {p}
          </Button>
        ))}
      </div>
    </div>
  );
}

```

### Custom Toast Rendering

```tsx
"use client";

import type {ToastContentValue} from "@heroui/react";

import {
  Button,
  Toast,
  ToastContent,
  ToastDescription,
  ToastIndicator,
  ToastQueue,
  ToastTitle,
} from "@heroui/react";

export function CustomToast() {
  const customQueue = new ToastQueue();

  return (
    <div className="flex h-full max-w-xl flex-col items-center justify-center">
      <Toast.Provider placement="bottom" queue={customQueue}>
        {({toast: toastItem}) => {
          const content = toastItem.content as ToastContentValue;

          return (
            <Toast
              className="rounded-xl border border-border"
              toast={toastItem}
              variant={content.variant}
            >
              <ToastContent>
                <div className="flex items-center gap-2">
                  <ToastIndicator
                    className="text-accent-soft-foreground"
                    variant={content.variant}
                  />
                  <div className="flex flex-col pr-6">
                    {content.title ? (
                      <ToastTitle className="text-accent-soft-foreground">
                        {content.title}
                      </ToastTitle>
                    ) : null}
                    {content.description ? (
                      <ToastDescription>{content.description}</ToastDescription>
                    ) : null}
                  </div>
                </div>
              </ToastContent>
              <Toast.CloseButton className="absolute top-1/2 right-2 -translate-y-1/2 border-none bg-transparent opacity-100 [&>svg]:size-4" />
            </Toast>
          );
        }}
      </Toast.Provider>
      <Button
        size="sm"
        variant="secondary"
        onPress={() => {
          customQueue.add({
            description: "This uses a custom render function",
            title: "Custom layout toast",
            variant: "default",
          });
        }}
      >
        Custom toast
      </Button>
    </div>
  );
}

```

### Custom Queues

```tsx
"use client";

import {Button, Toast, ToastQueue} from "@heroui/react";

export function CustomQueue() {
  const notificationQueue = new ToastQueue({maxVisibleToasts: 2});
  const errorQueue = new ToastQueue({maxVisibleToasts: 3});
  const successQueue = new ToastQueue({maxVisibleToasts: 1});

  return (
    <div className="flex h-full max-w-4xl items-center justify-center gap-4">
      {/* Notification Queue */}
      <Toast.Provider placement="bottom" queue={notificationQueue} />
      <div className="flex justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            notificationQueue.add({
              description: "You have a new message",
              title: "New notification",
              variant: "default",
            });
          }}
        >
          Add notification (max 2)
        </Button>
      </div>

      {/* Error Queue */}
      <Toast.Provider placement="bottom start" queue={errorQueue} />
      <div className="flex justify-center gap-2">
        <Button
          size="sm"
          variant="danger-soft"
          onPress={() => {
            errorQueue.add({
              description: "Failed to save changes",
              title: "Error occurred",
              variant: "danger",
            });
          }}
        >
          Add error (max 3)
        </Button>
      </div>

      {/* Success Queue */}
      <Toast.Provider placement="bottom end" queue={successQueue} />
      <div className="flex justify-center gap-2">
        <Button
          className="text-success-soft-foreground"
          size="sm"
          variant="secondary"
          onPress={() => {
            successQueue.add({
              description: `Operation ${Date.now()}`,
              title: "Success!",
              variant: "success",
            });
          }}
        >
          Add success (max 1)
        </Button>
      </div>
    </div>
  );
}

```

### Anatomy

```tsx
<Toast.Provider>
  <Toast>
    <Toast.Indicator />
    <Toast.Content>
      <Toast.Title />
      <Toast.Description />
    </Toast.Content>
    <Toast.ActionButton />
    <Toast.CloseButton />
  </Toast>
</Toast.Provider>

```

## Related Components

* **Button**: Allows a user to perform an action
* **Alert**: Display important messages and notifications
* **CloseButton**: Button for dismissing overlays

## Styling

### Passing Tailwind CSS classes

```tsx
<Toast.Provider className="bottom-8 right-8" placement="bottom end" />

```

### Customizing the component classes

To customize the Toast component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .toast {
    @apply rounded-xl shadow-lg;
  }

  .toast__content {
    @apply gap-2;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Toast component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/toast.css)):

#### Base Classes

* `.toast` - Base toast container
* `.toast__region` - Toast region container
* `.toast__content` - Content wrapper for title and description
* `.toast__indicator` - Icon/indicator container
* `.toast__title` - Toast title text
* `.toast__description` - Toast description text
* `.toast__action` - Action button container
* `.toast__close` - Close button container

#### Variant Classes

* `.toast--default` - Default gray variant
* `.toast--accent` - Accent blue variant
* `.toast--success` - Success green variant
* `.toast--warning` - Warning yellow/orange variant
* `.toast--danger` - Danger red variant

### Interactive States

The component supports various states:

* **Frontmost**: `[data-frontmost]` - Applied to the topmost visible toast
* **Index**: `[data-index]` - Applied based on toast position in stack
* **Placement**: `[data-placement="*"]` - Applied based on toast region placement

## API Reference

### Toast.Provider Props

| Prop               | Type                                                                              | Default    | Description                                 |
| ------------------ | --------------------------------------------------------------------------------- | ---------- | ------------------------------------------- |
| `placement`        | `"top start" \| "top" \| "top end" \| "bottom start" \| "bottom" \| "bottom end"` | `"bottom"` | Placement of the toast region               |
| `gap`              | `number`                                                                          | `12`       | The gap between toasts in pixels            |
| `maxVisibleToasts` | `number`                                                                          | `3`        | Maximum number of toasts to display at once |
| `scaleFactor`      | `number`                                                                          | `0.05`     | Scale factor for stacked toasts (0-1)       |
| `width`            | `number \| string`                                                                | `460`      | Width of the toast in pixels or CSS value   |
| `queue`            | `ToastQueue<T>`                                                                   | -          | Custom toast queue instance                 |
| `children`         | `ReactNode \| ((props: {toast: QueuedToast<T>}) => ReactNode)`                    | -          | Custom render function or children          |
| `className`        | `string`                                                                          | -          | Additional CSS classes                      |

### Toast Props

| Prop          | Type                                                          | Default     | Description                                        |
| ------------- | ------------------------------------------------------------- | ----------- | -------------------------------------------------- |
| `toast`       | `QueuedToast<T>`                                              | -           | Toast data from queue (required)                   |
| `variant`     | `"default" \| "accent" \| "success" \| "warning" \| "danger"` | `"default"` | Visual variant of the toast                        |
| `placement`   | `ToastVariants["placement"]`                                  | -           | Placement (inherited from Provider)                |
| `scaleFactor` | `number`                                                      | -           | Scale factor (inherited from Provider)             |
| `className`   | `string`                                                      | -           | Additional CSS classes                             |
| `children`    | `ReactNode`                                                   | -           | Toast content (ToastContent, ToastIndicator, etc.) |

### Toast.Content Props

| Prop        | Type        | Default | Description                                         |
| ----------- | ----------- | ------- | --------------------------------------------------- |
| `children`  | `ReactNode` | -       | Content (typically ToastTitle and ToastDescription) |
| `className` | `string`    | -       | Additional CSS classes                              |

### Toast.Indicator Props

| Prop        | Type                       | Default | Description                                      |
| ----------- | -------------------------- | ------- | ------------------------------------------------ |
| `variant`   | `ToastVariants["variant"]` | -       | Variant for default icon                         |
| `children`  | `ReactNode`                | -       | Custom indicator icon (defaults to variant icon) |
| `className` | `string`                   | -       | Additional CSS classes                           |

### Toast.Title Props

| Prop        | Type        | Default | Description            |
| ----------- | ----------- | ------- | ---------------------- |
| `children`  | `ReactNode` | -       | Title text             |
| `className` | `string`    | -       | Additional CSS classes |

### Toast.Description Props

| Prop        | Type        | Default | Description            |
| ----------- | ----------- | ------- | ---------------------- |
| `children`  | `ReactNode` | -       | Description text       |
| `className` | `string`    | -       | Additional CSS classes |

### Toast.ActionButton Props

| Prop               | Type        | Default | Description                        |
| ------------------ | ----------- | ------- | ---------------------------------- |
| `children`         | `ReactNode` | -       | Action button content              |
| `className`        | `string`    | -       | Additional CSS classes             |
| All `Button` props | -           | -       | Accepts all Button component props |

### Toast.CloseButton Props

| Prop                    | Type     | Default | Description                             |
| ----------------------- | -------- | ------- | --------------------------------------- |
| `className`             | `string` | -       | Additional CSS classes                  |
| All `CloseButton` props | -        | -       | Accepts all CloseButton component props |

### ToastQueue

A `ToastQueue` manages the state for a `<Toast.Provider>`. The state is stored outside React so you can trigger toasts from anywhere in your application.

#### Constructor Options

| Option             | Type                       | Default | Description                                                 |
| ------------------ | -------------------------- | ------- | ----------------------------------------------------------- |
| `maxVisibleToasts` | `number`                   | `3`     | Maximum number of toasts to display at once (visual only)   |
| `wrapUpdate`       | `(fn: () => void) => void` | -       | Function to wrap state updates (e.g., for view transitions) |

#### Methods

| Method      | Parameters                             | Returns      | Description                                              |
| ----------- | -------------------------------------- | ------------ | -------------------------------------------------------- |
| `add`       | `(content: T, options?: ToastOptions)` | `string`     | Add a toast to the queue, returns toast key              |
| `close`     | `(key: string)`                        | `void`       | Close a toast by its key                                 |
| `pauseAll`  | `()`                                   | `void`       | Pause all toast timers                                   |
| `resumeAll` | `()`                                   | `void`       | Resume all toast timers                                  |
| `clear`     | `()`                                   | `void`       | Close all toasts                                         |
| `subscribe` | `(fn: () => void)`                     | `() => void` | Subscribe to queue changes, returns unsubscribe function |

### toast Function

The default `toast` function provides convenient methods for showing toasts:

```tsx
import { toast } from '@heroui/react';

// Basic toast (auto-dismisses after 4 seconds by default)
toast("Event has been created");

// Variant methods (also auto-dismiss after 4 seconds by default)
toast.success("File saved");
toast.info("New update available");
toast.warning("Please check your settings");
toast.danger("Something went wrong");

// With options
toast("Event has been created", {
  description: "Your event has been scheduled for tomorrow",
  variant: "default",
  timeout: 5000, // Custom timeout: 5 seconds
  onClose: () => console.log("Closed"),
  actionProps: {
    children: "View",
    onPress: () => {},
  },
  indicator: <CustomIcon />,
});

// Promise support (automatically shows loading spinner)
toast.promise(
  uploadFile(),
  {
    loading: "Uploading file...",
    success: (data) => `File ${data.filename} uploaded`,
    error: "Failed to upload file",
  }
);

// Manual loading state (persistent toast - no auto-dismiss)
const loadingId = toast("Creating event...", {
  isLoading: true,
  timeout: 0, // Persistent toast that doesn't auto-dismiss
});

// Later, close and show result
toast.close(loadingId);
toast.success("Event created");

// Queue methods
toast.close(key);
toast.clear();
toast.pauseAll();
toast.resumeAll();

```

#### toast Options

| Option        | Type                                                          | Default     | Description                                                                                                                    |
| ------------- | ------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `title`       | `ReactNode`                                                   | -           | Toast title (first parameter for variant methods)                                                                              |
| `description` | `ReactNode`                                                   | -           | Optional description text                                                                                                      |
| `variant`     | `"default" \| "accent" \| "success" \| "warning" \| "danger"` | `"default"` | Visual variant                                                                                                                 |
| `indicator`   | `ReactNode`                                                   | -           | Custom indicator icon (null to hide)                                                                                           |
| `actionProps` | `ButtonProps`                                                 | -           | Props for action button                                                                                                        |
| `isLoading`   | `boolean`                                                     | `false`     | Show loading spinner instead of indicator                                                                                      |
| `timeout`     | `number`                                                      | `4000`      | Auto-dismiss timeout in milliseconds. Defaults to 4000ms (4 seconds). Set to `0` for persistent toasts that don't auto-dismiss |
| `onClose`     | `() => void`                                                  | -           | Callback when toast is closed                                                                                                  |

#### toast.promise Options

| Option    | Type                                         | Default | Description                                |
| --------- | -------------------------------------------- | ------- | ------------------------------------------ |
| `loading` | `ReactNode`                                  | -       | Message shown while promise is pending     |
| `success` | `ReactNode \| ((data: T) => ReactNode)`      | -       | Message shown on success (can be function) |
| `error`   | `ReactNode \| ((error: Error) => ReactNode)` | -       | Message shown on error (can be function)   |
