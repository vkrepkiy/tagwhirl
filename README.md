# TagWhirl

![TagWhirl preview](./preview.png)

TagWhirl is a web component which allows to visualize any text list with the whirl animation.

## Installation

```bash
npm i -S @vkrepkiy/tagwhirl
```

## Basic usage example

```typescript
// Import module
import { TagWhirl } from "@vkrepkiy/tagwhirl";

// Register as custom element
customElements.define("tag-whirl", TagWhirl);

// Create element
const whirl = document.createElement("tag-whirl");

// Set items
whirl.items = [
  {
    text: "Tag 1",
    href: "http://link.to/my/first/tag", // optional
  },
  {
    text: "Tag 2",
    href: "http://link.to/my/second/tag", // optional
  },
  // ...etc
];

// Insert into document
document.querySelector("#someContainer").appendChild(whirl);
```
