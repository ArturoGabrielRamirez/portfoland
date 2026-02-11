
## Examples

```typescript
import * as yup from 'yup';
import {
  emailField,
  nameField,
  passwordField,
  phoneField,
} from '@features/user/schemas/userFields';

// Schema para CREAR usuario - todos los campos obligatorios
export const createUserSchema = yup.object({
  email: emailField.required('El email es obligatorio'),
  name: nameField.required('El nombre es obligatorio'),
  password: passwordField.required('La contraseña es obligatoria'),
  phone: phoneField.optional(),
});

// Schema para ACTUALIZAR usuario - todos los campos opcionales
export const updateUserSchema = yup.object({
  email: emailField.optional(),
  name: nameField.optional(),
  phone: phoneField.optional(),
});

// Schema para LOGIN - solo campos necesarios
export const loginSchema = yup.object({
  email: emailField.required('El email es obligatorio'),
  password: yup.string().required('La contraseña es obligatoria'), // Sin validación compleja en login
});

// Tipos inferidos de los schemas
export type CreateUserInput = yup.InferType<typeof createUserSchema>;
export type UpdateUserInput = yup.InferType<typeof updateUserSchema>;
export type LoginInput = yup.InferType<typeof loginSchema>;
```

```typescript
"use server";

import { actionWrapper } from '@/features/core';
import { createUserSchema } from '../schemas/user.schema';
import { createUserService } from '../services/userService';

export async function createUser(formData: FormData) {
  return actionWrapper(async () => {
    // Validar datos del formulario
    const data = await createUserSchema.validate({
      email: formData.get('email'),
      name: formData.get('name'),
      password: formData.get('password'),
      phone: formData.get('phone') || undefined,
    });

    const user = await createUserService(data);

    return {
      payload: user,
      message: 'Usuario creado exitosamente',
    };
  });
}
```

```typescript
export async function updateUser(userId: string, input: unknown) {
  return actionWrapper(async () => {
    const data = await updateUserSchema.validate(input);
    const user = await updateUserService(userId, data);
    return { payload: user, message: 'Usuario actualizado' };
  });
}
```

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUserSchema, type CreateUserInput } from '../schemas/user.schema';

export function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserInput>({
    resolver: yupResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserInput) => {
    // Data ya está validado por Yup
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <button type="submit">Crear</button>
    </form>
  );
}
```