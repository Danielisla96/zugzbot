# Chat ConversationNew

Copy MarkdownA stick-to-bottom conversation viewport for streaming chat messages.

Storybook
## Usage

Use `ChatConversation` as the scrollable message viewport for assistant and user messages.


MobileTabletDesktop

## Full Chat

Combine `ChatConversation`, `ChatMessage`, `ChainOfThought`, and `PromptInput` for a complete chat surface.


MobileTabletDesktop

## Scroll Button

Add `ChatConversation.ScrollButton` only when your product needs an explicit jump-to-bottom control.


MobileTabletDesktop

## Anatomy


```tsx
import {ChatConversation} from "@heroui-pro/react";

<ChatConversation>
  <ChatConversation.Content>{messages}</ChatConversation.Content>
  <ChatConversation.ScrollAnchor />
</ChatConversation>
```


## CSS Classes



- `.chat-conversation` - Scrollable root viewport

- `.chat-conversation__content` - Message column

- `.chat-conversation__scroll-button` - Jump-to-bottom button

- `.chat-conversation__scroll-button-container` - Jump-to-bottom button positioner

- `.chat-conversation__scroll-anchor` - Bottom scroll anchor


## API Reference


### ChatConversation

Root scroll viewport. Supports native `div` props.


### ChatConversation.Content


Centers and stacks conversation content. Supports native `div` props.


### ChatConversation.ScrollButton


Optional button that appears when the viewport is away from the bottom. Extends HeroUI `Button` props.


### ChatConversation.ScrollAnchor


Bottom anchor used by the stick-to-bottom behavior. Supports native `div` props.

Chat Attachment

Attachment previews and composer file input helpers for AI chat surfaces.

Chat List View

Thread list rows for chat sidebars and conversation pickers.