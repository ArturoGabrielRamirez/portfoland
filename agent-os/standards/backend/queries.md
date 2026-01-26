# Prisma Data Layer Queries

## Overview

Data functions are pure database operations with no business logic. They execute queries using Prisma and return results.

**Why**: Separation of data access from business logic makes code testable, reusable, and maintainable.

## Core Principles

- **Pure Functions**: Only database queries - no business logic, validation, or transformation
- **Naming**: Files end with `.data.ts`, functions end with "Data" (e.g., `getUserData`)
- **Single Prisma Instance**: Always import `prisma` from `@/features/core`
- **Avoid N+1 Queries**: Use `include` to fetch relations in one query
- **Select Fields**: Use `select` to retrieve only needed fields
- **Use Transactions**: Wrap atomic operations in `prisma.$transaction()`
- **Supabase Limits**: Only for storage/auth - use Prisma for all DB queries

## File Organization

```
features/users/data/
├── getUsers.data.ts
├── getUserById.data.ts
├── findUserByEmail.data.ts
├── createUser.data.ts
├── updateUser.data.ts
└── deleteUser.data.ts
```

## Key Patterns

### Always Import Prisma from Core

```typescript
// ✅ Correct
import { prisma } from '@/features/core';

// ❌ Incorrect
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

### Avoid N+1 Queries with Include

```typescript
// ❌ N+1 Problem
const users = await prisma.user.findMany();
const usersWithPosts = await Promise.all(
  users.map(user => prisma.post.findMany({ where: { authorId: user.id } }))
);

// ✅ Correct - Single query
export async function getUsersWithPostsData() {
  return await prisma.user.findMany({
    include: { posts: true }
  });
}
```

### Select Specific Fields

```typescript
export async function getUserPreviewData(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      // Exclude password
    },
  });
}
```

### Use Transactions for Atomicity

```typescript
export async function createPostWithTagsData(postData, tagNames: string[]) {
  return await prisma.$transaction(async (tx) => {
    const post = await tx.post.create({ data: postData });
    await tx.postTag.createMany({
      data: tagNames.map(name => ({ postId: post.id, tagName: name }))
    });
    return post;
  });
}
```

## Common Query Patterns

```typescript
// Find unique
export async function getUserByIdData(id: string) {
  return await prisma.user.findUnique({ where: { id } });
}

// Find first
export async function findUserByEmailData(email: string) {
  return await prisma.user.findFirst({ where: { email } });
}

// Find many with filters
export async function getPublishedPostsData() {
  return await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
}

// Create
export async function createUserData(data: CreateUserInput) {
  return await prisma.user.create({ data });
}

// Update
export async function updateUserData(id: string, data: UpdateUserInput) {
  return await prisma.user.update({ where: { id }, data });
}

// Delete
export async function deleteUserData(id: string) {
  return await prisma.user.delete({ where: { id } });
}
```

## Error Handling

Data functions should NOT handle errors - let them bubble up to service/action layers.

```typescript
// ✅ Correct - No try/catch
export async function getUserByIdData(id: string) {
  return await prisma.user.findUnique({ where: { id } });
}
```

## Common Pitfalls

- **Business Logic**: Keep data functions pure
- **Multiple Instances**: Import from `@/features/core`
- **N+1 Queries**: Use `include` for relations
- **Over-fetching**: Use `select` for specific fields
- **No Transactions**: Use transactions for atomic operations
- **Error Handling**: Don't catch errors in data layer

## Best Practices

- Use descriptive function names (`getUserByEmailData` not `getData`)
- Type input parameters and return values
- One function = one database operation
- Add JSDoc comments for complex queries
