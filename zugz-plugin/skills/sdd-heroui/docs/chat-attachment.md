# Chat AttachmentNew

Copy MarkdownAttachment previews and composer file input helpers for AI chat surfaces.

Storybook
## Usage

Use `ChatAttachment` for compact file previews in messages or prompt composers.


MobileTabletDesktop

## Composer

Pair `ChatAttachmentInput` with `PromptInput` to support file picker and drag-and-drop uploads.


MobileTabletDesktop
When generating local image or video previews with `URL.createObjectURL`, revoke each `blob:` URL
when the attachment is removed, when the composer is cleared, and when the component unmounts.


## Grouped


Use `ChatAttachmentGroup` to arrange multiple attachments.


MobileTabletDesktop

## Anatomy


```tsx
import {ChatAttachment, ChatAttachmentGroup, ChatAttachmentInput, PromptInput} from "@heroui-pro/react";

<ChatAttachmentGroup>
  <ChatAttachment mimeType="application/pdf" name="brief.pdf" />
  <ChatAttachment mediaType="image" name="screenshot.png" src="/screenshot.png" />
</ChatAttachmentGroup>

<ChatAttachmentInput onFilesSelected={setFiles}>
  <ChatAttachmentInput.Dropzone
    render={(props) => <PromptInput.Shell {...props}>{/* composer content */}</PromptInput.Shell>}
  />
</ChatAttachmentInput>
```


## CSS Classes



- `.chat-attachment` - Attachment preview tile

- `.chat-attachment__preview` - Preview media wrapper

- `.chat-attachment__preview-image` - Image preview

- `.chat-attachment__preview-video` - Video preview

- `.chat-attachment__preview-fallback` - Fallback document icon

- `.chat-attachment__remove` - Remove button

- `.chat-attachment-group` - Attachment group wrapper


## API Reference


### ChatAttachment

PropTypeDefaultDescription`mediaType``'audio' | 'document' | 'image' | 'unknown' | 'video'`inferredAttachment media type`mimeType``string`-MIME type used to infer media type`name``string`-Attachment file name`src``string`-Preview URL for image or video attachments`children``ReactNode`default previewCustom attachment content

### ChatAttachment.Preview

Renders image, video, or document fallback preview. Accepts `children` to replace the preview content.


### ChatAttachment.Remove


Extends HeroUI `CloseButton` props. Use it to remove an attachment from composer state.


### ChatAttachmentInput


Provides file-picker and drag-and-drop behavior.

PropTypeDefaultDescription`accept``string`-Native file input accept filter`multiple``boolean``true`Allow multiple files`disabled``boolean``false`Disable picker and drop behavior`onFilesSelected``(files: File[]) => void`-Called when files are selected or dropped

### ChatAttachmentInput.Trigger


Opens the hidden file input. Use `render` to wire it to another button.


### ChatAttachmentInput.Dropzone


Adds drag-and-drop file handling. Use `render` to attach drop behavior to `PromptInput.Shell`.

Chain Of Thought

A collapsible reasoning timeline for assistant thinking, progress, and agent traces.

Chat Conversation

A stick-to-bottom conversation viewport for streaming chat messages.