# Edit on GitHub Button for Toolbox Components

This document explains how to add the "Edit on GitHub" button to toolbox components.

## Overview

The "Edit on GitHub" button allows users to quickly navigate to the GitHub repository to edit the source code of a tool. It appears to the left of the "Report Issue" button in the tool header.

## Usage

### For Console Tools

1. Import the utility function:
```tsx
import { generateConsoleToolGitHubUrl } from "@/components/toolbox/utils/github-url";
```

2. Add the `githubUrl` prop to your `Container` component:
```tsx
<Container
  title="Your Tool Title"
  description="Tool description"
  githubUrl={generateConsoleToolGitHubUrl("path/to/your/Tool.tsx")}
>
  {/* Your tool content */}
</Container>
```

### Example

```tsx
import { Container } from "@/components/toolbox/components/Container";
import { generateConsoleToolGitHubUrl } from "@/components/toolbox/utils/github-url";

export default function MyTool() {
  return (
    <Container
      title="My Awesome Tool"
      description="This tool does amazing things"
      githubUrl={generateConsoleToolGitHubUrl("utilities/my-tool/MyTool.tsx")}
    >
      {/* Tool implementation */}
    </Container>
  );
}
```

## Utility Functions

### `generateConsoleToolGitHubUrl(toolPath: string)`

Generates a GitHub edit URL for console tools.

- **Parameters**: `toolPath` - The relative path from the `console/` directory
- **Returns**: Full GitHub edit URL
- **Example**: `generateConsoleToolGitHubUrl("utilities/format-converter/FormatConverter.tsx")`

### `generateToolGitHubUrl(componentPath: string)`

Generates a GitHub edit URL for any toolbox component.

- **Parameters**: `componentPath` - The relative path from the `components/toolbox/` directory  
- **Returns**: Full GitHub edit URL
- **Example**: `generateToolGitHubUrl("console/utilities/format-converter/FormatConverter.tsx")`

## Button Behavior

- The button only appears if a `githubUrl` is provided
- Clicking the button opens the GitHub edit page in a new tab
- The button uses the same styling as the "Report Issue" button
- The button is positioned to the left of the "Report Issue" button

## Implementation Details

The Edit on GitHub button is implemented in:
- `components/console/edit-on-github-button.tsx` - The button component
- `components/toolbox/components/Container.tsx` - Integration with the Container component
- `components/toolbox/utils/github-url.ts` - Utility functions for URL generation

