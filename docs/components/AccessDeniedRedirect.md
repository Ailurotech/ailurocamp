# AccessDeniedRedirect Component Documentation

## Overview

`AccessDeniedRedirect` is a React component designed to handle unauthorized user access. When a user tries to access a page they are not authorized for, the component automatically redirects them to a specified path.

## Props

| Name         | Type   | Default        | Description                            |
| ------------ | ------ | -------------- | -------------------------------------- |
| redirectPath | string | `'/dashboard'` | Path to redirect unauthorized users to |

## Usage

### Basic Usage

By default, the component redirects users to `/dashboard`:

```tsx
import AccessDeniedRedirect from '@/components/auth/AccessDeniedRedirect';

export default function Page() {
  return <AccessDeniedRedirect />;
}
```

### Custom Redirect Path

You can specify a custom redirect path using the `redirectPath` prop:

```tsx
import AccessDeniedRedirect from '@/components/auth/AccessDeniedRedirect';

export default function Page() {
  return <AccessDeniedRedirect redirectPath="/dashboard" />;
}
```

## How it Works

- Internally uses Next.js's `useRouter` hook.
- Automatically triggers the redirect using `useEffect` upon component mount.
- Navigation is performed using `router.replace`, ensuring the unauthorized page is not added to the browser history, preventing users from returning to it with the back button.

## Important Notes

- This component must be used in a **Client Component** environment.
- Compatible with Next.js applications, ensure `next/navigation` is installed and properly configured.

## Use Cases

- Authorization Checks: Verify permissions before accessing specific pages.
- Login Protection: Automatically redirect unauthenticated or incorrectly authorized users to a login or notification page.
