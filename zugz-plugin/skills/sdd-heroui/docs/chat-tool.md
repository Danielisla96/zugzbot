# Chat ToolNew

Copy MarkdownCollapsible tool-call cards for inputs, outputs, errors, approvals, and grouped tool activity.

Storybook
## Usage

Use `ChatTool` to show tool calls emitted by an agent or assistant.


MobileTabletDesktop

## Streaming

Use streaming state while tool input is still being generated.


MobileTabletDesktop

## Error

Use error state for failed tool calls.


MobileTabletDesktop

## Approval

Use approval state when a tool requires user confirmation.


MobileTabletDesktop

## Grouped

Use `ChatToolGroup` to group consecutive tool calls.


MobileTabletDesktop

## Composable

Tool cards expose slots for custom trigger and content layouts.


MobileTabletDesktop

## Anatomy


```tsx
import {ChatTool, ChatToolGroup} from "@heroui-pro/react";

<ChatTool
  input={{query: "HeroUI Pro"}}
  output={{matches: 3}}
  state="output-available"
  toolName="searchDocs"
  triggerPrefix="Used tool: "
/>

<ChatTool state="output-available" toolName="searchDocs">
  <ChatTool.Trigger>
    <ChatTool.StatusIcon />
    Used tool: <strong>searchDocs</strong>
  </ChatTool.Trigger>
  <ChatTool.Content>
    <ChatTool.Args input={{query: "HeroUI Pro"}} label="Input" />
    <ChatTool.Result label="Result" value={{matches: 3}} />
  </ChatTool.Content>
</ChatTool>
```


## CSS Classes



- `.chat-tool` - Tool card root

- `.chat-tool__trigger` - Collapsible trigger

- `.chat-tool__content` - Disclosure content panel

- `.chat-tool__args` - Tool input content

- `.chat-tool__result` - Tool output content

- `.chat-tool__error` - Tool error content

- `.chat-tool-group` - Grouped tool root


## API Reference


### ChatTool

PropTypeDefaultDescription`toolName``string`-Tool display name`state``'input-streaming' | 'input-available' | 'output-available' | 'output-error' | 'requires-action'`-Tool state`triggerPrefix``ReactNode`-Optional label rendered before `toolName` in preset mode`input``unknown`-Tool input rendered as JSON in preset mode`output``unknown`-Tool output rendered as JSON in preset mode`argsText``string`-Preformatted tool input text, useful while streaming partial JSON`errorText``string`-Error details rendered for `output-error` state`onApprove``() => void`-Called by the preset approval action in `requires-action` state`onReject``() => void`-Called by the preset rejection action in `requires-action` state`defaultExpanded``boolean`-Open by default`isExpanded``boolean`-Controlled expanded state

### ChatTool.Trigger

Renders the collapsible tool trigger.


### ChatTool.Content


Renders the expanded tool body.


### ChatTool.Args, Result, Error, Approval


Semantic slots for tool input, output, error details, and approval controls.


### ChatToolGroup


Groups multiple `ChatTool` items. Extends HeroUI `Disclosure` props.

Chat Source

Citation chips and grouped source lists for AI responses.

Code Block

Syntax-highlighted code blocks with language labels and copy actions for AI markdown.