# Chat MessageNew

Copy MarkdownComposable user and assistant message layouts for AI chat.

Storybook
## Usage

Use `ChatMessage` to compose assistant and user turns with avatars, bubbles, media, markdown, actions, and attachments.


MobileTabletDesktop

## With Markdown

Render assistant responses with rich markdown content.


MobileTabletDesktop

## Loading

Use the loading demo for pending assistant turns.


MobileTabletDesktop

## Anatomy


```tsx
import {ChatMessage, Markdown} from "@heroui-pro/react";

<ChatMessage.Assistant>
  <ChatMessage.Avatar alt="Assistant" fallback="AI" show />
  <ChatMessage.Body>
    <ChatMessage.Content>
      <Markdown>{response}</Markdown>
    </ChatMessage.Content>
  </ChatMessage.Body>
</ChatMessage.Assistant>

<ChatMessage.User>
  <ChatMessage.Bubble>
    <ChatMessage.Content>Hello</ChatMessage.Content>
  </ChatMessage.Bubble>
</ChatMessage.User>
```


## CSS Classes



- `.chat-message--assistant` - Assistant message row

- `.chat-message--user` - User message wrapper

- `.chat-message__avatar` - Avatar slot

- `.chat-message__body` - Assistant body column

- `.chat-message__bubble` - User bubble

- `.chat-message__content` - Message content

- `.chat-message__actions` - Action row


## API Reference


### ChatMessage.Assistant

Assistant message root. Supports native `div` props.


### ChatMessage.User


User message root. Supports native `div` props.


### ChatMessage.Avatar


Avatar slot for assistant messages. Extends HeroUI `Avatar` props.


### ChatMessage.Body


Assistant content column.


### ChatMessage.Bubble


User message bubble.


### ChatMessage.Content


Message text/content slot.


### ChatMessage.Actions


Container for message actions.

Chat Loader

Loading skeletons and typing placeholders for assistant responses.

Chat Message Actions

Inline action buttons for assistant and user messages.