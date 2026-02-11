# Next.js React Components

## Overview

Next.js 13+ introduces React Server Components (RSC) as the default, fundamentally changing how we build UIs. Server Components render on the server and send HTML to the client, while Client Components add interactivity.

**Why this matters**: Server Components reduce JavaScript bundle size, enable direct data fetching, and keep sensitive code on the server. Understanding when to use each type is critical for building performant Next.js applications.

## Core Principles

- **Server Components First**: Always use Server Components by default - only use Client Components when needed
- **shadcn/ui Components**: Always use shadcn/ui components instead of creating custom UI components
- **Props in /types**: Never define component props interfaces in the component file itself
- **No useEffect for Data**: Server Components fetch data directly with async/await - no useEffect needed
- **useTransition Pattern**: Client components use `useTransition` + Server Action + Toast for mutations

## When to Use Each Type

### Server Components (Default)

Use for components that don't need interactivity:

✅ **Use Server Components for**:
- Fetching data from databases or APIs
- Rendering static content
- Accessing backend resources (filesystem, environment variables)
- Keeping sensitive code on server (API keys, secrets)
- Reducing client JavaScript bundle size

```typescript
// ✅ Server Component - No "use client" directive needed
// features/posts/components/PostList.tsx
import { getPosts } from '../data/getPosts.data';

export async function PostList() {
  // Direct data fetching - no useEffect needed
  const posts = await getPosts();

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Client Components

Only use when you need browser-specific features:

✅ **Use Client Components for**:
- Event listeners (`onClick`, `onChange`, `onSubmit`, etc.)
- React Hooks (`useState`, `useEffect`, `useTransition`, etc.)
- Browser APIs (`localStorage`, `window`, `document`)
- Custom hooks
- Context providers and consumers

```typescript
// ✅ Client Component - Needs "use client" directive
// features/posts/components/DeletePostButton.tsx
"use client";

import { useTransition } from 'react';
import { deletePost } from '../actions/deletePost';

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await deletePost(postId);
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## Key Patterns

### 1. Props Interfaces Always in /types

Never define component props in the component file. Always define them in the feature's types directory.

```typescript
// ❌ Incorrect - Props in component file
// features/posts/components/PostCard.tsx
interface PostCardProps { ... } // NO!

// ✅ Correct - Props in types directory
// features/posts/types/post.ts
export interface PostCardProps {
  post: Post;
  showActions?: boolean;
}

// features/posts/components/PostCard.tsx
import type { PostCardProps } from '../types/post';

export function PostCard({ post, showActions = true }: PostCardProps) {
  // ...
}
```

### 2. Server Components Fetch Data Directly

No `useEffect`, no loading states - just async/await.

```typescript
// ✅ Correct - Direct fetch in Server Component
export async function PostPage({ params }: PostPageProps) {
  const post = await getPostByIdData(params.id);

  if (!post) {
    return <div>Post no encontrado</div>;
  }

  return <PostDetail post={post} />;
}

// ❌ Incorrect - Don't use useEffect
export function PostPage() {
  const [post, setPost] = useState(null);
  useEffect(() => { /* DON'T DO THIS */ }, []);
}
```

### 3. Client Components: useTransition Pattern

The standard pattern for mutations in Client Components:

```typescript
"use client";

import { useTransition } from 'react';
import { useToast } from '@/features/shadcn/ui/use-toast';
import { createPost } from '../actions/createPost';

export function CreatePostForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createPost(formData);

      if (result.hasError) {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: result.message });
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creando...' : 'Crear'}
      </Button>
    </form>
  );
}
```

### 4. Always Use shadcn/ui Components

Don't create custom buttons, inputs, cards, etc. Use shadcn/ui components and extend them if needed.

```typescript
// ✅ Correct - Using shadcn/ui
import { Button } from '@/features/shadcn/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/features/shadcn/ui/card';

export function MyComponent() {
  return (
    <Card>
      <CardHeader><CardTitle>Title</CardTitle></CardHeader>
      <CardContent>
        <Button variant="destructive">Delete</Button>
      </CardContent>
    </Card>
  );
}
```

### 5. Composing Server and Client Components

Server Components can import Client Components, but not vice versa. Use composition to minimize client JavaScript.

```typescript
// Server Component wraps Client Component
export async function PostPage({ params }: PostPageProps) {
  const post = await getPostByIdData(params.id);

  return (
    <article>
      <h1>{post.title}</h1>
      <DeletePostButton postId={post.id} /> {/* Only this needs client JS */}
    </article>
  );
}
```

## Common Pitfalls

- **Using "use client" by Default**: Don't mark components as client unless they need interactivity
- **useEffect for Data Fetching**: Use Server Components with async/await instead
- **Props in Component Files**: Always define props interfaces in /types directory
- **Creating Custom UI**: Use shadcn/ui components instead of building from scratch
- **Forgetting useTransition**: Always wrap async calls in Client Components with useTransition
- **Missing Error Handling**: Always handle both success and error cases in form submissions

For complete code examples, see [components-examples.md](./components-examples.md)
