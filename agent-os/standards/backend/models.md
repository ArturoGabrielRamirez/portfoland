# Prisma Models & TypeScript Types

## Overview

Prisma generates TypeScript types automatically from your schema. This standard defines how to leverage Prisma's type system and create derived types.

**Why**: Prisma provides strong type safety from database to application. By reusing Prisma types, we maintain a single source of truth and avoid type mismatches.

## Core Principles

- **Prisma Types as Foundation**: Always use/extend Prisma types - never recreate them manually
- **Type Inference**: Let Prisma generate types automatically
- **Utility Types**: Use TypeScript utility types (Pick, Omit, Partial) for variants
- **No Manual Duplication**: Never manually type what Prisma provides

## Prisma Schema Best Practices

Every model should follow these patterns:

```prisma
model User {
  // IDs - Always use cuid() or uuid()
  id        String   @id @default(cuid())

  // Timestamps - ALWAYS include both
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Fields
  email     String   @unique
  name      String
  role      Role     @default(USER)

  // Relations
  posts     Post[]

  // Table mapping - plural
  @@map("users")

  // Indexes - for foreign keys and frequent queries
  @@index([email])
}

enum Role {
  USER
  ADMIN
}
```

**Key requirements**:
- `cuid()` or `uuid()` for IDs
- `createdAt` and `updatedAt` timestamps
- Indexes on foreign keys and frequent queries
- `onDelete` cascade behavior
- Enums for predefined values
- `@@map()` for plural table names

## Type Strategy

### 1. Re-export Prisma Types

```typescript
// features/users/types/user.ts
import type { User as PrismaUser, Role } from '@prisma/client';

export type User = PrismaUser;
export { Role };
```

### 2. Extend for Relations

```typescript
import type { User as PrismaUser, Post } from '@prisma/client';

export interface UserWithPosts extends PrismaUser {
  posts: Post[];
}

export type UserWithCount = PrismaUser & {
  _count: { posts: number };
};
```

### 3. Use Utility Types

```typescript
import type { User } from '@prisma/client';

// Pick specific properties
export type UserPreview = Pick<User, 'id' | 'name' | 'email'>;

// Omit sensitive properties
export type SafeUser = Omit<User, 'password'>;

// Make all optional (for updates)
export type PartialUser = Partial<User>;

// Combine utilities
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;
```

### 4. Prisma Query Return Types

```typescript
import type { Prisma } from '@prisma/client';

// Infer type from query structure
export type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>;

export type UserWithCount = Prisma.UserGetPayload<{
  include: { _count: { select: { posts: true } } }
}>;
```

## Type Organization Example

```typescript
// features/users/types/user.ts
import type { User as PrismaUser, Role } from '@prisma/client';
import type { Prisma } from '@prisma/client';

// Base Types
export type User = PrismaUser;
export { Role };

// Extended Types (with relations)
export type UserWithPosts = Prisma.UserGetPayload<{
  include: { posts: true }
}>;

// Derived Types
export type SafeUser = Omit<User, 'password'>;
export type UserPreview = Pick<User, 'id' | 'name' | 'email'>;

// Input Types (for mutations)
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserInput = Partial<CreateUserInput>;

// Component Props
export interface UserCardProps {
  user: SafeUser;
  showActions?: boolean;
}
```

## Common Pitfalls

- **Manual Type Duplication**: Use Prisma types, don't recreate interfaces
- **Missing Timestamps**: Always include `createdAt` and `updatedAt`
- **No Indexes**: Add indexes to foreign keys and frequent queries
- **Wrong ID Types**: Use `cuid()` or `uuid()`
- **Missing Cascade**: Define `onDelete` behavior for relations
- **Not Re-exporting**: Re-export Prisma types from feature types directory

## Best Practices

- **Single Source of Truth**: Prisma schema defines all data types
- **Type Safety**: Never use `any` - let Prisma types flow through
- **Consistent Naming**: Use suffixes (WithPosts, WithCount, Preview, Input)
- **Organize by Usage**: Group types by purpose (base, extended, derived, input, props)
