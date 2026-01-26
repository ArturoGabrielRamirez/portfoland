# Next.js Server Actions Architecture

## Overview

Server Actions in Next.js provide a powerful way to handle server-side mutations directly from client components. This standard defines a three-layer architecture that ensures separation of concerns, maintainability, and type safety.

**Why this matters**: Without clear architectural boundaries, business logic leaks into actions, data access gets scattered across files, and error handling becomes inconsistent. This architecture keeps each layer focused on its single responsibility.

## Core Principles

- **Three-Layer Separation**: Server Action (validation + response) → Service Layer (business logic) → Data Layer (database queries)
- **Consistent Error Handling**: All actions use `actionWrapper` for normalized responses
- **Type Safety**: Validate all inputs with Yup schemas, infer types automatically
- **Cache Revalidation**: Invalidate Next.js cache after mutations
- **Centralized Messages**: Use constants for user-facing messages to enable i18n

## Architecture Layers

```
┌─────────────────────────────────────┐
│     Server Action Layer             │
│  - Validate with Yup                │
│  - Wrap with actionWrapper          │
│  - Revalidate cache                 │
│  - Return ActionResponse<T>         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Service Layer                   │
│  - Business logic                   │
│  - Business rules validation        │
│  - Data transformation              │
│  - Orchestrate multiple data calls  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Data Layer                      │
│  - Pure database queries (Prisma)   │
│  - No business logic                │
│  - Simple CRUD operations           │
└─────────────────────────────────────┘
```

## Key Patterns

### 1. Server Actions Always Use actionWrapper

The `actionWrapper` utility provides consistent error handling across all actions. It catches validation errors, database errors, and generic errors, returning a normalized `ActionResponse<T>`.

**Important**: Always import from `@/features/core` and wrap your action logic.

```typescript
// ✅ Correct - Using actionWrapper
export async function createUser(formData: FormData) {
  return actionWrapper<User>(async () => {
    const data = await createUserSchema.validate({...});
    const user = await createUserService(data);
    revalidatePath('/users');
    return { payload: user, message: 'Usuario creado' };
  });
}

// ❌ Incorrect - No wrapper
export async function createUser(formData: FormData) {
  try {
    // Manual error handling - inconsistent across actions
  } catch (error) {
    // ...
  }
}
```

### 2. Validate Input with Yup Schemas

All server actions must validate input using Yup schemas before processing. This ensures type safety and provides clear error messages.

```typescript
// ✅ Correct - Validate first
const data = await createUserSchema.validate({
  email: formData.get('email'),
  name: formData.get('name'),
});

// ❌ Incorrect - No validation
const email = formData.get('email'); // Could be null, wrong type
```

### 3. Services Contain Business Logic

Services orchestrate business logic and call data layer functions. They should NOT contain database queries directly.

**What belongs in services**:
- Business rules validation (e.g., check email uniqueness)
- Data transformation (e.g., hashing passwords, normalizing input)
- Orchestrating multiple data layer calls
- Domain-specific logic

### 4. Data Layer Functions Are Pure

Data functions only interact with the database. No business logic, no validation, no transformations.

**Naming convention**: Data files end with `.data.ts` and functions end with "Data"

```typescript
// features/users/data/createUser.data.ts
export async function createUserData(input: CreateUserInput): Promise<User> {
  return await prisma.user.create({ data: input });
}
```

### 5. Revalidate Cache After Mutations

Always revalidate the Next.js cache after creating, updating, or deleting data.

```typescript
import { revalidatePath } from 'next/cache';

// Revalidate specific paths
revalidatePath('/posts');
revalidatePath(`/posts/${postId}`);
```

### 6. Centralize Messages in Constants

Define all user-facing messages in constants files to enable future i18n support.

```typescript
// features/posts/constants/messages.ts
export const POST_MESSAGES = {
  CREATE_SUCCESS: 'Post creado exitosamente',
  UPDATE_SUCCESS: 'Post actualizado exitosamente',
  DELETE_SUCCESS: 'Post eliminado exitosamente',
  NOT_FOUND: 'Post no encontrado',
} as const;
```

## Client Component Usage

Use `useTransition` in client components to handle pending states when calling server actions.

**Pattern**: `useTransition` + Server Action + Toast feedback

```typescript
"use client";

const [isPending, startTransition] = useTransition();

const handleSubmit = (formData: FormData) => {
  startTransition(async () => {
    const result = await createPost(formData);
    if (result.hasError) {
      toast({ title: 'Error', description: result.message });
    }
  });
};
```

## Common Pitfalls

- **Mixing Layers**: Don't put business logic in actions or database queries in services
- **Skipping Validation**: Always validate input with Yup schemas
- **Missing Revalidation**: Remember to revalidate paths after mutations
- **Creating New Prisma Instances**: Always import from `@/features/core`
- **Hardcoded Messages**: Use constants for i18n support
- **Not Using actionWrapper**: All actions must use actionWrapper for consistent error handling

## Advanced Features

- **Optimistic Updates**: Use `useOptimistic` alongside `useTransition` for better UX
- **Parallel Mutations**: Call multiple actions in parallel when needed
- **Conditional Revalidation**: Revalidate different paths based on action result

For complete code examples, see [api-examples.md](./api-examples.md)
