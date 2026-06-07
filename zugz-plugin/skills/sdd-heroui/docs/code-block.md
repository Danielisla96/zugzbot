# Code BlockNew

Copy MarkdownSyntax-highlighted code blocks with language labels and copy actions for AI markdown.

Storybook
## Usage

Use `CodeBlock` for fenced code output, tool snippets, and AI-generated examples.


MobileTabletDesktop

## Anatomy


```tsx
import {CodeBlock} from "@heroui-pro/react";

<CodeBlock>
  <CodeBlock.Header>
    <span>typescript</span>
    <CodeBlock.CopyButton code={code} />
  </CodeBlock.Header>
  <CodeBlock.Code code={code} language="typescript" />
</CodeBlock>
```


## CSS Classes



- `.code-block` - Root code block surface

- `.code-block__header` - Header row

- `.code-block__code` - Code scroll region

- `.code-block__copy-button` - Copy/check icon button


## API Reference


### CodeBlock

Root container. Also supports native `div` props.


### CodeBlock.Header


Header slot for language labels and actions. Also supports native `div` props.


### CodeBlock.Code


PropTypeDefaultDescription`code``string`-Code to render`language``string``'plaintext'`Shiki language id`theme``string``'github-light'`Shiki theme
Also supports native `div` props.


### CodeBlock.CopyButton


PropTypeDefaultDescription`code``string`-Code copied to clipboard`aria-label``string``'Copy code'`Accessible label`className``string`-Additional classChat Tool

Collapsible tool-call cards for inputs, outputs, errors, approvals, and grouped tool activity.

Markdown

Render AI responses with rich markdown, memoized streaming blocks, and optional Streamdown rendering.