# Drop Zone

Copy MarkdownA drag-and-drop file upload area with file type filtering, size limits, and file list preview.

Storybook
## Usage

MobileTabletDesktop

## Anatomy

Import the DropZone component and access all parts using dot notation.



```tsx
import {DropZone} from "@heroui-pro/react";

<DropZone>
  <DropZone.Area>
    <DropZone.Icon />
    <DropZone.Label>Drag files here or click to browse</DropZone.Label>
    <DropZone.Description>PDF, DOCX, PNG, or JPG up to 10 MB.</DropZone.Description>
    <DropZone.Trigger>Select files</DropZone.Trigger>
  </DropZone.Area>
  <DropZone.Input />
  <DropZone.FileList>
    <DropZone.FileItem>
      <DropZone.FileFormatIcon />
      <DropZone.FileInfo>
        <DropZone.FileName>Proposal.pdf</DropZone.FileName>
        <DropZone.FileMeta>2.4 MB</DropZone.FileMeta>
      </DropZone.FileInfo>
      <DropZone.FileProgress>
        <DropZone.FileProgressTrack>
          <DropZone.FileProgressFill />
        </DropZone.FileProgressTrack>
      </DropZone.FileProgress>
      <DropZone.FileRetryTrigger />
      <DropZone.FileRemoveTrigger />
    </DropZone.FileItem>
  </DropZone.FileList>
</DropZone>;
```


## With File List

MobileTabletDesktop

## Compact File List

MobileTabletDesktop

## Disabled

MobileTabletDesktop

## Image Only

MobileTabletDesktop

## Max Size Limit

MobileTabletDesktop

## Multiple Files

MobileTabletDesktop

## Custom Icon

MobileTabletDesktop

## Custom Triggers

MobileTabletDesktop

## CSS Classes


### Base Classes



- `.drop-zone` - Root wrapper


### Element Classes



- `.drop-zone__area` - The droppable area (RAC DropZone)

- `.drop-zone__icon` - Upload icon container

- `.drop-zone__label` - Primary label text

- `.drop-zone__description` - Secondary description text

- `.drop-zone__trigger` - Browse button

- `.drop-zone__input` - Hidden file input

- `.drop-zone__file-list` - File list container with animation

- `.drop-zone__file-item` - Individual file entry

- `.drop-zone__file-format-icon` - File type SVG icon with colored badge

- `.drop-zone__file-info` - File name and metadata container

- `.drop-zone__file-name` - File name text

- `.drop-zone__file-meta` - File size/status metadata

- `.drop-zone__file-progress` - Upload progress bar

- `.drop-zone__file-retry-trigger` - Retry button for failed uploads

- `.drop-zone__file-remove-trigger` - Remove/close button


### Interactive States



- Drop target: `[data-drop-target="true"]` on `.drop-zone__area` (accent border and background)

- Focus visible: `[data-focus-visible="true"]` on `.drop-zone__area` (focus ring)

- Disabled: `[data-disabled="true"]` on `.drop-zone__area` (reduced opacity)

- File status: `[data-status="uploading|complete|failed"]` on `.drop-zone__file-item`


## API Reference


### DropZone

The root wrapper component. Provides file picker context.

PropTypeDefaultDescription`children``ReactNode`-Area, FileList, and other sub-components`className``string`-Additional CSS class`render``DOMRenderFunction`-Custom render function to override the default `div` element

Also supports all native `div` HTML attributes.


### DropZone.Area


The droppable area. Wraps RAC DropZone.


Also supports all RAC DropZone props (`onDrop`, `getDropOperation`, `isDisabled`, etc.).


### DropZone.Icon


Upload icon container. Renders a default cloud upload icon when no children are provided.


### DropZone.Label


Primary label text. Wraps RAC Text with `slot="label"`.


### DropZone.Description


Secondary description text.


### DropZone.Input


Hidden file input for the browse trigger.

PropTypeDefaultDescription`accept``string`-Accepted file types (e.g. `"image/*,.pdf"`)`multiple``boolean`-Whether multiple files can be selected`onSelect``(files: FileList) => void`-Called when files are selected via the file picker

### DropZone.Trigger


Browse button that opens the file picker. Wraps RAC Button. Provide visible button text, for example `<DropZone.Trigger>Select files</DropZone.Trigger>`. When no children are provided, it renders `Select files`.


### DropZone.FileList


Animated file list container using Motion `AnimatePresence`.


### DropZone.FileItem


Individual file entry with Motion layout animations.

PropTypeDefaultDescription`status``'uploading' | 'complete' | 'failed'`-Upload status of this file item

### DropZone.FileFormatIcon


File type SVG icon with a colored format badge.

PropTypeDefaultDescription`format``string`-File format label (e.g. `"PDF"`, `"JPG"`)`color``string``'gray'`Badge color

### DropZone.FileInfo


Container for file name and metadata.


### DropZone.FileName


File name text display.


### DropZone.FileMeta


File size/status metadata text.


### DropZone.FileProgress


Upload progress bar. Wraps HeroUI ProgressBar.

PropTypeDefaultDescription`size``string``'sm'`Progress bar size

Also supports all HeroUI ProgressBar props.


### DropZone.FileProgressTrack


Progress bar track. Wraps HeroUI `ProgressBar.Track`.


### DropZone.FileProgressFill


Progress bar fill. Wraps HeroUI `ProgressBar.Fill`.


### DropZone.FileRetryTrigger


Retry button for failed uploads. Wraps RAC Button.


### DropZone.FileRemoveTrigger


Remove/close button. Wraps RAC Button.

Checkbox Button Group

A multi-selection button group with card-style checkboxes, icons, and custom indicators.

Inline Select

A minimal inline dropdown that blends into surrounding text for contextual selections without a full form field.