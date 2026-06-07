# Chain Of ThoughtNew

Copy MarkdownA collapsible reasoning timeline for assistant thinking, progress, and agent traces.

Storybook
## Usage

Use `ChainOfThought` to show assistant reasoning, progress, tool discovery, or agent traces without coupling to an AI SDK.


MobileTabletDesktop

## Streaming

Set `isStreaming` to shimmer the trigger while reasoning is still in progress.


MobileTabletDesktop

## Agent Trace

Complex traces can be composed from multiple collapsible reasoning blocks and nested steps.


MobileTabletDesktop

## Agent Trace Streaming

Use the same trace structure with `isStreaming` when the agent is still working.


MobileTabletDesktop

## Anatomy


```tsx
import {ChainOfThought} from "@heroui-pro/react";

<ChainOfThought defaultExpanded>
  <ChainOfThought.Trigger>Thought for 2s</ChainOfThought.Trigger>
  <ChainOfThought.Content>
    <ChainOfThought.Steps>
      <ChainOfThought.Step label="Explore">Read layout and globals.</ChainOfThought.Step>
    </ChainOfThought.Steps>
  </ChainOfThought.Content>
</ChainOfThought>
```


## CSS Classes



- `.chain-of-thought` - Root disclosure wrapper

- `.chain-of-thought__trigger` - Collapsible trigger

- `.chain-of-thought__content` - Disclosure content panel

- `.chain-of-thought__steps` - Vertical step timeline

- `.chain-of-thought__step` - One step in the timeline

- `.chain-of-thought__step-label` - Optional step label

- `.chain-of-thought__step-content` - Step body content


## API Reference


### ChainOfThought

Extends HeroUI `Disclosure` props.

PropTypeDefaultDescription`children``ReactNode`-Trigger and content`isStreaming``boolean``false`Applies streaming shimmer styling to the trigger`defaultExpanded``boolean`-Open by default for uncontrolled usage`isExpanded``boolean`-Controlled expanded state

### ChainOfThought.Trigger


Extends HeroUI `Button` props. Renders the disclosure trigger.


### ChainOfThought.Content


Extends `Disclosure.Content` props. Wraps the expanded content body.


### ChainOfThought.Steps


Renders the vertical timeline container. Also supports native `div` props.


### ChainOfThought.Step


Renders one timeline step. Also supports native `div` props.

PropTypeDefaultDescription`label``ReactNode`-Optional label rendered above the step content`children``ReactNode`-Step body content
Widget

A dashboard container that wraps charts, tables, KPIs, or any content with a consistent surface treatment — secondary background shell with an elevated white content area.

Chat Attachment

Attachment previews and composer file input helpers for AI chat surfaces.