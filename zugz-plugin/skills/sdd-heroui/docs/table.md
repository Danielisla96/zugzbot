# Table

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/components/table
> Tables display structured data in rows and columns with support for sorting, selection, column resizing, and infinite scrolling.


## Import

```tsx
import { Table } from '@heroui/react';

```

### Usage

```tsx
import {Table} from "@heroui/react";

export function Basic() {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Team members" className="min-w-[600px]">
          <Table.Header>
            <Table.Column isRowHeader>Name</Table.Column>
            <Table.Column>Role</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Email</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Kate Moore</Table.Cell>
              <Table.Cell>CEO</Table.Cell>
              <Table.Cell>Active</Table.Cell>
              <Table.Cell>kate@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>John Smith</Table.Cell>
              <Table.Cell>CTO</Table.Cell>
              <Table.Cell>Active</Table.Cell>
              <Table.Cell>john@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Sara Johnson</Table.Cell>
              <Table.Cell>CMO</Table.Cell>
              <Table.Cell>On Leave</Table.Cell>
              <Table.Cell>sara@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Michael Brown</Table.Cell>
              <Table.Cell>CFO</Table.Cell>
              <Table.Cell>Active</Table.Cell>
              <Table.Cell>michael@acme.com</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

```

### Anatomy

Import the Table component and access all parts using dot notation.

```tsx
import { Table } from '@heroui/react';

export default () => (
  <Table>
    <Table.ScrollContainer>
      <Table.Content aria-label="Example table">
        <Table.Header>
          <Table.Column>Name</Table.Column>
          <Table.Column>Role</Table.Column>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Kate Moore</Table.Cell>
            <Table.Cell>CEO</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Content>
    </Table.ScrollContainer>
    <Table.Footer>{/* Optional footer content */}</Table.Footer>
  </Table>
);

```

### Secondary Variant

```tsx
import {Table} from "@heroui/react";

export function SecondaryVariant() {
  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label="Team members" className="min-w-[600px]">
          <Table.Header>
            <Table.Column isRowHeader>Name</Table.Column>
            <Table.Column>Role</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Email</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Kate Moore</Table.Cell>
              <Table.Cell>CEO</Table.Cell>
              <Table.Cell>Active</Table.Cell>
              <Table.Cell>kate@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>John Smith</Table.Cell>
              <Table.Cell>CTO</Table.Cell>
              <Table.Cell>Active</Table.Cell>
              <Table.Cell>john@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Sara Johnson</Table.Cell>
              <Table.Cell>CMO</Table.Cell>
              <Table.Cell>On Leave</Table.Cell>
              <Table.Cell>sara@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Michael Brown</Table.Cell>
              <Table.Cell>CFO</Table.Cell>
              <Table.Cell>Active</Table.Cell>
              <Table.Cell>michael@acme.com</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

```

### Sorting

Columns can be made sortable using the `allowsSorting` prop on `Table.Column`. Use `sortDescriptor` and `onSortChange` on `Table.Content` to manage sort state.

```tsx
"use client";

import type {SortDescriptor} from "@heroui/react";

import {Table, cn} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useMemo, useState} from "react";

interface User {
  id: number;
  name: string;
  role: string;
  status: string;
  email: string;
}

const users: User[] = [
  {email: "kate@acme.com", id: 1, name: "Kate Moore", role: "CEO", status: "Active"},
  {email: "john@acme.com", id: 2, name: "John Smith", role: "CTO", status: "Active"},
  {email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave"},
  {email: "michael@acme.com", id: 4, name: "Michael Brown", role: "CFO", status: "Active"},
  {
    email: "emily@acme.com",
    id: 5,
    name: "Emily Davis",
    role: "Product Manager",
    status: "Inactive",
  },
];

function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center justify-between">
      {children}
      {!!sortDirection && (
        <Icon
          icon="gravity-ui:chevron-up"
          className={cn(
            "size-3 transform transition-transform duration-100 ease-out",
            sortDirection === "descending" ? "rotate-180" : "",
          )}
        />
      )}
    </span>
  );
}

export function Sorting() {
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const col = sortDescriptor.column as keyof User;
      const first = String(a[col]);
      const second = String(b[col]);
      let cmp = first.localeCompare(second);

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }

      return cmp;
    });
  }, [sortDescriptor]);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Sortable table"
          className="min-w-[600px]"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <Table.Header>
            <Table.Column allowsSorting isRowHeader id="name">
              {({sortDirection}) => (
                <SortableColumnHeader sortDirection={sortDirection}>Name</SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column allowsSorting id="role">
              {({sortDirection}) => (
                <SortableColumnHeader sortDirection={sortDirection}>Role</SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column allowsSorting id="status">
              {({sortDirection}) => (
                <SortableColumnHeader sortDirection={sortDirection}>Status</SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column allowsSorting id="email">
              {({sortDirection}) => (
                <SortableColumnHeader sortDirection={sortDirection}>Email</SortableColumnHeader>
              )}
            </Table.Column>
          </Table.Header>
          <Table.Body>
            {sortedUsers.map((user) => (
              <Table.Row key={user.id} id={user.id}>
                <Table.Cell>{user.name}</Table.Cell>
                <Table.Cell>{user.role}</Table.Cell>
                <Table.Cell>{user.status}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

```

### Selection

Enable row selection with `selectionMode` on `Table.Content`. Use `Checkbox` with `slot="selection"` for select-all and per-row checkboxes.

```tsx
"use client";

import type {Selection} from "@heroui/react";

import {Checkbox, Table} from "@heroui/react";
import {useState} from "react";

const users = [
  {email: "kate@acme.com", id: 1, name: "Kate Moore", role: "CEO", status: "Active"},
  {email: "john@acme.com", id: 2, name: "John Smith", role: "CTO", status: "Active"},
  {email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave"},
  {email: "michael@acme.com", id: 4, name: "Michael Brown", role: "CFO", status: "Active"},
];

export function SelectionDemo() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Table with selection"
            className="min-w-[600px]"
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            onSelectionChange={setSelectedKeys}
          >
            <Table.Header>
              <Table.Column className="pr-0">
                <Checkbox aria-label="Select all" slot="selection">
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox>
              </Table.Column>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Role</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Email</Table.Column>
            </Table.Header>
            <Table.Body>
              {users.map((user) => (
                <Table.Row key={user.id} id={user.id}>
                  <Table.Cell className="pr-0">
                    <Checkbox
                      aria-label={`Select ${user.name}`}
                      slot="selection"
                      variant="secondary"
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox>
                  </Table.Cell>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.role}</Table.Cell>
                  <Table.Cell>{user.status}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <p className="text-sm text-muted">
        Selected:{" "}
        <span className="font-medium">
          {selectedKeys === "all"
            ? "All"
            : selectedKeys.size > 0
              ? Array.from(selectedKeys).join(", ")
              : "None"}
        </span>
      </p>
    </div>
  );
}

```

### Custom Cells

```tsx
"use client";

import type {Selection, SortDescriptor} from "@heroui/react";

import {Avatar, Button, Checkbox, Chip, Table, cn} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useMemo, useState} from "react";

interface User {
  id: number;
  name: string;
  image_url: string;
  role: string;
  status: "Active" | "Inactive" | "On Leave";
  email: string;
}

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
  Active: "success",
  Inactive: "danger",
  "On Leave": "warning",
};

const users: User[] = [
  {
    email: "kate@acme.com",
    id: 4586932,
    image_url: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg",
    name: "Kate Moore",
    role: "Chief Executive Officer",
    status: "Active",
  },
  {
    email: "john@acme.com",
    id: 5273849,
    image_url: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg",
    name: "John Smith",
    role: "Chief Technology Officer",
    status: "Active",
  },
  {
    email: "sara@acme.com",
    id: 7492836,
    image_url: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
    name: "Sara Johnson",
    role: "Chief Marketing Officer",
    status: "On Leave",
  },
  {
    email: "michael@acme.com",
    id: 8293746,
    image_url: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg",
    name: "Michael Brown",
    role: "Chief Financial Officer",
    status: "Active",
  },
  {
    email: "emily@acme.com",
    id: 1234567,
    image_url: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg",
    name: "Emily Davis",
    role: "Product Manager",
    status: "Inactive",
  },
];

function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center justify-between">
      {children}
      {!!sortDirection && (
        <Icon
          icon="gravity-ui:chevron-up"
          className={cn(
            "size-3 transform transition-transform duration-100 ease-out",
            sortDirection === "descending" ? "rotate-180" : "",
          )}
        />
      )}
    </span>
  );
}

export function CustomCells() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const col = sortDescriptor.column as keyof User;
      const first = String(a[col]);
      const second = String(b[col]);
      let cmp = first.localeCompare(second);

      if (sortDescriptor.direction === "descending") {
        cmp *= -1;
      }

      return cmp;
    });
  }, [sortDescriptor]);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Table with custom cells"
          className="min-w-[800px]"
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <Table.Header>
            <Table.Column className="pr-0">
              <Checkbox aria-label="Select all" slot="selection">
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox>
            </Table.Column>
            <Table.Column allowsSorting isRowHeader className="after:hidden" id="id">
              {({sortDirection}) => (
                <SortableColumnHeader sortDirection={sortDirection}>Worker ID</SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column allowsSorting id="name">
              {({sortDirection}) => (
                <SortableColumnHeader sortDirection={sortDirection}>Member</SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column allowsSorting id="role">
              {({sortDirection}) => (
                <SortableColumnHeader sortDirection={sortDirection}>Role</SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column allowsSorting id="status">
              {({sortDirection}) => (
                <SortableColumnHeader sortDirection={sortDirection}>Status</SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column className="text-end">Actions</Table.Column>
          </Table.Header>
          <Table.Body>
            {sortedUsers.map((user) => (
              <Table.Row key={user.id} id={user.id}>
                <Table.Cell className="pr-0">
                  <Checkbox aria-label={`Select ${user.name}`} slot="selection" variant="secondary">
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox>
                </Table.Cell>
                <Table.Cell className="font-medium">
                  <div className="flex items-center gap-2">
                    #{user.id.toString()}{" "}
                    <Button isIconOnly size="sm" variant="ghost">
                      <Icon className="size-4 text-muted" icon="gravity-ui:copy" />
                    </Button>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <Avatar.Image src={user.image_url} />
                      <Avatar.Fallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs">{user.name}</span>
                      <span className="text-xs text-muted">{user.email}</span>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className="min-w-52">{user.role}</Table.Cell>
                <Table.Cell className="min-w-25">
                  <Chip color={statusColorMap[user.status]} size="sm" variant="soft">
                    {user.status}
                  </Chip>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    <Button isIconOnly size="sm" variant="tertiary">
                      <Icon className="size-4" icon="gravity-ui:eye" />
                    </Button>
                    <Button isIconOnly size="sm" variant="tertiary">
                      <Icon className="size-4" icon="gravity-ui:pencil" />
                    </Button>
                    <Button isIconOnly size="sm" variant="danger-soft">
                      <Icon className="size-4" icon="gravity-ui:trash-bin" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

```

### Expandable Rows

Rows can be nested to display hierarchical data. Use the `treeColumn` prop to designate a column, and render a `Button` with `slot="chevron"` in that column’s cells so users can expand and collapse the row. Use the `expandedKeys` prop to control which rows are expanded.

```tsx
"use client";

import type {Selection} from "@heroui/react";

import {Button, Table, cn} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useState} from "react";

export function ExpandableRows() {
  type Row = {
    children: Row[];
    date: string;
    id: string;
    title: string;
    type: string;
  };

  const data: Row[] = [
    {
      children: [
        {
          children: [
            {children: [], date: "7/10/2025", id: "3", title: "Weekly Report", type: "File"},
            {children: [], date: "8/20/2025", id: "4", title: "Budget", type: "File"},
          ],
          date: "8/2/2025",
          id: "2",
          title: "Project",
          type: "Directory",
        },
      ],
      date: "10/20/2025",
      id: "1",
      title: "Documents",
      type: "Directory",
    },
    {
      children: [
        {children: [], date: "1/23/2026", id: "6", title: "Image 1", type: "File"},
        {children: [], date: "2/3/2026", id: "7", title: "Image 2", type: "File"},
      ],
      date: "2/3/2026",
      id: "5",
      title: "Photos",
      type: "Directory",
    },
  ];

  const [expandedKeys, setExpandedKeys] = useState<Selection>(() => new Set(["1"]));

  const renderExpandableRow = (item: Row) => {
    return (
      <Table.Row id={item.id} textValue={item.title}>
        <Table.Cell textValue={item.title}>
          {({hasChildItems, isDisabled, isExpanded, isTreeColumn}) => (
            <span className="flex items-center gap-1">
              {hasChildItems && isTreeColumn ? (
                <Button
                  isIconOnly
                  aria-label="Toggle row"
                  isDisabled={isDisabled}
                  size="sm"
                  slot="chevron"
                  variant="ghost"
                >
                  <Icon
                    aria-hidden
                    icon="gravity-ui:chevron-right"
                    className={cn(
                      "size-4 text-muted transition-transform duration-150",
                      isExpanded ? "rotate-90" : "",
                    )}
                  />
                </Button>
              ) : null}
              <span>{item.title}</span>
            </span>
          )}
        </Table.Cell>
        <Table.Cell>{item.type}</Table.Cell>
        <Table.Cell>{item.date}</Table.Cell>
        <Table.Collection items={item.children}>{renderExpandableRow}</Table.Collection>
      </Table.Row>
    );
  };

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Files"
          className="min-w-[520px]"
          expandedKeys={expandedKeys}
          treeColumn="name"
          onExpandedChange={setExpandedKeys}
        >
          <Table.Header>
            <Table.Column isRowHeader id="name">
              Name
            </Table.Column>
            <Table.Column id="type">Type</Table.Column>
            <Table.Column id="date">Date Modified</Table.Column>
          </Table.Header>
          <Table.Body items={data}>{renderExpandableRow}</Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

```

### Pagination

Use `Table.Footer` to add a pagination component below the table.

```tsx
"use client";

import {Pagination, Table} from "@heroui/react";
import {useMemo, useState} from "react";

const columns = [
  {id: "name", name: "Name"},
  {id: "role", name: "Role"},
  {id: "status", name: "Status"},
  {id: "email", name: "Email"},
];

const users = [
  {email: "kate@acme.com", id: 1, name: "Kate Moore", role: "CEO", status: "Active"},
  {email: "john@acme.com", id: 2, name: "John Smith", role: "CTO", status: "Active"},
  {email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave"},
  {email: "michael@acme.com", id: 4, name: "Michael Brown", role: "CFO", status: "Active"},
  {
    email: "emily@acme.com",
    id: 5,
    name: "Emily Davis",
    role: "Product Manager",
    status: "Inactive",
  },
  {email: "davis@acme.com", id: 6, name: "Davis Wilson", role: "Lead Designer", status: "Active"},
  {
    email: "olivia@acme.com",
    id: 7,
    name: "Olivia Martinez",
    role: "Frontend Engineer",
    status: "Active",
  },
  {
    email: "james@acme.com",
    id: 8,
    name: "James Taylor",
    role: "Backend Engineer",
    status: "Active",
  },
];

const ROWS_PER_PAGE = 4;

export function PaginationDemo() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(users.length / ROWS_PER_PAGE);
  const pages = Array.from({length: totalPages}, (_, i) => i + 1);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;

    return users.slice(start, start + ROWS_PER_PAGE);
  }, [page]);

  const start = (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, users.length);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Table with pagination" className="min-w-[600px]">
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Column isRowHeader={column.id === "name"}>{column.name}</Table.Column>
            )}
          </Table.Header>
          <Table.Body items={paginatedItems}>
            {(user) => (
              <Table.Row>
                <Table.Collection items={columns}>
                  {(column) => <Table.Cell>{user[column.id as keyof typeof user]}</Table.Cell>}
                </Table.Collection>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      <Table.Footer>
        <Pagination size="sm">
          <Pagination.Summary>
            {start} to {end} of {users.length} results
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={page === 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                <Pagination.PreviousIcon />
                Prev
              </Pagination.Previous>
            </Pagination.Item>
            {pages.map((p) => (
              <Pagination.Item key={p}>
                <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                  {p}
                </Pagination.Link>
              </Pagination.Item>
            ))}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={page === totalPages}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </Table.Footer>
    </Table>
  );
}

```

### Column Resizing

Wrap the table in `Table.ResizableContainer` and add `Table.ColumnResizer` inside each resizable column.

```tsx
import {Chip, Table} from "@heroui/react";

export function ColumnResizing() {
  return (
    <Table>
      <Table.ResizableContainer>
        <Table.Content aria-label="Table with resizable columns" className="min-w-[700px]">
          <Table.Header>
            <Table.Column isRowHeader defaultWidth="1fr" id="name" minWidth={160}>
              Name
              <Table.ColumnResizer />
            </Table.Column>
            <Table.Column defaultWidth="1fr" id="role" minWidth={220}>
              Role
              <Table.ColumnResizer />
            </Table.Column>
            <Table.Column defaultWidth="1fr" id="status" minWidth={100}>
              Status
              <Table.ColumnResizer />
            </Table.Column>
            <Table.Column defaultWidth="1fr" id="email" minWidth={200}>
              Email
            </Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Kate Moore</Table.Cell>
              <Table.Cell>CEO</Table.Cell>
              <Table.Cell>
                <Chip color="success" size="sm" variant="soft">
                  Active
                </Chip>
              </Table.Cell>
              <Table.Cell>kate@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>John Smith</Table.Cell>
              <Table.Cell>CTO</Table.Cell>
              <Table.Cell>
                <Chip color="success" size="sm" variant="soft">
                  Active
                </Chip>
              </Table.Cell>
              <Table.Cell>john@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Sara Johnson</Table.Cell>
              <Table.Cell>CMO</Table.Cell>
              <Table.Cell>
                <Chip color="warning" size="sm" variant="soft">
                  On Leave
                </Chip>
              </Table.Cell>
              <Table.Cell>sara@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Michael Brown</Table.Cell>
              <Table.Cell>CFO</Table.Cell>
              <Table.Cell>
                <Chip color="success" size="sm" variant="soft">
                  Active
                </Chip>
              </Table.Cell>
              <Table.Cell>michael@acme.com</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Emily Davis</Table.Cell>
              <Table.Cell>Product Manager</Table.Cell>
              <Table.Cell>
                <Chip color="danger" size="sm" variant="soft">
                  Inactive
                </Chip>
              </Table.Cell>
              <Table.Cell>emily@acme.com</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table.ResizableContainer>
    </Table>
  );
}

```

### Empty State

Use `renderEmptyState` on `Table.Body` to display a custom message when the table has no data.

```tsx
"use client";

import {EmptyState, Table} from "@heroui/react";
import {Icon} from "@iconify/react";

export function EmptyStateDemo() {
  return (
    <Table className="min-h-[200px]">
      <Table.ScrollContainer>
        <Table.Content aria-label="Empty table" className="h-full min-w-[600px]">
          <Table.Header>
            <Table.Column isRowHeader>Name</Table.Column>
            <Table.Column>Role</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Email</Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <Icon className="size-6 text-muted" icon="gravity-ui:tray" />
                <span className="text-sm text-muted">No results found</span>
              </EmptyState>
            )}
          >
            {[]}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

```

### Async Loading

Use `Table.LoadMore` for infinite scrolling. It renders a sentinel row that triggers `onLoadMore` when scrolled into view.

```tsx
"use client";

import {Chip, Spinner, Table} from "@heroui/react";
import {useCallback, useRef, useState} from "react";

interface User {
  id: number;
  name: string;
  role: string;
  status: string;
  email: string;
}

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
  Active: "success",
  Inactive: "danger",
  "On Leave": "warning",
};

const allUsers: User[] = [
  {email: "kate@acme.com", id: 1, name: "Kate Moore", role: "CEO", status: "Active"},
  {email: "john@acme.com", id: 2, name: "John Smith", role: "CTO", status: "Active"},
  {email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave"},
  {email: "michael@acme.com", id: 4, name: "Michael Brown", role: "CFO", status: "Active"},
  {
    email: "emily@acme.com",
    id: 5,
    name: "Emily Davis",
    role: "Product Manager",
    status: "Inactive",
  },
  {email: "davis@acme.com", id: 6, name: "Davis Wilson", role: "Lead Designer", status: "Active"},
  {
    email: "olivia@acme.com",
    id: 7,
    name: "Olivia Martinez",
    role: "Frontend Engineer",
    status: "Active",
  },
  {
    email: "james@acme.com",
    id: 8,
    name: "James Taylor",
    role: "Backend Engineer",
    status: "Active",
  },
  {
    email: "sophia@acme.com",
    id: 9,
    name: "Sophia Anderson",
    role: "QA Engineer",
    status: "On Leave",
  },
  {email: "liam@acme.com", id: 10, name: "Liam Thomas", role: "DevOps Engineer", status: "Active"},
  {
    email: "lucas@acme.com",
    id: 11,
    name: "Lucas Martinez",
    role: "Product Manager",
    status: "Active",
  },
  {
    email: "emma@acme.com",
    id: 12,
    name: "Emma Johnson",
    role: "Frontend Engineer",
    status: "Active",
  },
  {email: "noah@acme.com", id: 13, name: "Noah Davis", role: "Backend Engineer", status: "Active"},
  {email: "ava@acme.com", id: 14, name: "Ava Wilson", role: "Lead Designer", status: "Active"},
  {
    email: "oliver@acme.com",
    id: 15,
    name: "Oliver Martinez",
    role: "Frontend Engineer",
    status: "Active",
  },
  {
    email: "isabella@acme.com",
    id: 16,
    name: "Isabella Johnson",
    role: "Backend Engineer",
    status: "Active",
  },
  {email: "mia@acme.com", id: 17, name: "Mia Davis", role: "Lead Designer", status: "Active"},
  {
    email: "william@acme.com",
    id: 18,
    name: "William Wilson",
    role: "Frontend Engineer",
    status: "Active",
  },
];

const ITEMS_PER_PAGE = 6;

const columns = [
  {id: "name", name: "Name"},
  {id: "role", name: "Role"},
  {id: "status", name: "Status"},
  {id: "email", name: "Email"},
];

export function AsyncLoading() {
  const [items, setItems] = useState<User[]>(() => allUsers.slice(0, ITEMS_PER_PAGE));
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const hasMore = items.length < allUsers.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setTimeout(() => {
      setItems((prev) => allUsers.slice(0, prev.length + ITEMS_PER_PAGE));
      setIsLoading(false);
      requestAnimationFrame(() => {
        isLoadingRef.current = false;
      });
    }, 1500);
  }, [hasMore]);

  return (
    <Table>
      <Table.ScrollContainer className="h-[280px] overflow-y-auto">
        <Table.Content aria-label="Async loading table" className="min-w-[600px]">
          <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
            {columns.map((col) => (
              <Table.Column key={col.id} id={col.id} isRowHeader={col.id === "name"}>
                {col.name}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            <Table.Collection items={items}>
              {(user) => (
                <Table.Row>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.role}</Table.Cell>
                  <Table.Cell>
                    <Chip color={statusColorMap[user.status]} size="sm" variant="soft">
                      {user.status}
                    </Chip>
                  </Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                </Table.Row>
              )}
            </Table.Collection>
            {!!hasMore && (
              <Table.LoadMore isLoading={isLoading} scrollOffset={0} onLoadMore={loadMore}>
                <Table.LoadMoreContent>
                  <Spinner size="md" />
                </Table.LoadMoreContent>
              </Table.LoadMore>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

```

### Virtualization

Table supports virtualization through [Virtualizer](https://react-aria.adobe.com/Virtualizer), enabling efficient rendering of large datasets by displaying only the rows visible within the viewport.

```tsx
"use client";

import {Table, TableLayout, Virtualizer} from "@heroui/react";

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
}

export function Virtualization() {
  const roles = [
    "Software Engineer",
    "Senior Engineer",
    "Staff Engineer",
    "Product Manager",
    "Designer",
    "Data Analyst",
    "QA Engineer",
    "DevOps Engineer",
    "Marketing Manager",
    "Sales Representative",
  ];

  const firstNames = [
    "Emma",
    "Liam",
    "Olivia",
    "Noah",
    "Ava",
    "James",
    "Sophia",
    "Oliver",
    "Isabella",
    "Lucas",
    "Mia",
    "Ethan",
    "Charlotte",
    "Mason",
    "Amelia",
    "Logan",
    "Harper",
    "Alexander",
    "Ella",
    "Benjamin",
  ];

  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Anderson",
    "Taylor",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Clark",
    "Lewis",
    "Robinson",
    "Walker",
  ];

  function generateUsers(count: number): User[] {
    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
      const name = `${firstName} ${lastName}`;

      users.push({
        email: `${firstName?.toLowerCase()}.${lastName?.toLowerCase()}@acme.com`,
        id: i + 1,
        name,
        role: roles[i % roles.length] || "",
      });
    }

    return users;
  }

  const virtualizedUsers = generateUsers(1000);

  return (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{
        headingHeight: 42,
        rowHeight: 42,
      }}
    >
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Virtualized table with 1000 rows"
            className="h-[300px] min-w-[700px] overflow-auto"
          >
            <Table.Header className="h-full w-full">
              <Table.Column isRowHeader id="name" minWidth={160}>
                Name
              </Table.Column>
              <Table.Column id="role" minWidth={220}>
                Role
              </Table.Column>
              <Table.Column id="email" minWidth={240}>
                Email
              </Table.Column>
            </Table.Header>
            <Table.Body items={virtualizedUsers}>
              {(user) => (
                <Table.Row>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{user.role}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Virtualizer>
  );
}

```

### TanStack Table

HeroUI's Table works as a rendering layer on top of headless table libraries.
This example uses [TanStack Table](https://tanstack.com/table) for column
definitions, sorting, and pagination — while HeroUI handles styling and
accessibility.

```tsx
"use client";

import type {SortDescriptor} from "@heroui/react";
import type {SortingState} from "@tanstack/react-table";

import {Chip, Pagination, Table, cn} from "@heroui/react";
import {Icon} from "@iconify/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {useMemo, useState} from "react";

// --- Data -----------------------------------------------------------------
interface User {
  id: number;
  name: string;
  role: string;
  status: "Active" | "Inactive" | "On Leave";
  email: string;
}

const statusColorMap: Record<string, "success" | "danger" | "warning"> = {
  Active: "success",
  Inactive: "danger",
  "On Leave": "warning",
};

const users: User[] = [
  {email: "kate@acme.com", id: 1, name: "Kate Moore", role: "CEO", status: "Active"},
  {email: "john@acme.com", id: 2, name: "John Smith", role: "CTO", status: "Active"},
  {email: "sara@acme.com", id: 3, name: "Sara Johnson", role: "CMO", status: "On Leave"},
  {email: "michael@acme.com", id: 4, name: "Michael Brown", role: "CFO", status: "Active"},
  {
    email: "emily@acme.com",
    id: 5,
    name: "Emily Davis",
    role: "Product Manager",
    status: "Inactive",
  },
  {email: "davis@acme.com", id: 6, name: "Davis Wilson", role: "Lead Designer", status: "Active"},
  {
    email: "olivia@acme.com",
    id: 7,
    name: "Olivia Martinez",
    role: "Frontend Engineer",
    status: "Active",
  },
  {
    email: "james@acme.com",
    id: 8,
    name: "James Taylor",
    role: "Backend Engineer",
    status: "Active",
  },
];

// --- TanStack Column Definitions ------------------------------------------
const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor("name", {header: "Name"}),
  columnHelper.accessor("role", {header: "Role"}),
  columnHelper.accessor("status", {
    cell: (info) => (
      <Chip color={statusColorMap[info.getValue()]} size="sm" variant="soft">
        {info.getValue()}
      </Chip>
    ),
    header: "Status",
  }),
  columnHelper.accessor("email", {header: "Email"}),
];

// --- Sorting Bridge -------------------------------------------------------
// Convert TanStack SortingState → React Aria SortDescriptor
function toSortDescriptor(sorting: SortingState): SortDescriptor | undefined {
  const first = sorting[0];

  if (!first) return undefined;

  return {
    column: first.id,
    direction: first.desc ? "descending" : "ascending",
  };
}

// Convert React Aria SortDescriptor → TanStack SortingState
function toSortingState(descriptor: SortDescriptor): SortingState {
  return [{desc: descriptor.direction === "descending", id: descriptor.column as string}];
}

// --- Sort Header ----------------------------------------------------------
function SortableColumnHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center justify-between">
      {children}
      {!!sortDirection && (
        <Icon
          icon="gravity-ui:chevron-up"
          className={cn(
            "size-3 transform transition-transform duration-100 ease-out",
            sortDirection === "descending" ? "rotate-180" : "",
          )}
        />
      )}
    </span>
  );
}

// --- Component ------------------------------------------------------------
const PAGE_SIZE = 4;

export function TanstackTable() {
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data: users,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {pagination: {pageSize: PAGE_SIZE}},
    onSortingChange: setSorting,
    state: {sorting},
  });

  const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);

  const {pageIndex} = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pages = Array.from({length: pageCount}, (_, i) => i + 1);
  const start = pageIndex * PAGE_SIZE + 1;
  const end = Math.min((pageIndex + 1) * PAGE_SIZE, users.length);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="TanStack Table example"
          className="min-w-[600px]"
          sortDescriptor={sortDescriptor}
          onSortChange={(d) => setSorting(toSortingState(d))}
        >
          <Table.Header>
            {table.getHeaderGroups()[0]!.headers.map((header) => (
              <Table.Column
                key={header.id}
                allowsSorting={header.column.getCanSort()}
                id={header.id}
                isRowHeader={header.id === "name"}
              >
                {({sortDirection}) => (
                  <SortableColumnHeader sortDirection={sortDirection}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </SortableColumnHeader>
                )}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id} id={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      <Table.Footer>
        <Pagination size="sm">
          <Pagination.Summary>
            {start} to {end} of {users.length} results
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={!table.getCanPreviousPage()}
                onPress={() => table.previousPage()}
              >
                <Pagination.PreviousIcon />
                Prev
              </Pagination.Previous>
            </Pagination.Item>
            {pages.map((p) => (
              <Pagination.Item key={p}>
                <Pagination.Link
                  isActive={p === pageIndex + 1}
                  onPress={() => table.setPageIndex(p - 1)}
                >
                  {p}
                </Pagination.Link>
              </Pagination.Item>
            ))}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={!table.getCanNextPage()}
                onPress={() => table.nextPage()}
              >
                Next
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </Table.Footer>
    </Table>
  );
}

```

## Related Components

* **Pagination**: Page navigation with composable page links and controls
* **Checkbox**: Binary choice input control
* **Chip**: Compact elements for tags and filters

## Styling

### Passing Tailwind CSS classes

You can customize individual Table parts:

```tsx
import { Table } from '@heroui/react';

function CustomTable() {
  return (
    <Table className="border border-purple-200">
      <Table.ScrollContainer>
        <Table.Content aria-label="Custom styled table">
          <Table.Header className="bg-purple-50">
            <Table.Column>Name</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row className="hover:bg-purple-50">
              <Table.Cell>Kate Moore</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

```

### Customizing the component classes

To customize the Table component classes, you can use the `@layer components` directive.
<br />[Learn more](https://tailwindcss.com/docs/adding-custom-styles#adding-component-classes).

```css
@layer components {
  .table-root {
    @apply relative grid w-full overflow-clip;
  }

  .table__header {
    @apply bg-gray-100;
  }

  .table__column {
    @apply px-4 py-2.5 text-left text-xs font-medium text-gray-600;
  }

  .table__row {
    @apply bg-white border-b border-gray-200;
  }

  .table__cell {
    @apply px-4 py-3 text-sm;
  }

  .table__footer {
    @apply flex items-center px-4 py-2.5;
  }
}

```

HeroUI follows the [BEM](https://getbem.com/) methodology to ensure component variants and states are reusable and easy to customize.

### CSS Classes

The Table component uses these CSS classes ([View source styles](https://github.com/heroui-inc/heroui/blob/v3/packages/styles/components/table.css)):

#### Base Classes

* `.table-root` - Root container (named `table-root` instead of `table` because `table` is a built-in Tailwind CSS utility class for `display: table`)
* `.table__scroll-container` - Horizontal scroll wrapper with custom scrollbar
* `.table__content` - The `<table>` element
* `.table__header` - Header row (`<thead>`)
* `.table__column` - Column header cell (`<th>`)
* `.table__body` - Body section (`<tbody>`)
* `.table__row` - Row element (`<tr>`)
* `.table__cell` - Data cell (`<td>`)
* `.table__footer` - Footer container (outside table)

#### Advanced Classes

* `.table__column-resizer` - Drag handle for column resizing
* `.table__resizable-container` - Wrapper enabling column resizing
* `.table__load-more` - Sentinel row for infinite scrolling
* `.table__load-more-content` - Styled container for the loading indicator

#### Variant Classes

* `.table-root--primary` - Gray background container with card-style body (default)
* `.table-root--secondary` - No background, standalone rounded headers

### Interactive States

The Table supports both CSS pseudo-classes and data attributes for flexibility:

* **Hover**: `:hover` or `[data-hovered="true"]` (row background change)
* **Selected**: `[data-selected="true"]` (row highlight)
* **Focus**: `:focus-visible` or `[data-focus-visible="true"]` (inset focus ring on rows, columns, and cells)
* **Disabled**: `:disabled` or `[aria-disabled="true"]` (reduced opacity)
* **Sortable**: `[data-allows-sorting="true"]` (interactive cursor on columns)
* **Dragging**: `[data-dragging="true"]` (reduced opacity)
* **Drop Target**: `[data-drop-target="true"]` (accent background)

## API Reference

### Table Props

| Prop        | Type                       | Default     | Description                                                                                       |
| ----------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `variant`   | `"primary" \| "secondary"` | `"primary"` | Visual variant. Primary has a gray background container; secondary is flat with transparent rows. |
| `className` | `string`                   | -           | Additional CSS classes for the root container                                                     |
| `children`  | `React.ReactNode`          | -           | Table content (ScrollContainer, Footer, etc.)                                                     |

### Table.ScrollContainer Props

| Prop        | Type              | Default | Description            |
| ----------- | ----------------- | ------- | ---------------------- |
| `className` | `string`          | -       | Additional CSS classes |
| `children`  | `React.ReactNode` | -       | Table.Content element  |

### Table.Content Props

Inherits from [React Aria Table](https://react-spectrum.adobe.com/react-aria/Table.html).

| Prop                | Type                                   | Default  | Description                    |
| ------------------- | -------------------------------------- | -------- | ------------------------------ |
| `aria-label`        | `string`                               | -        | Accessible label for the table |
| `selectionMode`     | `"none" \| "single" \| "multiple"`     | `"none"` | Selection behavior             |
| `selectedKeys`      | `Selection`                            | -        | Controlled selected keys       |
| `onSelectionChange` | `(keys: Selection) => void`            | -        | Selection change handler       |
| `sortDescriptor`    | `SortDescriptor`                       | -        | Current sort state             |
| `onSortChange`      | `(descriptor: SortDescriptor) => void` | -        | Sort change handler            |
| `className`         | `string`                               | -        | Additional CSS classes         |

### Table.Header Props

Inherits from [React Aria TableHeader](https://react-spectrum.adobe.com/react-aria/Table.html#tableheader).

| Prop       | Type                                                | Default | Description                                 |
| ---------- | --------------------------------------------------- | ------- | ------------------------------------------- |
| `columns`  | `T[]`                                               | -       | Dynamic column data for render prop pattern |
| `children` | `React.ReactNode \| (column: T) => React.ReactNode` | -       | Static columns or render prop               |

### Table.Column Props

Inherits from [React Aria Column](https://react-spectrum.adobe.com/react-aria/Table.html#column).

| Prop            | Type                                                                | Default | Description                                       |
| --------------- | ------------------------------------------------------------------- | ------- | ------------------------------------------------- |
| `id`            | `string`                                                            | -       | Column identifier                                 |
| `allowsSorting` | `boolean`                                                           | `false` | Whether the column is sortable                    |
| `isRowHeader`   | `boolean`                                                           | `false` | Whether this column is a row header               |
| `defaultWidth`  | `string \| number`                                                  | -       | Default width for resizable columns               |
| `minWidth`      | `number`                                                            | -       | Minimum width for resizable columns               |
| `children`      | `React.ReactNode \| (values: ColumnRenderProps) => React.ReactNode` | -       | Column content or render prop with sort direction |

### Table.Body Props

Inherits from [React Aria TableBody](https://react-spectrum.adobe.com/react-aria/Table.html#tablebody).

| Prop               | Type                                              | Default | Description                                |
| ------------------ | ------------------------------------------------- | ------- | ------------------------------------------ |
| `items`            | `T[]`                                             | -       | Dynamic row data for render prop pattern   |
| `renderEmptyState` | `() => React.ReactNode`                           | -       | Content to display when the table is empty |
| `children`         | `React.ReactNode \| (item: T) => React.ReactNode` | -       | Static rows or render prop                 |

### Table.Row Props

Inherits from [React Aria Row](https://react-spectrum.adobe.com/react-aria/Table.html#row).

| Prop        | Type               | Default | Description            |
| ----------- | ------------------ | ------- | ---------------------- |
| `id`        | `string \| number` | -       | Row identifier         |
| `className` | `string`           | -       | Additional CSS classes |
| `children`  | `React.ReactNode`  | -       | Row cells              |

### Table.Cell Props

Inherits from [React Aria Cell](https://react-spectrum.adobe.com/react-aria/Table.html#cell).

| Prop        | Type              | Default | Description            |
| ----------- | ----------------- | ------- | ---------------------- |
| `className` | `string`          | -       | Additional CSS classes |
| `children`  | `React.ReactNode` | -       | Cell content           |

### Table.Footer Props

| Prop        | Type              | Default | Description                       |
| ----------- | ----------------- | ------- | --------------------------------- |
| `className` | `string`          | -       | Additional CSS classes            |
| `children`  | `React.ReactNode` | -       | Footer content (e.g., pagination) |

### Table.ColumnResizer Props

Inherits from [React Aria ColumnResizer](https://react-spectrum.adobe.com/react-aria/Table.html#columnresizer).

| Prop        | Type     | Default | Description            |
| ----------- | -------- | ------- | ---------------------- |
| `className` | `string` | -       | Additional CSS classes |

### Table.ResizableContainer Props

Inherits from [React Aria ResizableTableContainer](https://react-spectrum.adobe.com/react-aria/Table.html#resizabletablecontainer).

| Prop        | Type              | Default | Description            |
| ----------- | ----------------- | ------- | ---------------------- |
| `className` | `string`          | -       | Additional CSS classes |
| `children`  | `React.ReactNode` | -       | Table.Content element  |

### Table.LoadMore Props

Inherits from [React Aria TableLoadMoreItem](https://react-spectrum.adobe.com/react-aria/Table.html).

| Prop         | Type              | Default | Description                                     |
| ------------ | ----------------- | ------- | ----------------------------------------------- |
| `isLoading`  | `boolean`         | `false` | Whether data is currently loading               |
| `onLoadMore` | `() => void`      | -       | Handler called when the sentinel row is visible |
| `children`   | `React.ReactNode` | -       | Loading indicator content                       |

### Table.LoadMoreContent Props

| Prop        | Type              | Default | Description                               |
| ----------- | ----------------- | ------- | ----------------------------------------- |
| `className` | `string`          | -       | Additional CSS classes                    |
| `children`  | `React.ReactNode` | -       | Loading indicator content (e.g., Spinner) |

### Table.Collection Props

Re-exported from React Aria `Collection`. Used to render dynamic cells within rows alongside static cells (e.g., checkboxes).

| Prop       | Type                           | Default | Description               |
| ---------- | ------------------------------ | ------- | ------------------------- |
| `items`    | `T[]`                          | -       | Collection items          |
| `children` | `(item: T) => React.ReactNode` | -       | Render prop for each item |

### TableLayout

| Name                     | Type                  | Default | Description                                                                                                                                                                       |
| ------------------------ | --------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rowHeight`              | `number \| undefined` | 48      | The fixed height of a row in px.                                                                                                                                                  |
| `estimatedRowHeight`     | `number \| undefined` | —       | The estimated height of a row, when row heights are variable.                                                                                                                     |
| `headingHeight`          | `number \| undefined` | 48      | The fixed height of a section header in px.                                                                                                                                       |
| `estimatedHeadingHeight` | `number \| undefined` | —       | The estimated height of a section header, when the height is variable.                                                                                                            |
| `loaderHeight`           | `number \| undefined` | 48      | The fixed height of a loader element in px. This loader is specifically for "load more" elements rendered when loading more rows at the root level or inside nested row/sections. |
| `dropIndicatorThickness` | `number \| undefined` | 2       | The thickness of the drop indicator.                                                                                                                                              |
| `gap`                    | `number \| undefined` | 0       | The gap between items.                                                                                                                                                            |
| `padding`                | `number \| undefined` | 0       | The padding around the list.                                                                                                                                                      |
