# Chat List ViewNew

Copy MarkdownThread list rows for chat sidebars and conversation pickers.

Storybook
## Usage

Use `ChatListView` to render recent conversations or saved threads.


MobileTabletDesktop

## Compact

Use the compact variant for dense sidebars.


MobileTabletDesktop

## Anatomy


```tsx
import {ChatListView} from "@heroui-pro/react";

<ChatListView>
  <ChatListView.Item>
    <ChatListView.Icon />
    <ChatListView.ItemContent>
      <ChatListView.Title>Project planning</ChatListView.Title>
      <ChatListView.Preview>Last assistant reply preview</ChatListView.Preview>
    </ChatListView.ItemContent>
  </ChatListView.Item>
</ChatListView>
```


## CSS Classes



- `.chat-list-view` - Root list

- `.chat-list-view__item` - Thread row

- `.chat-list-view__icon` - Leading icon/avatar

- `.chat-list-view__item-content` - Row text content

- `.chat-list-view__title` - Thread title

- `.chat-list-view__preview` - Thread preview

- `.chat-list-view__meta` - Optional metadata


## API Reference


### ChatListView

Root list container. Supports native `div` props.


### ChatListView.Item


Thread row. Supports native button/link composition depending on usage.


### ChatListView.Icon


Leading icon slot.


### ChatListView.ItemContent


Text content wrapper.


### ChatListView.Title


Thread title slot.


### ChatListView.Preview


Thread description or last-message preview slot.


### ChatListView.Meta


Optional metadata slot, such as date or unread counts.

Chat Conversation

A stick-to-bottom conversation viewport for streaming chat messages.

Chat Loader

Loading skeletons and typing placeholders for assistant responses.