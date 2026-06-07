# MarkdownNew

Copy MarkdownRender AI responses with rich markdown, memoized streaming blocks, and optional Streamdown rendering.

Storybook
## Usage

Use `Markdown` for AI responses that need headings, lists, inline code, and fenced code blocks with HeroUI Pro styling.


MobileTabletDesktop

## Streaming

The built-in Markdown component splits content into memoized blocks so token updates only re-render the blocks that changed.


MobileTabletDesktop

## With Streamdown

Use Streamdown when you want incomplete markdown repair, streaming animation, and a caret while the assistant response is still being generated.


MobileTabletDesktop

```tsx
import {Streamdown} from "streamdown";
import "streamdown/styles.css";

<Streamdown animated caret="block" isAnimating={isStreaming}>
  {response}
</Streamdown>
```


## Anatomy


```tsx
import {Markdown} from "@heroui-pro/react";

<Markdown>{response}</Markdown>
```


## CSS Classes


### Base Classes



- `.markdown` - Root markdown content wrapper

- `.markdown__block` - Memoized block wrapper for each parsed markdown block


### Element Classes



- `.markdown__inline-code` - Inline code styling


## API Reference


### Markdown

The root component. Renders markdown content with HeroUI Pro typography and code block styling.

PropTypeDefaultDescription`children``string`-Markdown content to render`components``Partial<Components>`-Custom `react-markdown` component overrides`id``string`generatedStable id seed used for memoized block keys`className``string`-Additional CSS class

Also supports all native `div` HTML attributes.

Code Block

Syntax-highlighted code blocks with language labels and copy actions for AI markdown.

Prompt Input

A composable AI prompt composer with attachments, toolbar actions, send states, queued prompts, and drag-and-drop support.