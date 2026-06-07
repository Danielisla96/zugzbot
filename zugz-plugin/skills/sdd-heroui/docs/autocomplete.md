# Autocomplete

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/autocomplete
> An autocomplete combines a select with filtering, allowing users to search and select from a list of options


## Import

```tsx
import { Autocomplete, useFilter } from "@heroui/react";

```

### Usage

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export default function Default() {
  const {contains} = useFilter({sensitivity: "base"});

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);

  const items = [
    {id: "florida", name: "Florida"},
    {id: "delaware", name: "Delaware"},
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "new-york", name: "New York"},
    {id: "washington", name: "Washington"},
  ];

  const onRemoveTags = (keys: Set<Key>) => {
    setSelectedKeys((prev) => prev.filter((key) => !keys.has(key)));
  };

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Select states"
      selectionMode="multiple"
      value={selectedKeys}
      onChange={(keys: Key | Key[] | null) => setSelectedKeys(keys as Key[])}
    >
      <Label>States to Visit</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({defaultChildren, isPlaceholder, state}: any) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItemsKeys = state.selectedItems.map((item: any) => item.key);

            return (
              <TagGroup size="sm" onRemove={onRemoveTags}>
                <TagGroup.List>
                  {selectedItemsKeys.map((selectedItemKey: Key) => {
                    const item = items.find((s) => s.id === selectedItemKey);

                    if (!item) return null;

                    return (
                      <Tag key={item.id} id={item.id}>
                        {item.name}
                      </Tag>
                    );
                  })}
                </TagGroup.List>
              </TagGroup>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
            {items.map((item) => (
              <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### Anatomy

Import the Autocomplete component and access all parts using dot notation.

```tsx
import {Autocomplete, Label, Description, SearchField, ListBox} from "@heroui/react";

export default () => (
  <Autocomplete>
    <Label />
    <Autocomplete.Trigger>
      <Autocomplete.Value />
      <Autocomplete.ClearButton />
      <Autocomplete.Indicator />
    </Autocomplete.Trigger>
    <Description />
    <Autocomplete.Popover>
      <Autocomplete.Filter>
        <SearchField>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input />
          </SearchField.Group>
        </SearchField>
        <ListBox>
          <ListBox.Item>
            <Label />
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </Autocomplete.Filter>
    </Autocomplete.Popover>
  </Autocomplete>
);

```

### With Description

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  Description,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function WithDescription() {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const {contains} = useFilter({sensitivity: "base"});

  const items = [
    {id: "florida", name: "Florida"},
    {id: "delaware", name: "Delaware"},
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "new-york", name: "New York"},
    {id: "washington", name: "Washington"},
  ];

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Select one"
      selectionMode="single"
      value={selectedKey}
      onChange={setSelectedKey}
    >
      <Label>State</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search states..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
            {items.map((item) => (
              <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
      <Description>Select your state of residence</Description>
    </Autocomplete>
  );
}

```

### Multiple Select

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function MultipleSelect() {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const {contains} = useFilter({sensitivity: "base"});

  const items = [
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "florida", name: "Florida"},
    {id: "new-york", name: "New York"},
    {id: "illinois", name: "Illinois"},
    {id: "pennsylvania", name: "Pennsylvania"},
  ];

  const onRemoveTags = (keys: Set<Key>) => {
    setSelectedKeys((prev) => prev.filter((key) => !keys.has(key)));
  };

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Select states"
      selectionMode="multiple"
      value={selectedKeys}
      onChange={(keys) => setSelectedKeys(keys as Key[])}
    >
      <Label>States</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItemsKeys = state.selectedItems.map((item) => item.key);

            return (
              <TagGroup size="sm" onRemove={onRemoveTags}>
                <TagGroup.List>
                  {selectedItemsKeys.map((selectedItemKey) => {
                    const item = items.find((s) => s.id === selectedItemKey);

                    if (!item) return null;

                    return (
                      <Tag key={item.id} id={item.id}>
                        {item.name}
                      </Tag>
                    );
                  })}
                </TagGroup.List>
              </TagGroup>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
            {items.map((item) => (
              <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### With Sections

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  EmptyState,
  Header,
  Label,
  ListBox,
  SearchField,
  Separator,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function WithSections() {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const {contains} = useFilter({sensitivity: "base"});

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Select a country"
      selectionMode="single"
      value={selectedKey}
      onChange={setSelectedKey}
    >
      <Label>Country</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search countries..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
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
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### With Disabled Options

```tsx
"use client";

import type {Key} from "@heroui/react";

import {Autocomplete, EmptyState, Label, ListBox, SearchField, useFilter} from "@heroui/react";
import {useState} from "react";

export function WithDisabledOptions() {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const {contains} = useFilter({sensitivity: "base"});

  return (
    <Autocomplete
      className="w-[256px]"
      disabledKeys={["cat", "kangaroo"]}
      placeholder="Select an animal"
      selectionMode="single"
      value={selectedKey}
      onChange={setSelectedKey}
    >
      <Label>Animal</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search animals..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
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
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### Allows Empty Collection

The `allowsEmptyCollection` prop enables the autocomplete to function even when there are no items in the collection. This is useful for scenarios where the list might be empty initially or when all items are filtered out.

```tsx
"use client";

import {Autocomplete, EmptyState, Label, ListBox, SearchField, useFilter} from "@heroui/react";

export function AllowsEmptyCollection() {
  const {contains} = useFilter({sensitivity: "base"});

  return (
    <Autocomplete
      allowsEmptyCollection
      className="w-[256px]"
      placeholder="Select one"
      selectionMode="single"
    >
      <Label>State</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search states..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>} />
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### Custom Indicator

```tsx
"use client";

import type {Key} from "@heroui/react";

import {Autocomplete, EmptyState, Label, ListBox, SearchField, useFilter} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useState} from "react";

export function CustomIndicator() {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const {contains} = useFilter({sensitivity: "base"});

  const items = [
    {id: "florida", name: "Florida"},
    {id: "delaware", name: "Delaware"},
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "new-york", name: "New York"},
    {id: "washington", name: "Washington"},
  ];

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Select one"
      selectionMode="single"
      value={selectedKey}
      onChange={setSelectedKey}
    >
      <Label>State</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator className="size-3">
          <Icon icon="gravity-ui:chevrons-expand-vertical" />
        </Autocomplete.Indicator>
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search states..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
            {items.map((item) => (
              <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### Required

```tsx
"use client";

import {
  Autocomplete,
  Button,
  EmptyState,
  FieldError,
  Form,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";

export function Required() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};

    // Convert FormData to plain object
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    alert("Form submitted successfully!");
  };

  const {contains} = useFilter({sensitivity: "base"});

  const states = [
    {id: "florida", name: "Florida"},
    {id: "delaware", name: "Delaware"},
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "new-york", name: "New York"},
    {id: "washington", name: "Washington"},
  ];

  const countries = [
    {id: "usa", name: "United States"},
    {id: "canada", name: "Canada"},
    {id: "mexico", name: "Mexico"},
    {id: "uk", name: "United Kingdom"},
    {id: "france", name: "France"},
    {id: "germany", name: "Germany"},
  ];

  return (
    <Form className="flex w-[256px] flex-col gap-4" onSubmit={onSubmit}>
      <Autocomplete
        isRequired
        className="w-full"
        name="state"
        placeholder="Select one"
        selectionMode="single"
      >
        <Label>State</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField autoFocus name="search" variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search states..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
              {states.map((state) => (
                <ListBox.Item key={state.id} id={state.id} textValue={state.name}>
                  {state.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
        <FieldError />
      </Autocomplete>
      <Autocomplete
        isRequired
        className="w-full"
        name="country"
        placeholder="Select a country"
        selectionMode="single"
      >
        <Label>Country</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField autoFocus name="search" variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search countries..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
              {countries.map((country) => (
                <ListBox.Item key={country.id} id={country.id} textValue={country.name}>
                  {country.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
        <FieldError />
      </Autocomplete>
      <Button type="submit">Submit</Button>
    </Form>
  );
}

```

### Full Width

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Surface,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function FullWidth() {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const {contains} = useFilter({sensitivity: "base"});

  const items = [
    {id: "florida", name: "Florida"},
    {id: "delaware", name: "Delaware"},
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "new-york", name: "New York"},
    {id: "washington", name: "Washington"},
  ];

  return (
    <Surface className="w-[380px] space-y-4 rounded-3xl p-6">
      <Autocomplete
        fullWidth
        placeholder="Select one"
        selectionMode="single"
        value={selectedKey}
        variant="secondary"
        onChange={setSelectedKey}
      >
        <Label>State</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField autoFocus name="search" variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search states..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
              {items.map((item) => (
                <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                  {item.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
    </Surface>
  );
}

```

### Variants

The Autocomplete component supports two visual variants:

* **`primary`** (default) - Standard styling with shadow, suitable for most use cases
* **`secondary`** - Lower emphasis variant without shadow, suitable for use in Surface components

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function Variants() {
  const [selectedKey1, setSelectedKey1] = useState<Key | null>(null);
  const [selectedKey2, setSelectedKey2] = useState<Key | null>(null);
  const [selectedKeys1, setSelectedKeys1] = useState<Key[]>([]);
  const [selectedKeys2, setSelectedKeys2] = useState<Key[]>([]);
  const {contains} = useFilter({sensitivity: "base"});

  const items = [
    {id: "option1", name: "Option 1"},
    {id: "option2", name: "Option 2"},
    {id: "option3", name: "Option 3"},
    {id: "option4", name: "Option 4"},
  ];

  const onRemoveTags1 = (keys: Set<Key>) => {
    setSelectedKeys1((prev) => prev.filter((key) => !keys.has(key)));
  };

  const onRemoveTags2 = (keys: Set<Key>) => {
    setSelectedKeys2((prev) => prev.filter((key) => !keys.has(key)));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Single Select Variants</h3>
        <div className="flex flex-col gap-4">
          <Autocomplete
            className="w-[256px]"
            placeholder="Select one"
            selectionMode="single"
            value={selectedKey1}
            variant="primary"
            onChange={setSelectedKey1}
          >
            <Label>Primary variant</Label>
            <Autocomplete.Trigger>
              <Autocomplete.Value />
              <Autocomplete.ClearButton />
              <Autocomplete.Indicator />
            </Autocomplete.Trigger>
            <Autocomplete.Popover>
              <Autocomplete.Filter filter={contains}>
                <SearchField autoFocus name="search" variant="secondary">
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search..." />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
                  {items.map((item) => (
                    <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                      {item.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Autocomplete.Filter>
            </Autocomplete.Popover>
          </Autocomplete>
          <Autocomplete
            className="w-[256px]"
            placeholder="Select one"
            selectionMode="single"
            value={selectedKey2}
            variant="secondary"
            onChange={setSelectedKey2}
          >
            <Label>Secondary variant</Label>
            <Autocomplete.Trigger>
              <Autocomplete.Value />
              <Autocomplete.ClearButton />
              <Autocomplete.Indicator />
            </Autocomplete.Trigger>
            <Autocomplete.Popover>
              <Autocomplete.Filter filter={contains}>
                <SearchField autoFocus name="search" variant="secondary">
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search..." />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
                  {items.map((item) => (
                    <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                      {item.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Autocomplete.Filter>
            </Autocomplete.Popover>
          </Autocomplete>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Multiple Select Variants</h3>
        <div className="flex flex-col gap-4">
          <Autocomplete
            className="w-[256px]"
            placeholder="Select multiple"
            selectionMode="multiple"
            value={selectedKeys1}
            variant="primary"
            onChange={(keys) => setSelectedKeys1(keys as Key[])}
          >
            <Label>Primary variant</Label>
            <Autocomplete.Trigger>
              <Autocomplete.Value>
                {({defaultChildren, isPlaceholder, state}) => {
                  if (isPlaceholder || state.selectedItems.length === 0) {
                    return defaultChildren;
                  }

                  const selectedItemsKeys = state.selectedItems.map((item) => item.key);

                  return (
                    <TagGroup size="sm" onRemove={onRemoveTags1}>
                      <TagGroup.List>
                        {selectedItemsKeys.map((selectedItemKey) => {
                          const item = items.find((s) => s.id === selectedItemKey);

                          if (!item) return null;

                          return (
                            <Tag key={item.id} id={item.id}>
                              {item.name}
                            </Tag>
                          );
                        })}
                      </TagGroup.List>
                    </TagGroup>
                  );
                }}
              </Autocomplete.Value>
              <Autocomplete.ClearButton />
              <Autocomplete.Indicator />
            </Autocomplete.Trigger>
            <Autocomplete.Popover>
              <Autocomplete.Filter filter={contains}>
                <SearchField autoFocus name="search" variant="secondary">
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search..." />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
                  {items.map((item) => (
                    <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                      {item.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Autocomplete.Filter>
            </Autocomplete.Popover>
          </Autocomplete>
          <Autocomplete
            className="w-[256px]"
            placeholder="Select multiple"
            selectionMode="multiple"
            value={selectedKeys2}
            variant="secondary"
            onChange={(keys) => setSelectedKeys2(keys as Key[])}
          >
            <Label>Secondary variant</Label>
            <Autocomplete.Trigger>
              <Autocomplete.Value>
                {({defaultChildren, isPlaceholder, state}) => {
                  if (isPlaceholder || state.selectedItems.length === 0) {
                    return defaultChildren;
                  }

                  const selectedItemsKeys = state.selectedItems.map((item) => item.key);

                  return (
                    <TagGroup size="sm" variant="surface" onRemove={onRemoveTags2}>
                      <TagGroup.List>
                        {selectedItemsKeys.map((selectedItemKey) => {
                          const item = items.find((s) => s.id === selectedItemKey);

                          if (!item) return null;

                          return (
                            <Tag key={item.id} id={item.id}>
                              {item.name}
                            </Tag>
                          );
                        })}
                      </TagGroup.List>
                    </TagGroup>
                  );
                }}
              </Autocomplete.Value>
              <Autocomplete.ClearButton />
              <Autocomplete.Indicator />
            </Autocomplete.Trigger>
            <Autocomplete.Popover>
              <Autocomplete.Filter filter={contains}>
                <SearchField autoFocus name="search" variant="secondary">
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search..." />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
                  {items.map((item) => (
                    <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                      {item.name}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Autocomplete.Filter>
            </Autocomplete.Popover>
          </Autocomplete>
        </div>
      </div>
    </div>
  );
}

```

### In Surface

When used inside a [Surface](/docs/components/surface) component, use `variant="secondary"` to apply the lower emphasis variant suitable for surface backgrounds.

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Surface,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function FullWidth() {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const {contains} = useFilter({sensitivity: "base"});

  const items = [
    {id: "florida", name: "Florida"},
    {id: "delaware", name: "Delaware"},
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "new-york", name: "New York"},
    {id: "washington", name: "Washington"},
  ];

  return (
    <Surface className="w-[380px] space-y-4 rounded-3xl p-6">
      <Autocomplete
        fullWidth
        placeholder="Select one"
        selectionMode="single"
        value={selectedKey}
        variant="secondary"
        onChange={setSelectedKey}
      >
        <Label>State</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField autoFocus name="search" variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search states..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
              {items.map((item) => (
                <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                  {item.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
    </Surface>
  );
}

```

### Custom Value

You can customize the displayed value using render props:

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Description,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function UserSelection() {
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

  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const {contains} = useFilter({sensitivity: "base"});

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Select a user"
      selectionMode="single"
      value={selectedKey}
      onChange={setSelectedKey}
    >
      <Label>User</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItems = state.selectedItems;

            if (selectedItems.length > 1) {
              return `${selectedItems.length} users selected`;
            }

            const selectedItem = users.find((user) => user.id === selectedItems[0]?.key);

            if (!selectedItem) {
              return defaultChildren;
            }

            return (
              <div className="flex items-center gap-2">
                <Avatar className="size-4" size="sm">
                  <AvatarImage src={selectedItem.avatarUrl} />
                  <AvatarFallback>{selectedItem.fallback}</AvatarFallback>
                </Avatar>
                <span>{selectedItem.name}</span>
              </div>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search users..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
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
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### Controlled

```tsx
"use client";

import type {Key} from "@heroui/react";

import {Autocomplete, EmptyState, Label, ListBox, SearchField, useFilter} from "@heroui/react";
import {useState} from "react";

export function Controlled() {
  const states = [
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "florida", name: "Florida"},
    {id: "new-york", name: "New York"},
    {id: "illinois", name: "Illinois"},
    {id: "pennsylvania", name: "Pennsylvania"},
  ];

  const [state, setState] = useState<Key | null>("california");
  const {contains} = useFilter({sensitivity: "base"});

  const selectedState = states.find((s) => s.id === state);

  return (
    <div className="space-y-2">
      <Autocomplete
        className="w-[256px]"
        placeholder="Select a state"
        selectionMode="single"
        value={state}
        onChange={setState}
      >
        <Label>State (controlled)</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField autoFocus name="search" variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search states..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
              {states.map((state) => (
                <ListBox.Item key={state.id} id={state.id} textValue={state.name}>
                  {state.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
      <p className="text-sm text-muted">Selected: {selectedState?.name || "None"}</p>
    </div>
  );
}

```

### Controlled Multiple

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function MultipleSelect() {
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const {contains} = useFilter({sensitivity: "base"});

  const items = [
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "florida", name: "Florida"},
    {id: "new-york", name: "New York"},
    {id: "illinois", name: "Illinois"},
    {id: "pennsylvania", name: "Pennsylvania"},
  ];

  const onRemoveTags = (keys: Set<Key>) => {
    setSelectedKeys((prev) => prev.filter((key) => !keys.has(key)));
  };

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Select states"
      selectionMode="multiple"
      value={selectedKeys}
      onChange={(keys) => setSelectedKeys(keys as Key[])}
    >
      <Label>States</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItemsKeys = state.selectedItems.map((item) => item.key);

            return (
              <TagGroup size="sm" onRemove={onRemoveTags}>
                <TagGroup.List>
                  {selectedItemsKeys.map((selectedItemKey) => {
                    const item = items.find((s) => s.id === selectedItemKey);

                    if (!item) return null;

                    return (
                      <Tag key={item.id} id={item.id}>
                        {item.name}
                      </Tag>
                    );
                  })}
                </TagGroup.List>
              </TagGroup>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
            {items.map((item) => (
              <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### Controlled Open State

```tsx
"use client";

import {
  Autocomplete,
  Button,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function ControlledOpenState() {
  const [isOpen, setIsOpen] = useState(false);
  const {contains} = useFilter({sensitivity: "base"});

  const items = [
    {id: "florida", name: "Florida"},
    {id: "delaware", name: "Delaware"},
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "new-york", name: "New York"},
    {id: "washington", name: "Washington"},
  ];

  return (
    <div className="space-y-4">
      <Autocomplete
        className="w-[256px]"
        isOpen={isOpen}
        placeholder="Select one"
        selectionMode="single"
        onOpenChange={setIsOpen}
      >
        <Label>State</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField autoFocus name="search" variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search states..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
              {items.map((item) => (
                <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                  {item.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
      <Button onPress={() => setIsOpen(!isOpen)}>{isOpen ? "Close" : "Open"} Autocomplete</Button>
      <p className="text-sm text-muted">Autocomplete is {isOpen ? "open" : "closed"}</p>
    </div>
  );
}

```

### Asynchronous Filtering

```tsx
"use client";

import {Autocomplete, EmptyState, Label, ListBox, SearchField, Spinner} from "@heroui/react";
import {useAsyncList} from "@react-stately/data";
import {cn} from "tailwind-variants";

interface Character {
  name: string;
}

export function AsynchronousFiltering() {
  const list = useAsyncList<Character>({
    async load({filterText, signal}) {
      const res = await fetch(`https://swapi.py4e.com/api/people/?search=${filterText}`, {
        signal,
      });

      const json = await res.json();

      return {
        items: json.results,
      };
    },
  });

  return (
    <Autocomplete
      allowsEmptyCollection
      className="w-[256px]"
      placeholder="Search..."
      selectionMode="single"
    >
      <Label>Search a Star Wars characters</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter inputValue={list.filterText} onInputChange={list.setFilterText}>
          <SearchField autoFocus className="sticky top-0 z-10" name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search characters..." />
              <Spinner
                size="sm"
                className={cn("absolute top-1/2 right-2 -translate-y-1/2", {
                  "pointer-events-none opacity-0": !list.isLoading,
                })}
              />
              <SearchField.ClearButton
                className={cn({"pointer-events-none opacity-0": !!list.isLoading})}
              />
            </SearchField.Group>
          </SearchField>
          <ListBox
            className="max-h-[420px] overflow-y-auto"
            items={list.items}
            renderEmptyState={() => <EmptyState>No results found</EmptyState>}
          >
            {(item: Character) => (
              <ListBox.Item id={item.name} textValue={item.name}>
                {item.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            )}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### Disabled

```tsx
"use client";

import {Autocomplete, EmptyState, Label, ListBox, SearchField, useFilter} from "@heroui/react";

export function Disabled() {
  const {contains} = useFilter({sensitivity: "base"});

  const items = [
    {id: "florida", name: "Florida"},
    {id: "delaware", name: "Delaware"},
    {id: "california", name: "California"},
    {id: "texas", name: "Texas"},
    {id: "new-york", name: "New York"},
    {id: "washington", name: "Washington"},
  ];

  const countries = [
    {id: "argentina", name: "Argentina"},
    {id: "venezuela", name: "Venezuela"},
    {id: "japan", name: "Japan"},
    {id: "france", name: "France"},
    {id: "italy", name: "Italy"},
    {id: "spain", name: "Spain"},
  ];

  return (
    <div className="flex flex-col gap-4">
      <Autocomplete
        isDisabled
        className="w-[256px]"
        defaultValue="california"
        placeholder="Select one"
        selectionMode="single"
      >
        <Label>State</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField autoFocus name="search" variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search states..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
              {items.map((item) => (
                <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
                  {item.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
      <Autocomplete
        isDisabled
        className="w-[256px]"
        defaultValue={["argentina", "japan", "france"]}
        placeholder="Select countries"
        selectionMode="multiple"
      >
        <Label>Countries to Visit</Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value />
          <Autocomplete.ClearButton />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Popover>
          <Autocomplete.Filter filter={contains}>
            <SearchField autoFocus name="search" variant="secondary">
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search countries..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
              {countries.map((country) => (
                <ListBox.Item key={country.id} id={country.id} textValue={country.name}>
                  {country.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Autocomplete.Filter>
        </Autocomplete.Popover>
      </Autocomplete>
    </div>
  );
}

```

### Advanced Examples

#### User Selection

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Description,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function UserSelection() {
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

  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const {contains} = useFilter({sensitivity: "base"});

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Select a user"
      selectionMode="single"
      value={selectedKey}
      onChange={setSelectedKey}
    >
      <Label>User</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItems = state.selectedItems;

            if (selectedItems.length > 1) {
              return `${selectedItems.length} users selected`;
            }

            const selectedItem = users.find((user) => user.id === selectedItems[0]?.key);

            if (!selectedItem) {
              return defaultChildren;
            }

            return (
              <div className="flex items-center gap-2">
                <Avatar className="size-4" size="sm">
                  <AvatarImage src={selectedItem.avatarUrl} />
                  <AvatarFallback>{selectedItem.fallback}</AvatarFallback>
                </Avatar>
                <span>{selectedItem.name}</span>
              </div>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search users..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
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
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

#### User Selection Multiple

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Description,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function UserSelectionMultiple() {
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

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const {contains} = useFilter({sensitivity: "base"});

  const onRemoveTags = (keys: Set<Key>) => {
    setSelectedKeys((prev) => prev.filter((key) => !keys.has(key)));
  };

  return (
    <Autocomplete
      className="w-[256px]"
      defaultValue={["1", "2"]}
      placeholder="Select your teammates"
      selectionMode="multiple"
      value={selectedKeys}
      onChange={(keys) => setSelectedKeys(keys as Key[])}
    >
      <Label>Users</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItemsKeys = state.selectedItems.map((item) => item.key);

            return (
              <TagGroup size="sm" onRemove={onRemoveTags}>
                <TagGroup.List>
                  {selectedItemsKeys.map((selectedItemKey) => {
                    const selectedItem = users.find((user) => user.id === selectedItemKey);

                    if (!selectedItem) {
                      return null;
                    }

                    return (
                      <Tag key={selectedItem.id} id={selectedItem.id}>
                        <Avatar className="size-4" size="sm">
                          <AvatarImage src={selectedItem.avatarUrl} />
                          <AvatarFallback>{selectedItem.fallback}</AvatarFallback>
                        </Avatar>
                        <span>{selectedItem.name}</span>
                      </Tag>
                    );
                  })}
                </TagGroup.List>
              </TagGroup>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search users..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No results found</EmptyState>}>
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
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

#### Location Search

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  Description,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

interface City {
  name: string;
  country: string;
}

export function LocationSearch() {
  const allCities: City[] = [
    {country: "USA", name: "New York"},
    {country: "USA", name: "Los Angeles"},
    {country: "USA", name: "Chicago"},
    {country: "UK", name: "London"},
    {country: "France", name: "Paris"},
    {country: "Japan", name: "Tokyo"},
    {country: "Australia", name: "Sydney"},
    {country: "Canada", name: "Toronto"},
    {country: "Germany", name: "Berlin"},
    {country: "Spain", name: "Madrid"},
  ];

  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {contains} = useFilter({sensitivity: "base"});

  // Simulate async filtering
  const customFilter = (text: string, inputValue: string) => {
    if (!inputValue) return true;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);

    return contains(text, inputValue);
  };

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Search for a city"
      selectionMode="single"
      value={selectedKey}
      onChange={setSelectedKey}
    >
      <Label>City</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={customFilter}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search cities..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox
            renderEmptyState={() => (
              <EmptyState>{isLoading ? "Searching..." : "No cities found"}</EmptyState>
            )}
          >
            {allCities.map((city) => (
              <ListBox.Item key={city.name} id={city.name} textValue={city.name}>
                <div className="flex flex-col">
                  <Label>{city.name}</Label>
                  <Description>{city.country}</Description>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

#### Tag Group Selection

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function TagGroupSelection() {
  const tags = [
    {id: "react", name: "React"},
    {id: "typescript", name: "TypeScript"},
    {id: "javascript", name: "JavaScript"},
    {id: "nodejs", name: "Node.js"},
    {id: "python", name: "Python"},
    {id: "vue", name: "Vue"},
    {id: "angular", name: "Angular"},
    {id: "nextjs", name: "Next.js"},
  ];

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const {contains} = useFilter({sensitivity: "base"});

  const onRemoveTags = (keys: Set<Key>) => {
    setSelectedKeys((prev) => prev.filter((key) => !keys.has(key)));
  };

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Select tags"
      selectionMode="multiple"
      value={selectedKeys}
      onChange={(keys) => setSelectedKeys(keys as Key[])}
    >
      <Label>Tags</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItemsKeys = state.selectedItems.map((item) => item.key);

            return (
              <TagGroup size="sm" onRemove={onRemoveTags}>
                <TagGroup.List>
                  {selectedItemsKeys.map((selectedItemKey) => {
                    const tag = tags.find((t) => t.id === selectedItemKey);

                    if (!tag) return null;

                    return (
                      <Tag key={tag.id} id={tag.id}>
                        {tag.name}
                      </Tag>
                    );
                  })}
                </TagGroup.List>
              </TagGroup>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search tags..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No tags found</EmptyState>}>
            {tags.map((tag) => (
              <ListBox.Item key={tag.id} id={tag.id} textValue={tag.name}>
                {tag.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

#### Email Recipients

```tsx
"use client";

import type {Key} from "@heroui/react";

import {
  Autocomplete,
  Description,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Tag,
  TagGroup,
  useFilter,
} from "@heroui/react";
import {useState} from "react";

export function EmailRecipients() {
  const emails = [
    {email: "alice@example.com", id: "alice@example.com", name: "Alice Johnson"},
    {email: "bob@example.com", id: "bob@example.com", name: "Bob Smith"},
    {email: "charlie@example.com", id: "charlie@example.com", name: "Charlie Brown"},
    {email: "diana@example.com", id: "diana@example.com", name: "Diana Prince"},
    {email: "eve@example.com", id: "eve@example.com", name: "Eve Wilson"},
  ];

  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const {contains} = useFilter({sensitivity: "base"});

  const onRemoveTags = (keys: Set<Key>) => {
    setSelectedKeys((prev) => prev.filter((key) => !keys.has(key)));
  };

  return (
    <Autocomplete
      className="w-[256px]"
      placeholder="Add recipients"
      selectionMode="multiple"
      value={selectedKeys}
      onChange={(keys) => setSelectedKeys(keys as Key[])}
    >
      <Label>To</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value>
          {({defaultChildren, isPlaceholder, state}) => {
            if (isPlaceholder || state.selectedItems.length === 0) {
              return defaultChildren;
            }

            const selectedItemsKeys = state.selectedItems.map((item) => item.key);

            return (
              <TagGroup size="sm" onRemove={onRemoveTags}>
                <TagGroup.List>
                  {selectedItemsKeys.map((selectedItemKey) => {
                    const email = emails.find((e) => e.id === selectedItemKey);

                    if (!email) return null;

                    return (
                      <Tag key={email.id} id={email.id}>
                        {email.email}
                      </Tag>
                    );
                  })}
                </TagGroup.List>
              </TagGroup>
            );
          }}
        </Autocomplete.Value>
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField autoFocus name="search" variant="secondary">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search emails..." />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <ListBox renderEmptyState={() => <EmptyState>No recipients found</EmptyState>}>
            {emails.map((email) => (
              <ListBox.Item key={email.id} id={email.id} textValue={email.email}>
                <div className="flex flex-col">
                  <Label>{email.name}</Label>
                  <Description>{email.email}</Description>
                </div>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
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
import {Autocomplete, SearchField, ListBox} from "@heroui/react";

function CustomAutocomplete() {
  return (
    <Autocomplete className="w-full">
      <Label>State</Label>
      <Autocomplete.Trigger className="rounded-lg border bg-surface p-2">
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter>
          <SearchField>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Search..." />
            </SearchField.Group>
          </SearchField>
          <ListBox>
            <ListBox.Item id="1" textValue="Item 1" className="hover:bg-surface-secondary">
              Item 1
            </ListBox.Item>
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}

```

### Customizing the component classes

To customize the Autocomplete component classes, you can use the `@layer components` directive.

<br />

[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .autocomplete {
    @apply flex flex-col gap-1;
  }

  .autocomplete__trigger {
    @apply rounded-lg border border-border bg-surface p-2;
  }

  .autocomplete__value {
    @apply text-current;
  }

  .autocomplete__clear-button {
    @apply text-muted hover:text-foreground;
  }

  .autocomplete__indicator {
    @apply text-muted;
  }

  .autocomplete__popover {
    @apply rounded-lg border border-border bg-surface p-2;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Autocomplete component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/autocomplete.css)):

#### Base Classes

* `.autocomplete` - Base autocomplete container
* `.autocomplete__trigger` - The button that triggers the autocomplete
* `.autocomplete__value` - The displayed value or placeholder
* `.autocomplete__clear-button` - The clear button that removes the selected value
* `.autocomplete__indicator` - The dropdown indicator icon
* `.autocomplete__popover` - The popover container
* `.autocomplete__filter` - The filter wrapper

#### Variant Classes

* `.autocomplete--primary` - Primary variant with shadow (default)
* `.autocomplete--secondary` - Secondary variant without shadow, suitable for use in surfaces

#### State Classes

* `.autocomplete[data-invalid="true"]` - Invalid state
* `.autocomplete__trigger[data-focus-visible="true"]` - Focused trigger state
* `.autocomplete__trigger[data-disabled="true"]` - Disabled trigger state
* `.autocomplete__value[data-placeholder="true"]` - Placeholder state
* `.autocomplete__clear-button[data-empty="true"]` - Clear button hidden when no selection
* `.autocomplete__indicator[data-open="true"]` - Open indicator state

### Interactive States

The component supports both CSS pseudo-classes and data attributes for flexibility:

* **Hover**: `:hover` or `[data-hovered="true"]` on trigger
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` on trigger
* **Disabled**: `:disabled` or `[data-disabled="true"]` on autocomplete
* **Open**: `[data-open="true"]` on indicator

## API Reference

### Autocomplete Props

| Prop                    | Type                                    | Default            | Description                                                                                                                                                        |
| ----------------------- | --------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `placeholder`           | `string`                                | `'Select an item'` | Temporary text that occupies the autocomplete when it is empty                                                                                                     |
| `selectionMode`         | `"single" \| "multiple"`                | `"single"`         | Whether single or multiple selection is enabled                                                                                                                    |
| `allowsEmptyCollection` | `boolean`                               | `false`            | Whether the autocomplete allows an empty collection. When true, the autocomplete can function even with no items.                                                  |
| `isOpen`                | `boolean`                               | -                  | Sets the open state of the popover (controlled)                                                                                                                    |
| `defaultOpen`           | `boolean`                               | -                  | Sets the default open state of the popover (uncontrolled)                                                                                                          |
| `onOpenChange`          | `(isOpen: boolean) => void`             | -                  | Handler called when the open state changes                                                                                                                         |
| `disabledKeys`          | `Iterable<Key>`                         | -                  | Keys of disabled items                                                                                                                                             |
| `isDisabled`            | `boolean`                               | -                  | Whether the autocomplete is disabled                                                                                                                               |
| `value`                 | `Key \| Key[] \| null`                  | -                  | Current value (controlled)                                                                                                                                         |
| `defaultValue`          | `Key \| Key[] \| null`                  | -                  | Default value (uncontrolled)                                                                                                                                       |
| `onChange`              | `(value: Key \| Key[] \| null) => void` | -                  | Handler called when the value changes                                                                                                                              |
| `isRequired`            | `boolean`                               | -                  | Whether user input is required                                                                                                                                     |
| `isInvalid`             | `boolean`                               | -                  | Whether the autocomplete value is invalid                                                                                                                          |
| `name`                  | `string`                                | -                  | The name of the input, used when submitting an HTML form                                                                                                           |
| `fullWidth`             | `boolean`                               | `false`            | Whether the autocomplete should take full width of its container                                                                                                   |
| `variant`               | `"primary" \| "secondary"`              | `"primary"`        | Visual variant of the component. `primary` is the default style with shadow. `secondary` is a lower emphasis variant without shadow, suitable for use in surfaces. |
| `className`             | `string`                                | -                  | Additional CSS classes                                                                                                                                             |
| `children`              | `ReactNode \| RenderFunction`           | -                  | Autocomplete content or render function                                                                                                                            |

### Autocomplete.Trigger Props

| Prop        | Type                          | Default | Description                        |
| ----------- | ----------------------------- | ------- | ---------------------------------- |
| `className` | `string`                      | -       | Additional CSS classes             |
| `children`  | `ReactNode \| RenderFunction` | -       | Trigger content or render function |

### Autocomplete.Value Props

| Prop        | Type                          | Default | Description                      |
| ----------- | ----------------------------- | ------- | -------------------------------- |
| `className` | `string`                      | -       | Additional CSS classes           |
| `children`  | `ReactNode \| RenderFunction` | -       | Value content or render function |

### Autocomplete.Indicator Props

| Prop        | Type        | Default | Description              |
| ----------- | ----------- | ------- | ------------------------ |
| `className` | `string`    | -       | Additional CSS classes   |
| `children`  | `ReactNode` | -       | Custom indicator content |

### Autocomplete.ClearButton Props

| Prop        | Type                           | Default | Description                           |
| ----------- | ------------------------------ | ------- | ------------------------------------- |
| `className` | `string`                       | -       | Additional CSS classes                |
| `onClick`   | `(e: MouseEvent) => void`      | -       | Handler called when button is clicked |
| `ref`       | `RefObject<HTMLButtonElement>` | -       | Ref to the clear button element       |

### Autocomplete.Popover Props

| Prop        | Type                                                                                                                                                                                                                                                                                                                     | Default    | Description                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------ |
| `placement` | `"bottom" \| "bottom left" \| "bottom right" \| "bottom start" \| "bottom end" \| "top" \| "top left" \| "top right" \| "top start" \| "top end" \| "left" \| "left top" \| "left bottom" \| "start" \| "start top" \| "start bottom" \| "right" \| "right top" \| "right bottom" \| "end" \| "end top" \| "end bottom"` | `"bottom"` | Placement of the popover relative to the trigger |
| `className` | `string`                                                                                                                                                                                                                                                                                                                 | -          | Additional CSS classes                           |
| `children`  | `ReactNode`                                                                                                                                                                                                                                                                                                              | -          | Content children                                 |

### Autocomplete.Filter Props

| Prop            | Type                                       | Default | Description                              |
| --------------- | ------------------------------------------ | ------- | ---------------------------------------- |
| `filter`        | `(text: string, input: string) => boolean` | -       | Custom filter function                   |
| `inputValue`    | `string`                                   | -       | Controlled input value                   |
| `onInputChange` | `(value: string) => void`                  | -       | Handler called when input value changes  |
| `children`      | `ReactNode`                                | -       | Filter content (SearchField and ListBox) |

### useFilter Hook

The `useFilter` hook from React Aria provides filtering functions for autocomplete functionality.

```tsx
import {useFilter} from "@heroui/react";

const {contains} = useFilter({sensitivity: "base"});

<Autocomplete.Filter filter={contains}>
  <SearchField>...</SearchField>
  <ListBox>...</ListBox>
</Autocomplete.Filter>

```

**Options:**

| Option        | Type                                        | Default  | Description                     |
| ------------- | ------------------------------------------- | -------- | ------------------------------- |
| `sensitivity` | `"base" \| "accent" \| "case" \| "variant"` | `"base"` | Locale sensitivity for matching |

**Returns:**

| Function     | Type                                             | Description                                            |
| ------------ | ------------------------------------------------ | ------------------------------------------------------ |
| `contains`   | `(string: string, substring: string) => boolean` | Returns whether a string contains a given substring    |
| `startsWith` | `(string: string, substring: string) => boolean` | Returns whether a string starts with a given substring |
| `endsWith`   | `(string: string, substring: string) => boolean` | Returns whether a string ends with a given substring   |

### RenderProps

When using render functions with Autocomplete.Value, these values are provided:

| Prop              | Type          | Description                        |
| ----------------- | ------------- | ---------------------------------- |
| `defaultChildren` | `ReactNode`   | The default rendered value         |
| `isPlaceholder`   | `boolean`     | Whether the value is a placeholder |
| `state`           | `SelectState` | The state of the autocomplete      |
| `selectedItems`   | `Node[]`      | The currently selected items       |

## Accessibility

The Autocomplete component implements the ARIA select pattern with filtering and provides:

* Full keyboard navigation support
* Screen reader announcements for selection changes
* Proper focus management
* Support for disabled states
* Search functionality with filtering
* HTML form integration

For more information, see the [React Aria Select documentation](https://react-spectrum.adobe.com/react-aria/Select.html).
