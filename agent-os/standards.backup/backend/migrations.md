# Prisma Migrations & Database Management

## Overview

Prisma Migrate manages database schema changes through migration files. Follow proper procedures to prevent data loss and maintain consistency.

**Why**: Migrations are irreversible and modify database structure. Proper workflow prevents data loss and enables team collaboration.

## Core Principles

- **NEVER Auto-Execute**: Always ask for user approval before running migrations
- **Schema First**: Modify `schema.prisma`, then generate migrations
- **Always Regenerate**: Run `prisma generate` after schema changes
- **Single Prisma Instance**: Import `prisma` from `@/features/core`
- **Review Before Apply**: Always review generated SQL

## Critical Safety Rule

**⚠️ NEVER execute migrations without user approval**

Migrations modify database structure and can cause data loss. Always:
1. Show what changes will be made
2. Ask for explicit confirmation
3. Then execute

## Prisma Singleton Pattern

```typescript
// features/core/data/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Why**: Prevents multiple connections in development, reuses connection pool, avoids "too many connections" errors.

## Development Workflow

**Step 1: Modify Schema**

```prisma
model User {
  id        String   @id @default(cuid())
  bio       String?  @db.Text  // Add new field

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("users")
}
```

**Step 2: Create Migration**

```bash
bunx prisma migrate dev --name add_user_bio
```

This creates migration file, applies it, and regenerates types.

**Step 3: Review SQL**

Check `prisma/migrations/[timestamp]_add_user_bio/migration.sql`

## Common Commands

```bash
# Development - Create and apply
bunx prisma migrate dev --name migration_name

# Production - Apply pending
bunx prisma migrate deploy

# Check status
bunx prisma migrate status

# Regenerate types
bunx prisma generate

# Reset database (DESTRUCTIVE - dev only)
bunx prisma migrate reset

# Create without applying
bunx prisma migrate dev --create-only

# Database GUI
bunx prisma studio
```

## Production Deployment

**Never use `migrate dev` in production**. Use:

```bash
bunx prisma migrate deploy
```

This applies pending migrations without creating new ones.

## Migration Best Practices

### Naming

```bash
# ✅ Good
bunx prisma migrate dev --name add_user_bio
bunx prisma migrate dev --name create_posts_table

# ❌ Bad
bunx prisma migrate dev --name migration1
bunx prisma migrate dev --name update
```

### Data Migrations

For data transformations:

```bash
bunx prisma migrate dev --create-only --name migrate_roles
```

Edit SQL to include data migration:

```sql
ALTER TABLE "users" ADD COLUMN "role" "Role" DEFAULT 'USER';
UPDATE "users" SET "role" = 'ADMIN' WHERE "email" = 'admin@example.com';
```

Then apply:
```bash
bunx prisma migrate dev
```

### Team Collaboration

**Pulling changes**:
```bash
git pull
bunx prisma migrate dev
bunx prisma generate
```

**Committing**:
```bash
bunx prisma migrate status
git add prisma/schema.prisma prisma/migrations/
git commit -m "Add user bio field"
```

## Common Pitfalls

- **Executing Without Review**: Review SQL before applying
- **Editing Migrations**: Modify schema.prisma, not migration files
- **Wrong Command in Prod**: Use `migrate deploy`, not `migrate dev`
- **Forgetting Generate**: Always run `prisma generate` after changes
- **Multiple Instances**: Import from `@/features/core`
- **Not Committing**: Commit both schema and migrations

## Troubleshooting

**Migration failed**:
```bash
bunx prisma migrate status
bunx prisma migrate resolve --rolled-back [name]
bunx prisma migrate dev
```

**Types out of sync**:
```bash
bunx prisma generate
# If needed:
rm -rf node_modules/.prisma
bunx prisma generate
```
