# Chat SourceNew

Copy MarkdownCitation chips and grouped source lists for AI responses.

Storybook
## Usage

Use `ChatSource` to cite a URL or uploaded document inline with an assistant answer.


MobileTabletDesktop

## Document

Set `sourceType="document"` for uploaded or local files.


MobileTabletDesktop

## Grouped

Use `ChatSources` to group multiple citations behind a collapsible trigger.


MobileTabletDesktop

## Stacked Favicons

For a compact source button, render stacked favicon avatars in the `ChatSources.Trigger`.


MobileTabletDesktop

## Composable

Use compound parts when you need custom trigger content.


MobileTabletDesktop

## Anatomy


```tsx
import {ChatSource, ChatSources} from "@heroui-pro/react";

<ChatSource
  faviconUrl="https://www.google.com/s2/favicons?domain_url=https://heroui.com&sz=64"
  href="https://heroui.com"
  title="HeroUI"
/>

<ChatSources defaultExpanded={false}>
  <ChatSources.Trigger>3 sources</ChatSources.Trigger>
  <ChatSources.Content>
    <ChatSources.List>
      <ChatSource href="https://heroui.com" title="HeroUI" />
    </ChatSources.List>
  </ChatSources.Content>
</ChatSources>
```


## CSS Classes



- `.chat-source` - Source root

- `.chat-source__trigger` - Trigger wrapper

- `.chat-source__trigger-link` - Link or document pill

- `.chat-source__icon` - Favicon image or custom icon

- `.chat-source__icon-fallback` - Initial fallback for URL sources

- `.chat-source__document-icon` - Document source icon

- `.chat-source__preview` - Hover preview popover

- `.chat-sources` - Grouped source disclosure

- `.chat-sources__trigger` - Group trigger

- `.chat-sources__list` - Expanded source list


## API Reference


### ChatSource

PropTypeDefaultDescription`href``string`-URL source link`title``string`domainDisplay title`description``string`-Enables and populates the hover preview`enablePreview``boolean`autoForce-enable custom preview content or disable the automatic hover preview`faviconUrl``string`-Favicon image shown in trigger and preview`sourceType``'url' | 'document'`inferredSource type`children``ReactNode`default trigger/previewCustom source composition

### ChatSource.Trigger

Renders the source pill trigger. Extends native anchor props for URL sources.


### ChatSource.Icon


Renders a custom icon or favicon.

PropTypeDefaultDescription`faviconUrl``string`-Favicon image URL`children``ReactNode`fallback initialCustom icon element

### ChatSource.Title


Renders the source title.


### ChatSource.Preview


Renders the hover preview content for URL sources with title or description. If you provide a
custom preview without root `title` or `description`, set `enablePreview` on `ChatSource` so the
required hover-card wrapper is mounted.


### ChatSources


Grouped source disclosure. Extends HeroUI `Disclosure` props.


### ChatSources.Trigger


Renders the grouped source trigger.


### ChatSources.Content


Renders the expanded grouped source content.


### ChatSources.List


Renders the flex-wrapped source list.

Chat Message Actions

Inline action buttons for assistant and user messages.

Chat Tool

Collapsible tool-call cards for inputs, outputs, errors, approvals, and grouped tool activity.