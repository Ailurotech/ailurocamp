## Components

### LoadingSpinner

- **Description**: Displays a rotating spinner that can be customized with different sizes, colors, and an optional label.
- **Key Features**:
  - Customizable via props: `size`, `color`, and `label`.
  - Wrapped in `React.memo` to prevent unnecessary re-renders.

### LoadingController

- **Description**: Centers the LoadingSpinner on the screen, typically used to indicate full-page or major content loading.
- **Key Features**:
  - Uses a flexbox container to center the spinner.
  - Designed to be displayed conditionally while asynchronous data is being fetched.
  - Focuses solely on providing a loading state without additional logic.

---

## Usage Examples

### LoadingSpinner Example

```tsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

function SpinnerExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Spinner Example</h2>
      <LoadingSpinner
        size="large"
        color="border-purple-500"
        label="Loading data..."
      />
    </div>
  );
}

export default SpinnerExample;
```
