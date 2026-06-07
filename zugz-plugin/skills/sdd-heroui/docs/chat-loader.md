# Chat LoaderNew

Copy MarkdownLoading skeletons and typing placeholders for assistant responses.

Storybook
## Usage

Use `ChatLoader` while an assistant response or thread is loading.


MobileTabletDesktop

## Anatomy


```tsx
import {ChatLoader} from "@heroui-pro/react";

<ChatLoader.Dots />
<ChatLoader.Pulse />
<ChatLoader.Spinner />
<ChatLoader.Skeleton />
```


## CSS Classes



- `.chat-loader` - Root loading layout

- `.chat-loader__avatar` - Avatar placeholder

- `.chat-loader__content` - Loading line group

- `.chat-loader__line` - Individual loading line


## API Reference


### ChatLoader.Dots

Animated dot loader. Supports native `div` props.


### ChatLoader.Pulse


Pulse loader. Supports native `div` props.


### ChatLoader.Spinner


Spinner loader. Supports native `div` props.


### ChatLoader.Skeleton


Chat-message-shaped loading skeleton. Supports native `div` props.


### ChatLoader.SkeletonAvatar, SkeletonBlock, SkeletonLine


Composable skeleton primitives used by `ChatLoader.Skeleton`.

Chat List View

Thread list rows for chat sidebars and conversation pickers.

Chat Message

Composable user and assistant message layouts for AI chat.