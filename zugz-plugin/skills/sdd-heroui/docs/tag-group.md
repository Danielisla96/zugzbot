# TagGroup

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/tag-group
> A focusable list of tags with support for keyboard navigation, selection, and removal


## Import

```tsx
import { TagGroup } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {PlanetEarth, Rocket, ShoppingBag, SquareArticle} from "@gravity-ui/icons";
import {Tag, TagGroup} from "@heroui/react";

export function TagGroupBasic() {
  return (
    <TagGroup aria-label="Tags" selectionMode="single">
      <TagGroup.List>
        <Tag id="default-news">
          <SquareArticle />
          News
        </Tag>
        <Tag id="default-travel">
          <PlanetEarth />
          Travel
        </Tag>
        <Tag id="default-gaming">
          <Rocket />
          Gaming
        </Tag>
        <Tag id="default-shopping">
          <ShoppingBag />
          Shopping
        </Tag>
      </TagGroup.List>
    </TagGroup>
  );
}

```

### Anatomy

```tsx
import { TagGroup, Tag, Label, Description, ErrorMessage } from '@heroui/react';

export default () => (
  <TagGroup>
    <Label />
    <TagGroup.List>
      <Tag>
        <Tag.RemoveButton />
      </Tag>
    </TagGroup.List>
    <Description />
    <ErrorMessage />
  </TagGroup>
)

```

### Sizes

```tsx
"use client";

import {Label, Tag, TagGroup} from "@heroui/react";

export function TagGroupSizes() {
  return (
    <div className="flex flex-col gap-6">
      <TagGroup selectionMode="single" size="sm">
        <Label>Small</Label>
        <TagGroup.List>
          <Tag>News</Tag>
          <Tag>Travel</Tag>
          <Tag>Gaming</Tag>
        </TagGroup.List>
      </TagGroup>
      <TagGroup selectionMode="single" size="md">
        <Label>Medium</Label>
        <TagGroup.List>
          <Tag>News</Tag>
          <Tag>Travel</Tag>
          <Tag>Gaming</Tag>
        </TagGroup.List>
      </TagGroup>
      <TagGroup selectionMode="single" size="lg">
        <Label>Large</Label>
        <TagGroup.List>
          <Tag>News</Tag>
          <Tag>Travel</Tag>
          <Tag>Gaming</Tag>
        </TagGroup.List>
      </TagGroup>
    </div>
  );
}

```

### Variants

```tsx
"use client";

import {Label, Tag, TagGroup} from "@heroui/react";

export function TagGroupVariants() {
  return (
    <div className="flex flex-col gap-8">
      <TagGroup selectionMode="single" variant="default">
        <Label>Default</Label>
        <TagGroup.List>
          <Tag>News</Tag>
          <Tag>Travel</Tag>
          <Tag>Gaming</Tag>
        </TagGroup.List>
      </TagGroup>

      <TagGroup selectionMode="single" variant="surface">
        <Label>Surface</Label>
        <TagGroup.List>
          <Tag>News</Tag>
          <Tag>Travel</Tag>
          <Tag>Gaming</Tag>
        </TagGroup.List>
      </TagGroup>
    </div>
  );
}

```

### Disabled

```tsx
"use client";

import {Description, Label, Tag, TagGroup} from "@heroui/react";

export function TagGroupDisabled() {
  return (
    <div className="flex flex-col gap-4">
      <TagGroup selectionMode="single">
        <Label>Disabled Tags</Label>
        <TagGroup.List>
          <Tag isDisabled>News</Tag>
          <Tag>Travel</Tag>
          <Tag isDisabled>Gaming</Tag>
        </TagGroup.List>
        <Description>Some tags are disabled</Description>
      </TagGroup>

      <TagGroup disabledKeys={["travel"]} selectionMode="single">
        <Label>Disabled Keys</Label>
        <TagGroup.List>
          <Tag id="news">News</Tag>
          <Tag id="travel">Travel</Tag>
          <Tag id="gaming">Gaming</Tag>
        </TagGroup.List>
        <Description>Tags disabled via disabledKeys prop</Description>
      </TagGroup>
    </div>
  );
}

```

### Selection Modes

```tsx
"use client";

import type {Key} from "@heroui/react";

import {Description, Label, Tag, TagGroup} from "@heroui/react";
import {useState} from "react";

export function TagGroupSelectionModes() {
  const [singleSelected, setSingleSelected] = useState<Iterable<Key>>(new Set(["news"]));
  const [multipleSelected, setMultipleSelected] = useState<Iterable<Key>>(
    new Set(["news", "travel"]),
  );

  return (
    <div className="flex flex-col gap-8">
      <TagGroup
        selectedKeys={singleSelected}
        selectionMode="single"
        onSelectionChange={(keys) => setSingleSelected(keys)}
      >
        <Label>Single Selection</Label>
        <TagGroup.List>
          <Tag>News</Tag>
          <Tag>Travel</Tag>
          <Tag>Gaming</Tag>
          <Tag>Shopping</Tag>
        </TagGroup.List>
        <Description>Choose one category</Description>
      </TagGroup>

      <TagGroup
        selectedKeys={multipleSelected}
        selectionMode="multiple"
        onSelectionChange={(keys) => setMultipleSelected(keys)}
      >
        <Label>Multiple Selection</Label>
        <TagGroup.List>
          <Tag>News</Tag>
          <Tag>Travel</Tag>
          <Tag>Gaming</Tag>
          <Tag>Shopping</Tag>
        </TagGroup.List>
        <Description>Choose multiple categories</Description>
      </TagGroup>
    </div>
  );
}

```

### Controlled

```tsx
"use client";

import type {Key} from "@heroui/react";

import {Description, Label, Tag, TagGroup} from "@heroui/react";
import {useState} from "react";

export function TagGroupControlled() {
  const [selected, setSelected] = useState<Iterable<Key>>(new Set(["news", "travel"]));

  return (
    <div className="flex flex-col gap-3">
      <TagGroup
        selectedKeys={selected}
        selectionMode="multiple"
        onSelectionChange={(keys) => setSelected(keys)}
      >
        <Label>Categories (controlled)</Label>
        <TagGroup.List>
          <Tag id="news">News</Tag>
          <Tag id="travel">Travel</Tag>
          <Tag id="gaming">Gaming</Tag>
          <Tag id="shopping">Shopping</Tag>
        </TagGroup.List>
        <Description>
          Selected: {Array.from(selected).length > 0 ? Array.from(selected).join(", ") : "None"}
        </Description>
      </TagGroup>
    </div>
  );
}

```

### With Error Message

```tsx
"use client";

import type {Key} from "@heroui/react";

import {Description, ErrorMessage, Label, Tag, TagGroup} from "@heroui/react";
import {useMemo, useState} from "react";

export function TagGroupWithErrorMessage() {
  const [selected, setSelected] = useState<Iterable<Key>>(new Set());

  const isInvalid = useMemo(() => Array.from(selected).length === 0, [selected]);

  return (
    <TagGroup
      selectedKeys={selected}
      selectionMode="multiple"
      onSelectionChange={(keys) => setSelected(keys)}
    >
      <Label>Amenities</Label>
      <TagGroup.List>
        <Tag id="laundry">Laundry</Tag>
        <Tag id="fitness">Fitness center</Tag>
        <Tag id="parking">Parking</Tag>
        <Tag id="pool">Swimming pool</Tag>
        <Tag id="breakfast">Breakfast</Tag>
      </TagGroup.List>
      <Description>
        {isInvalid
          ? "Select at least one category"
          : "Selected: " + Array.from(selected).join(", ")}
      </Description>
      <ErrorMessage>{!!isInvalid && <>Please select at least one category</>}</ErrorMessage>
    </TagGroup>
  );
}

```

### With Prefix

```tsx
"use client";

import {PlanetEarth, Rocket, ShoppingBag, SquareArticle} from "@gravity-ui/icons";
import {Avatar, Description, Label, Tag, TagGroup} from "@heroui/react";

export function TagGroupWithPrefix() {
  return (
    <div className="flex flex-col gap-8">
      <TagGroup selectionMode="single">
        <Label>With Icons</Label>
        <TagGroup.List>
          <Tag>
            <SquareArticle />
            News
          </Tag>
          <Tag>
            <PlanetEarth />
            Travel
          </Tag>
          <Tag>
            <Rocket />
            Gaming
          </Tag>
          <Tag>
            <ShoppingBag />
            Shopping
          </Tag>
        </TagGroup.List>
        <Description>Tags with icons</Description>
      </TagGroup>

      <TagGroup selectionMode="single">
        <Label>With Avatars</Label>
        <TagGroup.List>
          <Tag>
            <Avatar className="size-4">
              <Avatar.Image src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg" />
              <Avatar.Fallback>F</Avatar.Fallback>
            </Avatar>
            Fred
          </Tag>
          <Tag>
            <Avatar className="size-4">
              <Avatar.Image src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg" />
              <Avatar.Fallback>M</Avatar.Fallback>
            </Avatar>
            Michael
          </Tag>
          <Tag>
            <Avatar className="size-4">
              <Avatar.Image src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg" />
              <Avatar.Fallback>J</Avatar.Fallback>
            </Avatar>
            Jane
          </Tag>
        </TagGroup.List>
        <Description>Tags with avatars</Description>
      </TagGroup>
    </div>
  );
}

```

### With Remove Button

```tsx
"use client";

import type {Key} from "@heroui/react";

import {CircleXmarkFill} from "@gravity-ui/icons";
import {Description, EmptyState, Label, Tag, TagGroup} from "@heroui/react";
import {useState} from "react";

export function TagGroupWithRemoveButton() {
  type TagItem = {id: string; name: string};

  const [tags, setTags] = useState<TagItem[]>([
    {id: "news", name: "News"},
    {id: "travel", name: "Travel"},
    {id: "gaming", name: "Gaming"},
    {id: "shopping", name: "Shopping"},
  ]);

  const [frameworks, setFrameworks] = useState<TagItem[]>([
    {id: "react", name: "React"},
    {id: "vue", name: "Vue"},
    {id: "angular", name: "Angular"},
    {id: "svelte", name: "Svelte"},
  ]);

  const onRemoveTags = (keys: Set<Key>) => {
    setTags(tags.filter((tag) => !keys.has(tag.id)));
  };

  const onRemoveFrameworks = (keys: Set<Key>) => {
    setFrameworks(frameworks.filter((framework) => !keys.has(framework.id)));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="w-sm">
        <TagGroup selectionMode="single" onRemove={onRemoveTags}>
          <Label>Default Remove Button</Label>
          <TagGroup.List
            items={tags}
            renderEmptyState={() => <EmptyState className="p-1">No categories found</EmptyState>}
          >
            {(tag) => (
              <Tag key={tag.name} id={tag.id} textValue={tag.name}>
                {tag.name}
              </Tag>
            )}
          </TagGroup.List>
          <Description>Click the X to remove tags</Description>
        </TagGroup>
      </div>

      <div className="w-md">
        <TagGroup selectionMode="single" onRemove={onRemoveFrameworks}>
          <Label>Custom Remove Button</Label>
          <TagGroup.List
            items={frameworks}
            renderEmptyState={() => <EmptyState className="p-1">No frameworks found</EmptyState>}
          >
            {(tag) => (
              <Tag key={tag.id} id={tag.id} textValue={tag.name}>
                {(renderProps) => (
                  <>
                    {tag.name}
                    {!!renderProps.allowsRemoving && (
                      <Tag.RemoveButton>
                        <CircleXmarkFill />
                      </Tag.RemoveButton>
                    )}
                  </>
                )}
              </Tag>
            )}
          </TagGroup.List>
          <Description>Custom remove button with icon</Description>
        </TagGroup>
      </div>
    </div>
  );
}

```

### With List Data

```tsx
"use client";

import type {Key} from "@heroui/react";

import {Avatar, Description, EmptyState, Label, Tag, TagGroup, useListData} from "@heroui/react";

export function TagGroupWithListData() {
  type User = {
    id: string;
    name: string;
    avatar: string;
    fallback: string;
  };

  const list = useListData<User>({
    getKey: (item) => item.id,
    initialItems: [
      {
        avatar: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
        fallback: "F",
        id: "fred",
        name: "Fred",
      },
      {
        avatar: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg",
        fallback: "M",
        id: "michael",
        name: "Michael",
      },
      {
        avatar: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg",
        fallback: "J",
        id: "jane",
        name: "Jane",
      },
      {
        avatar: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg",
        fallback: "A",
        id: "alice",
        name: "Alice",
      },
      {
        avatar: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg",
        fallback: "B",
        id: "bob",
        name: "Bob",
      },
      {
        avatar: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/black.jpg",
        fallback: "C",
        id: "charlie",
        name: "Charlie",
      },
    ],
    initialSelectedKeys: new Set(["fred", "michael"]),
  });

  const onRemove = (keys: Set<Key>) => {
    list.remove(...keys);
  };

  return (
    <div className="w-sm">
      <TagGroup
        selectedKeys={list.selectedKeys}
        selectionMode="multiple"
        onRemove={onRemove}
        onSelectionChange={(keys) => list.setSelectedKeys(keys)}
      >
        <Label>Team Members</Label>
        <TagGroup.List
          items={list.items}
          renderEmptyState={() => <EmptyState className="p-1">No team members</EmptyState>}
        >
          {(user) => (
            <Tag key={user.id} id={user.id} textValue={user.name}>
              <Avatar className="size-4" size="sm">
                <Avatar.Image src={user.avatar} />
                <Avatar.Fallback>{user.fallback}</Avatar.Fallback>
              </Avatar>
              {user.name}
            </Tag>
          )}
        </TagGroup.List>
        <Description>Select team members for your project</Description>
      </TagGroup>
      {list.selectedKeys !== "all" && Array.from(list.selectedKeys).length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-sm font-medium text-muted">Selected:</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(list.selectedKeys).map((key) => {
              const user = list.getItem(key);

              if (!user) return null;

              return (
                <div
                  key={`${user.id}-selected`}
                  className="flex items-center gap-2 rounded-lg bg-surface-tertiary px-2 py-1"
                >
                  <Avatar className="size-4" size="sm">
                    <Avatar.Image src={user.avatar} />
                    <Avatar.Fallback>{user.fallback}</Avatar.Fallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {PlanetEarth, Rocket, ShoppingBag, SquareArticle} from "@gravity-ui/icons";
import {Tag, TagGroup} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <TagGroup
      aria-label="Tags"
      render={(props) => <div {...props} data-custom="foo" />}
      selectionMode="single"
    >
      <TagGroup.List>
        <Tag id="default-news">
          <SquareArticle />
          News
        </Tag>
        <Tag id="default-travel">
          <PlanetEarth />
          Travel
        </Tag>
        <Tag id="default-gaming">
          <Rocket />
          Gaming
        </Tag>
        <Tag id="default-shopping">
          <ShoppingBag />
          Shopping
        </Tag>
      </TagGroup.List>
    </TagGroup>
  );
}

```

## Related Components

* **Label**: Accessible label for form controls
* **Description**: Helper text for form fields
* **ErrorMessage**: Displays validation error messages for components with validation support

## Styling

### Passing Tailwind CSS classes

```tsx
import { TagGroup, Tag, Label } from '@heroui/react';

function CustomTagGroup() {
  return (
    <TagGroup className="w-full">
      <Label>Categories</Label>
      <TagGroup.List className="gap-2">
        <Tag className="rounded-lg px-4 py-2 font-bold">
          Custom Styled
        </Tag>
      </TagGroup.List>
    </TagGroup>
  );
}

```

### Customizing the component classes

To customize the TagGroup component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .tag-group {
    @apply flex flex-col gap-2;
  }

  .tag-group__list {
    @apply flex flex-wrap gap-2;
  }

  .tag {
    @apply rounded-full px-3 py-1;
  }

  .tag__remove-button {
    @apply ml-1;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The TagGroup component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/tag-group.css) and [tag.css](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/tag.css)):

#### Base Classes

* `.tag-group` - Base tag group container
* `.tag-group__list` - Container for the list of tags
* `.tag` - Base tag styles
* `.tag__remove-button` - Remove button trigger

#### Slot Classes

* `.tag-group [slot="description"]` - Description slot styles
* `.tag-group [slot="errorMessage"]` - ErrorMessage slot styles

#### Size Classes

* `.tag--sm` - Small size tag
* `.tag--md` - Medium size tag (default)
* `.tag--lg` - Large size tag

#### Variant Classes

* `.tag--default` - Default variant
* `.tag--surface` - Surface variant with surface background

#### State Classes

* `.tag[data-selected="true"]` - Selected tag state
* `.tag[data-disabled="true"]` - Disabled tag state
* `.tag[data-hovered="true"]` - Hovered tag state
* `.tag[data-pressed="true"]` - Pressed tag state
* `.tag[data-focus-visible="true"]` - Focused tag state (keyboard focus)

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Hover**: `:hover` or `[data-hovered="true"]` on tag
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` on tag
* **Pressed**: `:active` or `[data-pressed="true"]` on tag
* **Selected**: `[data-selected="true"]` or `[aria-selected="true"]` on tag
* **Disabled**: `:disabled` or `[data-disabled="true"]` on tag

## API Reference

### TagGroup Props

| Prop                  | Type                                                              | Default     | Description                                                      |
| --------------------- | ----------------------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `selectionMode`       | `"none" \| "single" \| "multiple"`                                | `"none"`    | The type of selection that is allowed                            |
| `selectedKeys`        | `Selection`                                                       | -           | The currently selected keys (controlled)                         |
| `defaultSelectedKeys` | `Selection`                                                       | -           | The initial selected keys (uncontrolled)                         |
| `onSelectionChange`   | `(keys: Selection) => void`                                       | -           | Handler called when the selection changes                        |
| `disabledKeys`        | `Iterable<Key>`                                                   | -           | Keys of disabled tags                                            |
| `isDisabled`          | `boolean`                                                         | -           | Whether the tag group is disabled                                |
| `onRemove`            | `(keys: Set<Key>) => void`                                        | -           | Handler called when tags are removed                             |
| `size`                | `"sm" \| "md" \| "lg"`                                            | `"md"`      | Size of the tags in the group                                    |
| `variant`             | `"default" \| "surface"`                                          | `"default"` | Visual variant of the tags                                       |
| `className`           | `string`                                                          | -           | Additional CSS classes                                           |
| `children`            | `ReactNode \| RenderFunction`                                     | -           | TagGroup content or render function                              |
| `render`              | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, undefined>` | -           | Overrides the default DOM element with a custom render function. |

### TagGroup.List Props

| Prop               | Type                                                                       | Default | Description                                                      |
| ------------------ | -------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| `items`            | `Iterable<T>`                                                              | -       | The items to display in the tag list                             |
| `renderEmptyState` | `() => ReactNode`                                                          | -       | Function to render when the list is empty                        |
| `className`        | `string`                                                                   | -       | Additional CSS classes                                           |
| `children`         | `ReactNode \| RenderFunction`                                              | -       | TagList content or render function                               |
| `render`           | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, TagListRenderProps>` | -       | Overrides the default DOM element with a custom render function. |

### Tag Props

| Prop         | Type                                                                   | Default | Description                                                          |
| ------------ | ---------------------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| `id`         | `Key`                                                                  | -       | The unique identifier for the tag                                    |
| `textValue`  | `string`                                                               | -       | A string representation of the tag's content, used for accessibility |
| `isDisabled` | `boolean`                                                              | -       | Whether the tag is disabled                                          |
| `className`  | `string`                                                               | -       | Additional CSS classes                                               |
| `children`   | `ReactNode \| RenderFunction`                                          | -       | Tag content or render function                                       |
| `render`     | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, TagRenderProps>` | -       | Overrides the default DOM element with a custom render function.     |

**Note**: `size`, `variant` are inherited from the parent `TagGroup` component and cannot be set directly on individual `Tag` components.

### Tag.RemoveButton Props

| Prop        | Type        | Default | Description                                           |
| ----------- | ----------- | ------- | ----------------------------------------------------- |
| `className` | `string`    | -       | Additional CSS classes                                |
| `children`  | `ReactNode` | -       | Custom remove button content (defaults to close icon) |

**Note**: The `Tag.RemoveButton` component supports customization similar to `SearchField.ClearButton`. When `onRemove` is provided to `TagGroup`:

* **Auto-rendering**: If no custom `Tag.RemoveButton` is included in the `Tag` children, a default remove button is automatically rendered.
* **Custom button**: If a custom `Tag.RemoveButton` is provided as a child of `Tag`, it will be used instead of the auto-rendered button.
* **Custom icon**: You can pass custom content (like icons) to `Tag.RemoveButton` children to customize the appearance.

**Example - Auto-rendered (default)**:

```tsx
<TagGroup onRemove={handleRemove}>
  <TagGroup.List>
    <Tag id="news">News</Tag>
    {/* Remove button is automatically rendered */}
  </TagGroup.List>
</TagGroup>

```

**Example - Custom RemoveButton with icon**:

```tsx
<TagGroup onRemove={handleRemove}>
  <TagGroup.List>
    <Tag id="news">
      News
      <Tag.RemoveButton>
        <CustomIcon />
      </Tag.RemoveButton>
    </Tag>
  </TagGroup.List>
</TagGroup>

```

**Example - Custom RemoveButton in render props**:

```tsx
<Tag id="news">
  {(renderProps) => (
    <>
      News
      {!!renderProps.allowsRemoving && (
        <Tag.RemoveButton>
          <CustomIcon />
        </Tag.RemoveButton>
      )}
    </>
  )}
</Tag>

```

### RenderProps

When using render functions with TagGroup.List, these values are provided:

| Prop             | Type      | Description                        |
| ---------------- | --------- | ---------------------------------- |
| `isSelected`     | `boolean` | Whether the tag is selected        |
| `isDisabled`     | `boolean` | Whether the tag is disabled        |
| `isHovered`      | `boolean` | Whether the tag is hovered         |
| `isPressed`      | `boolean` | Whether the tag is pressed         |
| `isFocused`      | `boolean` | Whether the tag is focused         |
| `isFocusVisible` | `boolean` | Whether the tag has keyboard focus |
