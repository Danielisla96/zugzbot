# ComboBox

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/combo-box
> A combo box combines a text input with a listbox, allowing users to filter a list of options to items matching a query


## Import

```tsx
import { ComboBox } from '@heroui/react';

```

### Usage

```tsx
"use client";

import {ComboBox, Input, Label, ListBox} from "@heroui/react";

export function Default() {
  return (
    <ComboBox className="w-[256px]">
      <Label>Favorite Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="aardvark" textValue="Aardvark">
            Aardvark
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="kangaroo" textValue="Kangaroo">
            Kangaroo
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="panda" textValue="Panda">
            Panda
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="snake" textValue="Snake">
            Snake
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Anatomy

Import the ComboBox component and access all parts using dot notation.

```tsx
import { ComboBox, Input, Label, Description, Header, ListBox, Separator } from '@heroui/react';

export default () => (
  <ComboBox>
    <Label />
    <ComboBox.InputGroup>
      <Input />
      <ComboBox.Trigger />
    </ComboBox.InputGroup>
    <Description />
    <ComboBox.Popover>
      <ListBox>
        <ListBox.Item>
          <Label />
          <Description />
          <ListBox.ItemIndicator />
        </ListBox.Item>
        <ListBox.Section>
          <Header />
          <ListBox.Item>
            <Label />
          </ListBox.Item>
        </ListBox.Section>
      </ListBox>
    </ComboBox.Popover>
  </ComboBox>
)

```

### With Description

```tsx
"use client";

import {ComboBox, Description, Input, Label, ListBox} from "@heroui/react";

export function WithDescription() {
  return (
    <ComboBox className="w-[256px]">
      <Label>Favorite Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="aardvark" textValue="Aardvark">
            Aardvark
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="kangaroo" textValue="Kangaroo">
            Kangaroo
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="panda" textValue="Panda">
            Panda
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="snake" textValue="Snake">
            Snake
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
      <Description>Search and select your favorite animal</Description>
    </ComboBox>
  );
}

```

### With Sections

```tsx
"use client";

import {ComboBox, Header, Input, Label, ListBox, Separator} from "@heroui/react";

export function WithSections() {
  return (
    <ComboBox className="w-[256px]">
      <Label>Country</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search countries..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Section>
            <Header>North America</Header>
            <ListBox.Item id="usa" textValue="United States">
              United States
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="canada" textValue="Canada">
              Canada
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="mexico" textValue="Mexico">
              Mexico
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox.Section>
          <Separator />
          <ListBox.Section>
            <Header>Europe</Header>
            <ListBox.Item id="uk" textValue="United Kingdom">
              United Kingdom
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="france" textValue="France">
              France
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="germany" textValue="Germany">
              Germany
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="spain" textValue="Spain">
              Spain
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="italy" textValue="Italy">
              Italy
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox.Section>
          <Separator />
          <ListBox.Section>
            <Header>Asia</Header>
            <ListBox.Item id="japan" textValue="Japan">
              Japan
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="china" textValue="China">
              China
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="india" textValue="India">
              India
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="south-korea" textValue="South Korea">
              South Korea
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox.Section>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### With Disabled Options

```tsx
"use client";

import {ComboBox, Input, Label, ListBox} from "@heroui/react";

export function WithDisabledOptions() {
  return (
    <ComboBox className="w-[256px]" disabledKeys={["cat", "kangaroo"]}>
      <Label>Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="bird" textValue="Bird">
            Bird
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="kangaroo" textValue="Kangaroo">
            Kangaroo
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="elephant" textValue="Elephant">
            Elephant
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="tiger" textValue="Tiger">
            Tiger
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Custom Indicator

```tsx
"use client";

import {ChevronsExpandVertical} from "@gravity-ui/icons";
import {ComboBox, Input, Label, ListBox} from "@heroui/react";

export function CustomIndicator() {
  return (
    <ComboBox className="w-[256px]">
      <Label>Favorite Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger className="size-3">
          <ChevronsExpandVertical />
        </ComboBox.Trigger>
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="aardvark" textValue="Aardvark">
            Aardvark
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="kangaroo" textValue="Kangaroo">
            Kangaroo
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="panda" textValue="Panda">
            Panda
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="snake" textValue="Snake">
            Snake
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Required

```tsx
"use client";

import {Button, ComboBox, FieldError, Form, Input, Label, ListBox} from "@heroui/react";

export function Required() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    alert("Form submitted successfully!");
  };

  return (
    <Form className="flex w-[256px] flex-col gap-4" onSubmit={onSubmit}>
      <ComboBox isRequired className="w-full" name="animal">
        <Label>Favorite Animal</Label>
        <ComboBox.InputGroup>
          <Input placeholder="Search animals..." />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            <ListBox.Item id="aardvark" textValue="Aardvark">
              Aardvark
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="cat" textValue="Cat">
              Cat
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="dog" textValue="Dog">
              Dog
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="kangaroo" textValue="Kangaroo">
              Kangaroo
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="panda" textValue="Panda">
              Panda
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="snake" textValue="Snake">
              Snake
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </ComboBox.Popover>
        <FieldError />
      </ComboBox>
      <Button type="submit">Submit</Button>
    </Form>
  );
}

```

### Custom Value

```tsx
"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ComboBox,
  Description,
  Input,
  Label,
  ListBox,
} from "@heroui/react";

export function CustomValue() {
  const users = [
    {
      avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
      email: "bob@heroui.com",
      fallback: "B",
      id: "1",
      name: "Bob",
    },
    {
      avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg",
      email: "fred@heroui.com",
      fallback: "F",
      id: "2",
      name: "Fred",
    },
    {
      avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg",
      email: "martha@heroui.com",
      fallback: "M",
      id: "3",
      name: "Martha",
    },
    {
      avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg",
      email: "john@heroui.com",
      fallback: "J",
      id: "4",
      name: "John",
    },
    {
      avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg",
      email: "jane@heroui.com",
      fallback: "J",
      id: "5",
      name: "Jane",
    },
  ];

  return (
    <ComboBox className="w-[256px]">
      <Label>User</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search users..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {users.map((user) => (
            <ListBox.Item key={user.id} id={user.id} textValue={user.name}>
              <Avatar size="sm">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.fallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Label>{user.name}</Label>
                <Description>{user.email}</Description>
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Controlled

```tsx
"use client";

import type {Key} from "@heroui/react";

import {ComboBox, Input, Label, ListBox} from "@heroui/react";
import {useState} from "react";

export function Controlled() {
  const animals = [
    {
      id: "cat",
      name: "Cat",
    },
    {
      id: "dog",
      name: "Dog",
    },
    {
      id: "bird",
      name: "Bird",
    },
    {
      id: "fish",
      name: "Fish",
    },
    {
      id: "hamster",
      name: "Hamster",
    },
  ];

  const [selectedKey, setSelectedKey] = useState<Key | null>("cat");

  const selectedAnimal = animals.find((a) => a.id === selectedKey);

  return (
    <div className="space-y-2">
      <ComboBox
        className="w-[256px]"
        selectedKey={selectedKey}
        onSelectionChange={(key) => setSelectedKey(key)}
      >
        <Label>Animal (controlled)</Label>
        <ComboBox.InputGroup>
          <Input placeholder="Search animals..." />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            {animals.map((animal) => (
              <ListBox.Item key={animal.id} id={animal.id} textValue={animal.name}>
                {animal.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
      <p className="text-sm text-muted">Selected: {selectedAnimal?.name || "None"}</p>
    </div>
  );
}

```

### Controlled Input Value

```tsx
"use client";

import {ComboBox, Input, Label, ListBox} from "@heroui/react";
import {useState} from "react";

export function ControlledInputValue() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="space-y-2">
      <ComboBox className="w-[256px]" inputValue={inputValue} onInputChange={setInputValue}>
        <Label>Search (controlled input)</Label>
        <ComboBox.InputGroup>
          <Input placeholder="Type to search..." />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            <ListBox.Item id="aardvark" textValue="Aardvark">
              Aardvark
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="cat" textValue="Cat">
              Cat
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="dog" textValue="Dog">
              Dog
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="kangaroo" textValue="Kangaroo">
              Kangaroo
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="panda" textValue="Panda">
              Panda
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="snake" textValue="Snake">
              Snake
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
      <p className="text-sm text-muted">Input value: {inputValue || "(empty)"}</p>
    </div>
  );
}

```

### Asynchronous Loading

```tsx
"use client";

import {
  Collection,
  ComboBox,
  EmptyState,
  Input,
  Label,
  ListBox,
  ListBoxLoadMoreItem,
  Spinner,
} from "@heroui/react";
import {useAsyncList} from "@react-stately/data";

interface Character {
  name: string;
}

export function AsynchronousLoading() {
  const list = useAsyncList<Character>({
    async load({cursor, filterText, signal}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, "https://");
      }

      const res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {
        signal,
      });
      const json = await res.json();

      return {
        cursor: json.next,
        items: json.results,
      };
    },
  });

  return (
    <ComboBox
      allowsEmptyCollection
      className="w-[256px]"
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
    >
      <Label>Pick a Character</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Star Wars characters..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox renderEmptyState={() => <EmptyState />}>
          <Collection items={list.items}>
            {(item) => (
              <ListBox.Item id={item.name} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </Collection>
          <ListBoxLoadMoreItem
            isLoading={list.loadingState === "loadingMore"}
            onLoadMore={list.loadMore}
          >
            <div className="flex items-center justify-center gap-2 py-2">
              <Spinner size="sm" />
              <span className="muted text-sm">Loading more...</span>
            </div>
          </ListBoxLoadMoreItem>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Custom Filtering

```tsx
"use client";

import {ComboBox, Input, Label, ListBox} from "@heroui/react";

export function CustomFiltering() {
  const animals = [
    {id: "cat", name: "Cat"},
    {id: "dog", name: "Dog"},
    {id: "bird", name: "Bird"},
    {id: "fish", name: "Fish"},
    {id: "hamster", name: "Hamster"},
  ];

  return (
    <ComboBox
      className="w-[256px]"
      defaultFilter={(text, inputValue) => {
        if (!inputValue) return true;

        return text.toLowerCase().includes(inputValue.toLowerCase());
      }}
    >
      <Label>Animal (custom filter)</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {animals.map((animal) => (
            <ListBox.Item key={animal.id} id={animal.id} textValue={animal.name}>
              {animal.name}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Allows Custom Value

```tsx
"use client";

import {ComboBox, Description, Input, Label, ListBox} from "@heroui/react";

export function AllowsCustomValue() {
  return (
    <ComboBox allowsCustomValue className="w-[256px]">
      <Label>Favorite Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search or type an animal..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="aardvark" textValue="Aardvark">
            Aardvark
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="kangaroo" textValue="Kangaroo">
            Kangaroo
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="panda" textValue="Panda">
            Panda
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="snake" textValue="Snake">
            Snake
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
      <Description>You can type any animal name, even if it's not in the list</Description>
    </ComboBox>
  );
}

```

### Disabled

```tsx
"use client";

import {ComboBox, Input, Label, ListBox} from "@heroui/react";

export function Disabled() {
  return (
    <ComboBox isDisabled className="w-[256px]" defaultSelectedKey="cat">
      <Label>Favorite Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="aardvark" textValue="Aardvark">
            Aardvark
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="kangaroo" textValue="Kangaroo">
            Kangaroo
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="panda" textValue="Panda">
            Panda
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="snake" textValue="Snake">
            Snake
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Default Selected Key

```tsx
"use client";

import {ComboBox, Input, Label, ListBox} from "@heroui/react";

export function DefaultSelectedKey() {
  return (
    <ComboBox className="w-[256px]" defaultSelectedKey="cat">
      <Label>Favorite Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="aardvark" textValue="Aardvark">
            Aardvark
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="kangaroo" textValue="Kangaroo">
            Kangaroo
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="panda" textValue="Panda">
            Panda
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="snake" textValue="Snake">
            Snake
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Full Width

```tsx
import {ComboBox, Input, Label, ListBox} from "@heroui/react";

export function FullWidth() {
  return (
    <div className="w-[400px] space-y-4">
      <ComboBox fullWidth>
        <Label>Favorite Animal</Label>
        <ComboBox.InputGroup>
          <Input placeholder="Search animals..." />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            <ListBox.Item id="aardvark" textValue="Aardvark">
              Aardvark
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="cat" textValue="Cat">
              Cat
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="dog" textValue="Dog">
              Dog
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
    </div>
  );
}

```

### In Surface

When used inside a [Surface](/docs/components/surface) component, use `variant="secondary"` to apply the lower emphasis variant suitable for surface backgrounds.

```tsx
"use client";

import {Button, ComboBox, FieldError, Form, Input, Label, ListBox, Surface} from "@heroui/react";

export function OnSurface() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    alert("Form submitted successfully!");
  };

  return (
    <Surface className="w-[320px] rounded-3xl p-6">
      <Form className="flex w-full flex-col gap-4" onSubmit={onSubmit}>
        <ComboBox isRequired className="w-full" name="animal" variant="secondary">
          <Label>Favorite Animal</Label>
          <ComboBox.InputGroup>
            <Input placeholder="Search animals..." />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              <ListBox.Item id="aardvark" textValue="Aardvark">
                Aardvark
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="cat" textValue="Cat">
                Cat
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="dog" textValue="Dog">
                Dog
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="kangaroo" textValue="Kangaroo">
                Kangaroo
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="panda" textValue="Panda">
                Panda
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="snake" textValue="Snake">
                Snake
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </ComboBox.Popover>
          <FieldError />
        </ComboBox>
        <Button type="submit">Submit</Button>
      </Form>
    </Surface>
  );
}

```

### Menu Trigger

Use the `menuTrigger` prop to control when the popover opens:

* `focus` (default): popover opens when the user focuses the input
* `input`: popover opens when the user edits the input text
* `manual`: popover only opens when the user presses the trigger button or uses the arrow keys

```tsx
"use client";

import {ComboBox, Description, Input, Label, ListBox} from "@heroui/react";

export function MenuTrigger() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Focus (default)</p>
        <ComboBox className="w-[256px]" menuTrigger="focus">
          <Label>Favorite Animal</Label>
          <ComboBox.InputGroup>
            <Input placeholder="Search animals..." />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              <ListBox.Item id="aardvark" textValue="Aardvark">
                Aardvark
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="cat" textValue="Cat">
                Cat
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="dog" textValue="Dog">
                Dog
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="kangaroo" textValue="Kangaroo">
                Kangaroo
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="panda" textValue="Panda">
                Panda
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="snake" textValue="Snake">
                Snake
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </ComboBox.Popover>
          <Description>Popover opens when the input is focused</Description>
        </ComboBox>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Input</p>
        <ComboBox className="w-[256px]" menuTrigger="input">
          <Label>Favorite Animal</Label>
          <ComboBox.InputGroup>
            <Input placeholder="Search animals..." />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              <ListBox.Item id="aardvark" textValue="Aardvark">
                Aardvark
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="cat" textValue="Cat">
                Cat
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="dog" textValue="Dog">
                Dog
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="kangaroo" textValue="Kangaroo">
                Kangaroo
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="panda" textValue="Panda">
                Panda
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="snake" textValue="Snake">
                Snake
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </ComboBox.Popover>
          <Description>Popover opens when the user edits the input text</Description>
        </ComboBox>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted">Manual</p>
        <ComboBox className="w-[256px]" menuTrigger="manual">
          <Label>Favorite Animal</Label>
          <ComboBox.InputGroup>
            <Input placeholder="Search animals..." />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              <ListBox.Item id="aardvark" textValue="Aardvark">
                Aardvark
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="cat" textValue="Cat">
                Cat
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="dog" textValue="Dog">
                Dog
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="kangaroo" textValue="Kangaroo">
                Kangaroo
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="panda" textValue="Panda">
                Panda
                <ListBox.ItemIndicator />
              </ListBox.Item>
              <ListBox.Item id="snake" textValue="Snake">
                Snake
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </ComboBox.Popover>
          <Description>
            Popover only opens when the trigger button is pressed or arrow keys are used
          </Description>
        </ComboBox>
      </div>
    </div>
  );
}

```

### Custom Render Function

```tsx
"use client";

import {ComboBox, Input, Label, ListBox} from "@heroui/react";

export function CustomRenderFunction() {
  return (
    <ComboBox className="w-[256px]" render={(props) => <div {...props} data-custom="foo" />}>
      <Label>Favorite Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="aardvark" textValue="Aardvark">
            Aardvark
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="kangaroo" textValue="Kangaroo">
            Kangaroo
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="panda" textValue="Panda">
            Panda
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="snake" textValue="Snake">
            Snake
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

## Related Components

* **Listbox**: Scrollable list of selectable items
* **Popover**: Displays content in context with a trigger
* **Input**: Single-line text input built on React Aria

## Styling

### Passing Tailwind CSS classes

```tsx
import { ComboBox, Input } from '@heroui/react';

function CustomComboBox() {
  return (
    <ComboBox className="w-full">
      <Label>Favorite Animal</Label>
      <ComboBox.InputGroup className="border rounded-lg p-2 bg-surface">
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger className="text-muted" />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="1" textValue="Item 1" className="hover:bg-surface-secondary">
            Item 1
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Customizing the component classes

To customize the ComboBox component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .combo-box {
    @apply flex flex-col gap-1;
  }

  .combo-box__input-group {
    @apply relative inline-flex items-center;
  }

  .combo-box__trigger {
    @apply absolute right-0 text-muted;
  }

  .combo-box__popover {
    @apply rounded-lg border border-border bg-surface p-2;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The ComboBox component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/combo-box.css)):

#### Base Classes

* `.combo-box` - Base ComboBox container
* `.combo-box__input-group` - Container for the input and trigger button
* `.combo-box__trigger` - The button that triggers the popover
* `.combo-box__popover` - The popover container

#### State Classes

* `.combo-box[data-invalid="true"]` - Invalid state
* `.combo-box[data-disabled="true"]` - Disabled ComboBox state
* `.combo-box__trigger[data-focus-visible="true"]` - Focused trigger state
* `.combo-box__trigger[data-disabled="true"]` - Disabled trigger state
* `.combo-box__trigger[data-open="true"]` - Open trigger state

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Hover**: `:hover` or `[data-hovered="true"]` on trigger
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` on trigger
* **Disabled**: `:disabled` or `[data-disabled="true"]` on ComboBox
* **Open**: `[data-open="true"]` on trigger

## API Reference

### ComboBox Props

| Prop                    | Type                                                                               | Default    | Description                                                                                                                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputValue`            | `string`                                                                           | -          | Current input value (controlled)                                                                                                                                                                                                         |
| `defaultInputValue`     | `string`                                                                           | -          | Default input value (uncontrolled)                                                                                                                                                                                                       |
| `onInputChange`         | `(value: string) => void`                                                          | -          | Handler called when the input value changes                                                                                                                                                                                              |
| `selectedKey`           | `Key \| null`                                                                      | -          | Current selected key (controlled)                                                                                                                                                                                                        |
| `defaultSelectedKey`    | `Key \| null`                                                                      | -          | Default selected key (uncontrolled)                                                                                                                                                                                                      |
| `onSelectionChange`     | `(key: Key \| null) => void`                                                       | -          | Handler called when the selection changes                                                                                                                                                                                                |
| `isOpen`                | `boolean`                                                                          | -          | Sets the open state of the popover (controlled)                                                                                                                                                                                          |
| `defaultOpen`           | `boolean`                                                                          | -          | Sets the default open state of the popover (uncontrolled)                                                                                                                                                                                |
| `onOpenChange`          | `(isOpen: boolean) => void`                                                        | -          | Handler called when the open state changes                                                                                                                                                                                               |
| `items`                 | `Iterable<T>`                                                                      | -          | The items to display in the listbox                                                                                                                                                                                                      |
| `disabledKeys`          | `Iterable<Key>`                                                                    | -          | Keys of disabled items                                                                                                                                                                                                                   |
| `defaultFilter`         | `(text: string, inputValue: string) => boolean`                                    | -          | Custom filter function for filtering items                                                                                                                                                                                               |
| `isDisabled`            | `boolean`                                                                          | -          | Whether the ComboBox is disabled                                                                                                                                                                                                         |
| `isReadOnly`            | `boolean`                                                                          | -          | Whether the input can be selected but not changed by the user                                                                                                                                                                            |
| `isRequired`            | `boolean`                                                                          | -          | Whether user input is required                                                                                                                                                                                                           |
| `isInvalid`             | `boolean`                                                                          | -          | Whether the ComboBox value is invalid                                                                                                                                                                                                    |
| `validate`              | `(value: ComboBoxValidationValue) => ValidationError \| true \| null \| undefined` | -          | A function that returns an error message if a given value is invalid. Validation errors are displayed to the user when the form is submitted if `validationBehavior="native"`. For realtime validation, use the `isInvalid` prop instead |
| `validationBehavior`    | `"native" \| "aria"`                                                               | `"native"` | Whether to use native HTML form validation to prevent form submission when the value is missing or invalid, or mark the field as required or invalid via ARIA                                                                            |
| `name`                  | `string`                                                                           | -          | The name of the input, used when submitting an HTML form                                                                                                                                                                                 |
| `form`                  | `string`                                                                           | -          | The id of a `<form>` element to associate the input with                                                                                                                                                                                 |
| `formValue`             | `"text" \| "key"`                                                                  | `"key"`    | Whether the text or key of the selected item is submitted as part of an HTML form. When `allowsCustomValue` is `true`, this option does not apply and the text is always submitted                                                       |
| `autoComplete`          | `string`                                                                           | -          | Describes the type of autocomplete functionality                                                                                                                                                                                         |
| `autoFocus`             | `boolean`                                                                          | -          | Whether the element should receive focus on render                                                                                                                                                                                       |
| `allowsCustomValue`     | `boolean`                                                                          | -          | Whether the ComboBox allows custom values not in the list                                                                                                                                                                                |
| `allowsEmptyCollection` | `boolean`                                                                          | -          | Whether the ComboBox allows an empty collection                                                                                                                                                                                          |
| `menuTrigger`           | `"focus" \| "input" \| "manual"`                                                   | `"focus"`  | The interaction required to display the ComboBox menu                                                                                                                                                                                    |
| `shouldFocusWrap`       | `boolean`                                                                          | -          | Whether keyboard navigation is circular                                                                                                                                                                                                  |
| `fullWidth`             | `boolean`                                                                          | `false`    | Whether the ComboBox should take full width of its container                                                                                                                                                                             |
| `className`             | `string`                                                                           | -          | Additional CSS classes                                                                                                                                                                                                                   |
| `children`              | `ReactNode \| RenderFunction`                                                      | -          | ComboBox content or render function                                                                                                                                                                                                      |
| `render`                | `DOMRenderFunction<keyof React.JSX.IntrinsicElements, ComboBoxRenderProps>`        | -          | Overrides the default DOM element with a custom render function.                                                                                                                                                                         |

### ComboBox.InputGroup Props

| Prop        | Type        | Default | Description            |
| ----------- | ----------- | ------- | ---------------------- |
| `className` | `string`    | -       | Additional CSS classes |
| `children`  | `ReactNode` | -       | InputGroup content     |

### ComboBox.Trigger Props

| Prop        | Type        | Default | Description            |
| ----------- | ----------- | ------- | ---------------------- |
| `className` | `string`    | -       | Additional CSS classes |
| `children`  | `ReactNode` | -       | Custom trigger content |

### ComboBox.Popover Props

| Prop        | Type                                                                                                                                                                                                                                                                                                                     | Default    | Description                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------ |
| `placement` | `"bottom" \| "bottom left" \| "bottom right" \| "bottom start" \| "bottom end" \| "top" \| "top left" \| "top right" \| "top start" \| "top end" \| "left" \| "left top" \| "left bottom" \| "start" \| "start top" \| "start bottom" \| "right" \| "right top" \| "right bottom" \| "end" \| "end top" \| "end bottom"` | `"bottom"` | Placement of the popover relative to the trigger |
| `className` | `string`                                                                                                                                                                                                                                                                                                                 | -          | Additional CSS classes                           |
| `children`  | `ReactNode`                                                                                                                                                                                                                                                                                                              | -          | Content children                                 |

### RenderProps

When using render functions with ComboBox, these values are provided:

| Prop           | Type            | Description                 |
| -------------- | --------------- | --------------------------- |
| `state`        | `ComboBoxState` | The state of the ComboBox   |
| `inputValue`   | `string`        | The current input value     |
| `selectedKey`  | `Key \| null`   | The currently selected key  |
| `selectedItem` | `Node \| null`  | The currently selected item |

## Examples

### Basic Usage

```tsx
import { ComboBox, Input, Label, ListBox } from '@heroui/react';

<ComboBox className="w-[256px]">
  <Label>Favorite Animal</Label>
  <ComboBox.InputGroup>
    <Input placeholder="Search animals..." />
    <ComboBox.Trigger />
  </ComboBox.InputGroup>
  <ComboBox.Popover>
    <ListBox>
      <ListBox.Item id="cat" textValue="Cat">
        Cat
        <ListBox.ItemIndicator />
      </ListBox.Item>
      <ListBox.Item id="dog" textValue="Dog">
        Dog
        <ListBox.ItemIndicator />
      </ListBox.Item>
    </ListBox>
  </ComboBox.Popover>
</ComboBox>

```

### With Sections

```tsx
import { ComboBox, Input, Label, ListBox, Header, Separator } from '@heroui/react';

<ComboBox className="w-[256px]">
  <Label>Country</Label>
  <ComboBox.InputGroup>
    <Input placeholder="Search countries..." />
    <ComboBox.Trigger />
  </ComboBox.InputGroup>
  <ComboBox.Popover>
    <ListBox>
      <ListBox.Section>
        <Header>North America</Header>
        <ListBox.Item id="usa" textValue="United States">
          United States
          <ListBox.ItemIndicator />
        </ListBox.Item>
      </ListBox.Section>
      <Separator />
      <ListBox.Section>
        <Header>Europe</Header>
        <ListBox.Item id="uk" textValue="United Kingdom">
          United Kingdom
          <ListBox.ItemIndicator />
        </ListBox.Item>
      </ListBox.Section>
    </ListBox>
  </ComboBox.Popover>
</ComboBox>

```

### Controlled Selection

```tsx
import type { Key } from '@heroui/react';

import { ComboBox, Input, Label, ListBox } from '@heroui/react';
import { useState } from 'react';

function ControlledComboBox() {
  const [selectedKey, setSelectedKey] = useState<Key | null>('cat');

  return (
    <ComboBox
      className="w-[256px]"
      selectedKey={selectedKey}
      onSelectionChange={setSelectedKey}
    >
      <Label>Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Controlled Input Value

```tsx
import { ComboBox, Input, Label, ListBox } from '@heroui/react';
import { useState } from 'react';

function ControlledInputComboBox() {
  const [inputValue, setInputValue] = useState('');

  return (
    <ComboBox
      className="w-[256px]"
      inputValue={inputValue}
      onInputChange={setInputValue}
    >
      <Label>Search</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Type to search..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Asynchronous Loading

```tsx
import { Collection, ComboBox, EmptyState, Input, Label, ListBox, ListBoxLoadMoreItem, Spinner } from '@heroui/react';
import { useAsyncList } from '@react-stately/data';

interface Character {
  name: string;
}

function AsyncComboBox() {
  const list = useAsyncList<Character>({
    async load({cursor, filterText, signal}) {
      const res = await fetch(
        cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`,
        { signal }
      );
      const json = await res.json();

      return {
        items: json.results,
        cursor: json.next,
      };
    },
  });

  return (
    <ComboBox
      allowsEmptyCollection
      className="w-[256px]"
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
    >
      <Label>Pick a Character</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Star Wars characters..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox renderEmptyState={() => <EmptyState />}>
          <Collection items={list.items}>
            {(item) => (
              <ListBox.Item id={item.name} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </Collection>
          <ListBoxLoadMoreItem
            isLoading={list.loadingState === "loadingMore"}
            onLoadMore={list.loadMore}
          >
            <div className="flex items-center justify-center gap-2 py-2">
              <Spinner size="sm" />
              <span className="text-sm text-muted">Loading more...</span>
            </div>
          </ListBoxLoadMoreItem>
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

```

### Custom Filtering

```tsx
import { ComboBox, Input, Label, ListBox } from '@heroui/react';

<ComboBox
  className="w-[256px]"
  defaultFilter={(text, inputValue) => {
    if (!inputValue) return true;
    return text.toLowerCase().includes(inputValue.toLowerCase());
  }}
>
  <Label>Animal</Label>
  <ComboBox.InputGroup>
    <Input placeholder="Search animals..." />
    <ComboBox.Trigger />
  </ComboBox.InputGroup>
  <ComboBox.Popover>
    <ListBox>
      <ListBox.Item id="cat" textValue="Cat">
        Cat
        <ListBox.ItemIndicator />
      </ListBox.Item>
      <ListBox.Item id="dog" textValue="Dog">
        Dog
        <ListBox.ItemIndicator />
      </ListBox.Item>
    </ListBox>
  </ComboBox.Popover>
</ComboBox>

```

### Menu Trigger

Control when the popover opens using the `menuTrigger` prop:

```tsx
import { ComboBox, Description, Input, Label, ListBox } from '@heroui/react';

// Opens on focus (default)
<ComboBox className="w-[256px]" menuTrigger="focus">
  <Label>Favorite Animal</Label>
  <ComboBox.InputGroup>
    <Input placeholder="Search animals..." />
    <ComboBox.Trigger />
  </ComboBox.InputGroup>
  <ComboBox.Popover>
    <ListBox>
      <ListBox.Item id="cat" textValue="Cat">
        Cat
        <ListBox.ItemIndicator />
      </ListBox.Item>
    </ListBox>
  </ComboBox.Popover>
  <Description>Popover opens when the input is focused</Description>
</ComboBox>

// Opens when typing
<ComboBox className="w-[256px]" menuTrigger="input">
  <Label>Favorite Animal</Label>
  <ComboBox.InputGroup>
    <Input placeholder="Search animals..." />
    <ComboBox.Trigger />
  </ComboBox.InputGroup>
  <ComboBox.Popover>
    <ListBox>
      <ListBox.Item id="cat" textValue="Cat">
        Cat
        <ListBox.ItemIndicator />
      </ListBox.Item>
    </ListBox>
  </ComboBox.Popover>
  <Description>Popover opens when the user edits the input text</Description>
</ComboBox>

// Opens only manually
<ComboBox className="w-[256px]" menuTrigger="manual">
  <Label>Favorite Animal</Label>
  <ComboBox.InputGroup>
    <Input placeholder="Search animals..." />
    <ComboBox.Trigger />
  </ComboBox.InputGroup>
  <ComboBox.Popover>
    <ListBox>
      <ListBox.Item id="cat" textValue="Cat">
        Cat
        <ListBox.ItemIndicator />
      </ListBox.Item>
    </ListBox>
  </ComboBox.Popover>
  <Description>Popover only opens when the trigger button is pressed or arrow keys are used</Description>
</ComboBox>

```

### Form Value

Use the `formValue` prop to control whether the selected item's key or text is submitted in forms:

```tsx
import { Button, ComboBox, FieldError, Form, Input, Label, ListBox } from '@heroui/react';

function FormValueExample() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log('Submitted value:', formData.get('animal')); // Will be "cat" (the key)
  };

  return (
    <Form onSubmit={onSubmit}>
      {/* Submits the key (default) */}
      <ComboBox name="animal" formValue="key" isRequired>
        <Label>Animal</Label>
        <ComboBox.InputGroup>
          <Input placeholder="Select an animal..." />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            <ListBox.Item id="cat" textValue="Cat">
              Cat
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="dog" textValue="Dog">
              Dog
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </ComboBox.Popover>
        <FieldError />
      </ComboBox>

      {/* Submits the text */}
      <ComboBox name="animal-text" formValue="text" isRequired>
        <Label>Animal (text)</Label>
        <ComboBox.InputGroup>
          <Input placeholder="Select an animal..." />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            <ListBox.Item id="cat" textValue="Cat">
              Cat
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="dog" textValue="Dog">
              Dog
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </ComboBox.Popover>
        <FieldError />
      </ComboBox>

      <Button type="submit">Submit</Button>
    </Form>
  );
}

```

### Validation Behavior

Control how validation is displayed using the `validationBehavior` prop:

```tsx
import { Button, ComboBox, FieldError, Form, Input, Label, ListBox } from '@heroui/react';

function ValidationExample() {
  return (
    <div className="space-y-8">
      {/* Native validation (default) - blocks form submission */}
      <Form>
        <ComboBox name="animal" isRequired validationBehavior="native">
          <Label>Animal (native validation)</Label>
          <ComboBox.InputGroup>
            <Input placeholder="Select an animal..." />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              <ListBox.Item id="cat" textValue="Cat">
                Cat
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </ComboBox.Popover>
          <FieldError />
        </ComboBox>
        <Button type="submit">Submit</Button>
      </Form>

      {/* ARIA validation - shows errors in realtime, doesn't block submission */}
      <Form>
        <ComboBox name="animal-aria" isRequired validationBehavior="aria">
          <Label>Animal (ARIA validation)</Label>
          <ComboBox.InputGroup>
            <Input placeholder="Select an animal..." />
            <ComboBox.Trigger />
          </ComboBox.InputGroup>
          <ComboBox.Popover>
            <ListBox>
              <ListBox.Item id="cat" textValue="Cat">
                Cat
                <ListBox.ItemIndicator />
              </ListBox.Item>
            </ListBox>
          </ComboBox.Popover>
          <FieldError />
        </ComboBox>
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}

```

### Custom Validation

Use the `validate` prop to add custom validation logic:

```tsx
import { ComboBox, FieldError, Input, Label, ListBox } from '@heroui/react';

function CustomValidationExample() {
  return (
    <ComboBox
      className="w-[256px]"
      isRequired
      validate={(value) => {
        if (!value || value.selectedKey === null) {
          return 'Please select an animal';
        }
        if (value.selectedKey === 'snake') {
          return 'Snakes are not allowed';
        }
        return true;
      }}
    >
      <Label>Favorite Animal</Label>
      <ComboBox.InputGroup>
        <Input placeholder="Search animals..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          <ListBox.Item id="cat" textValue="Cat">
            Cat
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="dog" textValue="Dog">
            Dog
            <ListBox.ItemIndicator />
          </ListBox.Item>
          <ListBox.Item id="snake" textValue="Snake">
            Snake
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </ComboBox.Popover>
      <FieldError />
    </ComboBox>
  );
}

```

### Read Only

Use the `isReadOnly` prop to make the comboBox read-only:

```tsx
import { ComboBox, Input, Label, ListBox } from '@heroui/react';

<ComboBox className="w-[256px]" isReadOnly defaultSelectedKey="cat">
  <Label>Favorite Animal</Label>
  <ComboBox.InputGroup>
    <Input placeholder="Search animals..." />
    <ComboBox.Trigger />
  </ComboBox.InputGroup>
  <ComboBox.Popover>
    <ListBox>
      <ListBox.Item id="cat" textValue="Cat">
        Cat
        <ListBox.ItemIndicator />
      </ListBox.Item>
      <ListBox.Item id="dog" textValue="Dog">
        Dog
        <ListBox.ItemIndicator />
      </ListBox.Item>
    </ListBox>
  </ComboBox.Popover>
</ComboBox>

```

## Accessibility

The ComboBox component implements the ARIA comboBox pattern and provides:

* Full keyboard navigation support
* Screen reader announcements for selection changes and input changes
* Proper focus management
* Support for disabled states
* Typeahead search functionality
* HTML form integration
* Support for custom values

For more information, see the [React Aria ComboBox documentation](https://react-spectrum.adobe.com/react-aria/ComboBox.html).
