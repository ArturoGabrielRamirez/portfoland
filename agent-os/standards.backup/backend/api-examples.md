
## Examples

```typescript
// features/users/actions/createUser.ts
"use server";

import { actionWrapper } from '@/features/core';
import { createUserSchema } from '../schemas/user.schema';
import { createUserService } from '../services/userService';
import { revalidatePath } from 'next/cache';
import type { User } from '../types/user';

export async function createUser(formData: FormData) {
  return actionWrapper<User>(async () => {
    // 1. Validar con Yup
    const data = await createUserSchema.validate({
      email: formData.get('email'),
      name: formData.get('name'),
      password: formData.get('password'),
    });

    // 2. Llamar a service
    const user = await createUserService(data);

    // 3. Revalidar cache
    revalidatePath('/users');

    // 4. Retornar
    return {
      payload: user,
      message: 'Usuario creado exitosamente',
    };
  });
}
```


```typescript
// features/core/actions/actionWrapper.ts
"use server";

import type { ActionResponse } from '../types/action';

export async function actionWrapper<T>(
  action: () => Promise<{ payload: T; message: string }>
): Promise<ActionResponse<T>> {
  try {
    const { payload, message } = await action();
    return { hasError: false, message, payload };
  } catch (error) {
    // Errores de Yup
    if (error instanceof Error && error.name === 'ValidationError') {
      return { hasError: true, message: error.message, payload: null as T };
    }

    // Errores de Prisma
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
      return { hasError: true, message: 'Error de base de datos', payload: null as T };
    }

    // Errores genéricos
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Error desconocido',
      payload: null as T,
    };
  }
}
```

```typescript
// features/core/types/action.ts
export interface ActionResponse<T> {
  hasError: boolean;
  message: string;
  payload: T;
}
```

```typescript
// Service Layer - Ejemplo
// features/users/services/userService.ts
import { createUserData } from '../data/createUser';
import type { User, CreateUserInput } from '../types/user';

export async function createUserService(input: CreateUserInput): Promise<User> {
  // Lógica de negocio
  if (!input.email.includes('@')) {
    throw new Error('Email inválido');
  }

  // Llamar a data function
  const user = await createUserData(input);

  return user;
}
```

```typescript
// features/users/data/createUser.ts
import { prisma } from '@/features/core';
import type { User, CreateUserInput } from '../types/user';

export async function createUserData(input: CreateUserInput): Promise<User> {
  return await prisma.user.create({ data: input });
}
```

```typescript
import { revalidatePath } from 'next/cache';

// Revalidar ruta específica
revalidatePath('/posts');

// Revalidar ruta dinámica
revalidatePath(`/posts/${postId}`);
```

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
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creando...' : 'Crear'}
      </button>
    </form>
  );
}
```

```typescript
// features/posts/constants/messages.ts
export const POST_MESSAGES = {
  CREATE_SUCCESS: 'Post creado exitosamente',
  UPDATE_SUCCESS: 'Post actualizado exitosamente',
  DELETE_SUCCESS: 'Post eliminado exitosamente',
  NOT_FOUND: 'Post no encontrado',
} as const;
```