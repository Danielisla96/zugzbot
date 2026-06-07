# Prompt InputNew

Copy MarkdownA composable AI prompt composer with attachments, toolbar actions, send states, queued prompts, and drag-and-drop support.

Storybook
## Usage

Use `PromptInput` as the message composer for chat and agent interfaces.


MobileTabletDesktop

## Secondary

Use the secondary variant when the composer sits on a default surface.


MobileTabletDesktop

## Inline

Use the inline variant for a compact, cursor-style composer that keeps attachment, input, and send on one row. It expands to the stacked layout when text wraps to a second line or attachments are added.


MobileTabletDesktop

## With Suggestions

Compose `PromptInput` with `PromptSuggestion` to create a landing-style composer with quick-start prompts.


MobileTabletDesktop

## Run State

Prompt input supports `submitted`, `streaming`, `ready`, and `error` states for send/stop behavior.


MobileTabletDesktop

## Queue

Use `PromptInput.Queue` to show queued follow-up prompts in a compact card above the composer shell. Place it as a sibling of `PromptInput.Shell` inside `PromptInput`. Keep queue rows text-only for a clean surface — store attachments in your queue model and restore them to `PromptInput.Attachments` when the user edits a queued prompt.


MobileTabletDesktop

## With Attachments

Pair `PromptInput` with `ChatAttachmentInput.Dropzone` to accept dropped files. While a file is dragged over the shell, the composer shows a dotted accent border.


MobileTabletDesktop

## Anatomy


```tsx
import {PromptInput} from "@heroui-pro/react";

<PromptInput value={value} onSubmit={send} onValueChange={setValue}>
  <PromptInput.Queue>
    <PromptInput.Queue.List values={queuedPrompts} onReorder={setQueuedPrompts}>
      {queuedPrompts.map((prompt) => (
        <PromptInput.Queue.Item key={prompt.id} value={prompt}>
          <PromptInput.Queue.Item.Handle />
          <PromptInput.Queue.Item.Body>
            <PromptInput.Queue.Item.Icon />
            <PromptInput.Queue.Item.Content>Queued prompt text</PromptInput.Queue.Item.Content>
          </PromptInput.Queue.Item.Body>
          <PromptInput.Queue.Item.Actions>
            <PromptInput.Queue.Item.Remove />
            <PromptInput.Queue.Item.More />
          </PromptInput.Queue.Item.Actions>
        </PromptInput.Queue.Item>
      ))}
    </PromptInput.Queue.List>
  </PromptInput.Queue>
  <PromptInput.Shell>
    <PromptInput.Content>
      <PromptInput.TextArea placeholder="What do you want to know?" />
    </PromptInput.Content>
    <PromptInput.Toolbar>
      <PromptInput.ToolbarStart>
        <PromptInput.Action aria-label="Attach file">...</PromptInput.Action>
      </PromptInput.ToolbarStart>
      <PromptInput.ToolbarEnd>
        <PromptInput.Send />
      </PromptInput.ToolbarEnd>
    </PromptInput.Toolbar>
  </PromptInput.Shell>
  <PromptInput.Footer>AI can make mistakes. Check important info.</PromptInput.Footer>
</PromptInput>
```


## CSS Classes



- `.prompt-input` - Root state wrapper

- `.prompt-input__shell` - Composer surface

- `.prompt-input__content` - Textarea and attachment content area

- `.prompt-input__attachments` - Attachment preview row

- `.prompt-input__textarea` - Text area

- `.prompt-input__toolbar` - Absolute toolbar row

- `.prompt-input__toolbar-start` - Leading toolbar actions

- `.prompt-input__toolbar-end` - Trailing toolbar actions

- `.prompt-input__footer` - Disclaimer/footer text

- `.prompt-input__send` - Send/stop button

- `.prompt-input__queue` - Queued prompts container

- `.prompt-input__queue-list` - Scrollable queue list

- `.prompt-input__queue-item` - Single queued prompt row

- `.prompt-input__queue-item-handle` - Drag handle (presentational)

- `.prompt-input__queue-item-icon` - Leading queue item icon

- `.prompt-input__queue-item-body` - Main queue row content stack

- `.prompt-input__queue-item-content` - Clamped prompt text (2 lines)

- `.prompt-input__queue-item-description` - Secondary queue item text

- `.prompt-input__queue-item-actions` - Trailing row actions

- `.prompt-input__queue-item-attachments` - Attachment preview row inside a queue item

- `.prompt-input__queue-item-attachments-overflow` - Hidden attachment count label


## API Reference


### PromptInput

PropTypeDefaultDescription`value``string`internalControlled input value`onValueChange``(value: string) => void`-Called when the text changes`onSubmit``() => void`-Called when submit is requested`onStop``() => void`-Called by the send button in stoppable states`status``'ready' | 'submitted' | 'streaming' | 'error'``'ready'`Composer run state`isDisabled``boolean``false`Disable composer controls`lockInputOnRun``boolean``true`Disable textarea while submitted/streaming`maxHeight``number | string``240`Autosize textarea max height`size``'sm' | 'md' | 'lg'``'md'`Composer size`variant``'primary' | 'secondary' | 'inline'``'primary'`Surface and layout variant

### PromptInput.TextArea

Extends HeroUI `TextArea` props.

PropTypeDefaultDescription`disableAutosize``boolean``false`Disable automatic height adjustment

### PromptInput.Action


Extends HeroUI `Button` props.

PropTypeDefaultDescription`tooltip``ReactNode`-Optional tooltip content

### PromptInput.Send


Extends HeroUI `Button` props. Uses the current prompt status to render send, loading, stop, or error icons.


### PromptInput.Shell, Content, Attachments, Toolbar, ToolbarStart, ToolbarEnd, Footer


Layout slots for composing the prompt input. Each slot supports the corresponding native element props.


### PromptInput.Queue


PropTypeDefaultDescription`actionsVisibility``'always' | 'hover'``'hover'`When queue row actions are visible

### PromptInput.Queue.List

PropTypeDefaultDescription`values``T[]`-Controlled queue values. Pass with `onReorder` to enable Motion reordering.`onReorder``(values: T[]) => void`-Called when items are reordered via drag and drop.`axis``'x' | 'y'``'y'`Reorder axis when drag and drop is enabled.

### PromptInput.Queue.Item

PropTypeDefaultDescription`value``T`-Item value from `values`. Required when reordering is enabled.

### PromptInput.Queue.Item.Body, Handle, Icon, Content, Description, Attachments, Actions

Presentational slots for queue row structure. Wrap `Icon` and `Content` in `Body` so the icon sits beside the clamped text and stays vertically centered. `Content` clamps text to two lines with an ellipsis.


### PromptInput.Queue.Item.AttachmentsOverflow


Optional overflow label when you choose to render attachment previews inside a queue row.

PropTypeDefaultDescription`hiddenCount``number`-Number of attachments hidden beyond the visible previews`noun``string``'files'`Noun used in the overflow label

### PromptInput.Queue.Item.Remove, More, Action


Action buttons for queue rows. `Remove` and `More` include default labels and icons. Extend HeroUI `Button` props.

Markdown

Render AI responses with rich markdown, memoized streaming blocks, and optional Streamdown rendering.

Prompt Suggestion

Suggested prompts and starter actions for AI chat empty states.