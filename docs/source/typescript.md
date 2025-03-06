# TypeScript Type System

This document explains the type system used in AiluroCamp and how we leverage TypeScript to create a type-safe application.

## Overview

AiluroCamp uses TypeScript to provide static type checking, improving code quality and developer experience. Our type system is designed to:

- Ensure consistency across the application
- Prevent common runtime errors
- Provide better IDE support with autocompletion
- Document the expected shape of data
- Make refactoring safer and easier

## Types Folder Structure

The `src/app/types` directory contains all shared TypeScript interfaces and type definitions used throughout the application. This centralized approach ensures consistency and makes it easier to maintain and update types as the application evolves.

### Key Type Definitions

#### User Types (`src/app/types/user.ts`)

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  currentRole: UserRole;
}

export type UserRole = 'admin' | 'instructor' | 'student';

export interface UpdateUserRolesRequest {
  userId: string;
  roles: UserRole[];
}

export interface UsersResponse {
  users: User[];
}
```

These types define:

- The structure of a user object
- The possible user roles as a union type
- Request and response formats for user-related API calls

#### Authentication Types

```typescript
interface CustomUser extends NextAuthUser {
  id: string;
  roles: UserRole[];
  currentRole: UserRole;
}

interface CustomSession extends Session {
  user: CustomUser;
}

interface CustomToken extends JWT {
  id: string;
  roles: UserRole[];
  currentRole: UserRole;
}
```

These types extend the NextAuth.js types to include our custom properties like roles and currentRole.

## Using Types in the Application

### In React Components

```typescript
// Example of a typed component
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const handleRoleChange = async (
    userId: string,
    roles: UserRole[]
  ): Promise<void> => {
    // Implementation
  };

  // Rest of component
}
```

### In API Routes

```typescript
// Example of a typed API route
interface SwitchRoleRequest {
  newRole: UserRole;
}

export async function POST(req: Request) {
  const data: SwitchRoleRequest = await req.json();
  // Implementation
}
```

## Type Safety Best Practices

### 1. Use Explicit Return Types

Always specify return types for functions, especially for async functions:

```typescript
async function fetchUsers(): Promise<User[]> {
  // Implementation
}
```

### 2. Use Type Guards

Use type guards to narrow types when necessary:

```typescript
function isAdmin(user: User): boolean {
  return user.roles.includes('admin');
}

if (isAdmin(currentUser)) {
  // TypeScript knows currentUser has admin role
}
```

### 3. Avoid `any`

Avoid using the `any` type as it defeats the purpose of TypeScript. Use `unknown` instead when the type is truly not known, then narrow it down:

```typescript
// Instead of:
function processData(data: any) {
  /* ... */
}

// Use:
function processData(data: unknown) {
  if (typeof data === 'string') {
    // Now TypeScript knows data is a string
  }
}
```

### 4. Use Discriminated Unions

For complex state management, use discriminated unions:

```typescript
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: string };
```

### 5. Leverage Generics

Use generics for reusable components and functions:

```typescript
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();
}

// Usage
const users = await fetchData<User[]>('/api/users');
```

## MongoDB and Mongoose Types

We use Mongoose with TypeScript to ensure type safety with our database operations:

```typescript
export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  roles: ('admin' | 'instructor' | 'student')[];
  currentRole: 'admin' | 'instructor' | 'student';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
```

This interface extends Mongoose's Document type and defines the shape of our User documents, including methods like `comparePassword`.

## Benefits of Our Type System

1. **Error Prevention**: Catches type-related errors at compile time
2. **Self-Documentation**: Types serve as documentation for data structures
3. **Refactoring Confidence**: Makes large-scale changes safer
4. **IDE Support**: Provides excellent autocompletion and inline documentation
5. **Team Collaboration**: Makes it easier for team members to understand the codebase

## Further Reading

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [NextAuth.js TypeScript Guide](https://next-auth.js.org/getting-started/typescript)
- [Mongoose TypeScript Integration](https://mongoosejs.com/docs/typescript.html)
