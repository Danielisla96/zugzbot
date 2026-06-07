# Text ShimmerNew

Copy MarkdownAnimated shimmer text for streaming, thinking, and loading labels.

Storybook
## Usage

Use `TextShimmer` for short labels that indicate active generation or background work.


MobileTabletDesktop

## Color

The shimmer uses `currentColor`, so you can pass text color utilities such as `text-muted` and keep the animation visible.



```tsx
<TextShimmer className="text-muted">Thinking...</TextShimmer>
```


## Anatomy


```tsx
import {TextShimmer} from "@heroui-pro/react";

<TextShimmer>Thinking...</TextShimmer>
```


## CSS Classes



- `.text-shimmer` - Root animated text element


## API Reference


### TextShimmer

PropTypeDefaultDescription`children``ReactNode`-Text content`className``string`-Additional classes, including color and text size utilities
Also supports render props from HeroUI `dom.span`.

Prompt Suggestion

Suggested prompts and starter actions for AI chat empty states.

Emoji Reaction Button

An animated emoji reaction button with count display and toggle state for social interactions.