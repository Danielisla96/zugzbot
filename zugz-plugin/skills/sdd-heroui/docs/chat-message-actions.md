# Chat Message ActionsNew

Copy MarkdownInline action buttons for assistant and user messages.

Storybook
## Usage

Use `ChatMessageActions` for copy, retry, rating, share, or custom message actions.


MobileTabletDesktop

## Minimal

Use a smaller action set when only one or two actions are needed.


MobileTabletDesktop

## Custom Icons

Actions are composable, so you can bring your own icon set.


MobileTabletDesktop

## Anatomy


```tsx
import {ChatMessageActions} from "@heroui-pro/react";

<ChatMessageActions>
  <ChatMessageActions.Action aria-label="Copy">...</ChatMessageActions.Action>
  <ChatMessageActions.Action aria-label="Like">...</ChatMessageActions.Action>
</ChatMessageActions>
```


## CSS Classes



- `.chat-message-actions` - Root action row

- `.chat-message-actions__action` - Individual icon button


## API Reference


### ChatMessageActions

Root action group. Supports native `div` props.


### ChatMessageActions.Action


Individual action button. Extends HeroUI `Button` props.

Chat Message

Composable user and assistant message layouts for AI chat.

Chat Source

Citation chips and grouped source lists for AI responses.