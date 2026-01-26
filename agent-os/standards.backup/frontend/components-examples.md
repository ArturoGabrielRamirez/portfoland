

Usar SOLO cuando necesitas:
- ✅ Event listeners (`onClick`, `onChange`, etc.)
- ✅ Hooks de React (`useState`, `useEffect`, `useTransition`, etc.)
- ✅ Browser APIs (localStorage, window, document)
- ✅ Custom hooks
- ✅ Context providers


## Examples 

```typescript
// ✅ Server Component (default) - NO necesita "use client"
// features/posts/components/PostList.tsx
import { getPosts } from '../data/getPosts';

export async function PostList() {
  const posts = await getPosts(); // Fetch directo en el componente

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// ✅ Client Component - Solo cuando necesitas interactividad
// features/posts/components/DeletePostButton.tsx
"use client";

import { useState, useTransition } from 'react';
import { deletePost } from '../actions/deletePost';

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await deletePost(postId);
    });
  };

  return <button onClick={handleClick} disabled={isPending}>Delete</button>;
}
```

```typescript
// ❌ Incorrecto - props en component file
// features/posts/components/PostCard.tsx
interface PostCardProps { ... } // NO!

// ✅ Correcto - props en /types
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

```typescript
// ✅ Fetch directo en Server Component
export async function PostList() {
  const posts = await getPosts(); // Sin useEffect, sin loading states

  return <div>{/* render posts */}</div>;
}

// ✅ Con parámetros dinámicos
interface PostPageProps {
  params: { id: string };
}

export async function PostPage({ params }: PostPageProps) {
  const post = await getPostById(params.id);

  if (!post) {
    return <div>Post no encontrado</div>;
  }

  return <div>{/* render post */}</div>;
}
```



```typescript
"use client";

import { useTransition } from 'react';
import { useToast } from '@/features/shadcn/ui/use-toast';
import { createPost } from '../actions/createPost';
import { Button } from '@/features/shadcn/ui/button';
import { Input } from '@/features/shadcn/ui/input';
import { Textarea } from '@/features/shadcn/ui/textarea';

export function CreatePostForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await createPost(formData);

      if (result.hasError) {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Éxito',
          description: result.message
        });
      }
    });
  };

  return (
    <form action={handleSubmit}>
      <Input name="title" placeholder="Título" required />
      <Textarea name="content" placeholder="Contenido" required />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creando...' : 'Crear Post'}
      </Button>
    </form>
  );
}
```