# Prompt SuggestionNew

Copy MarkdownSuggested prompts and starter actions for AI chat empty states.

Storybook
## Usage

Use `PromptSuggestion` to show suggested prompts near a composer or empty chat state.


MobileTabletDesktop

## Cards

Use card layout for richer prompt starters.


MobileTabletDesktop

## Anatomy


```tsx
import {PromptSuggestion} from "@heroui-pro/react";

<PromptSuggestion>
  <PromptSuggestion.Header>
    <PromptSuggestion.Title>What can I help with?</PromptSuggestion.Title>
    <PromptSuggestion.Description>Start from a suggested prompt.</PromptSuggestion.Description>
  </PromptSuggestion.Header>
  <PromptSuggestion.Items>
    <PromptSuggestion.Item>
      <PromptSuggestion.ItemTitle>Summarize this document</PromptSuggestion.ItemTitle>
      <PromptSuggestion.ItemDescription>Create a concise summary.</PromptSuggestion.ItemDescription>
    </PromptSuggestion.Item>
  </PromptSuggestion.Items>
</PromptSuggestion>
```


## CSS Classes



- `.prompt-suggestion` - Root suggestion item

- `.prompt-suggestion__header` - Header wrapper

- `.prompt-suggestion__title` - Header title

- `.prompt-suggestion__description` - Header description

- `.prompt-suggestion__items` - Suggestion item grid/list

- `.prompt-suggestion__item` - Individual suggestion item


## API Reference


### PromptSuggestion

Root suggestion group. Supports native `div` props.


### PromptSuggestion.Header, Title, Description


Header slots for title and description.


### PromptSuggestion.Items


Container for suggestion items.


### PromptSuggestion.Item


Individual suggestion item. Extends HeroUI `Button` props.


### PromptSuggestion.ItemTitle, ItemDescription, ItemMeta, ItemTags, ItemFooter


Slots for composing rich suggestion items.

Prompt Input

A composable AI prompt composer with attachments, toolbar actions, send states, queued prompts, and drag-and-drop support.

Text Shimmer

Animated shimmer text for streaming, thinking, and loading labels.