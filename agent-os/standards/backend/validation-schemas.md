# Yup Validation Schemas

## Overview

Yup provides runtime validation and type inference for TypeScript. Create reusable, type-safe schemas that power server actions and client forms.

**Why Yup**: Runtime validation catches errors before database, provides clear error messages, and generates TypeScript types automatically.

## Core Principles

- **Reusable Fields**: Define base validators that compose into multiple schemas
- **DRY**: Never duplicate validation logic
- **Type Inference**: Use `yup.InferType<typeof schema>` for automatic types
- **Type Safety**: Never use `any` - use `unknown` for dynamic values
- **Composition**: Build complex schemas from simple building blocks

## File Organization

```
features/users/schemas/
├── userFields.ts        # Reusable field validators
└── user.schema.ts       # Composed schemas for use cases
```

## Key Patterns

### 1. Define Reusable Field Validators

```typescript
// features/users/schemas/userFields.ts
import * as yup from 'yup';

export const emailField = yup
  .string()
  .email('Email inválido')
  .lowercase()
  .trim();

export const nameField = yup
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(100, 'Máximo 100 caracteres')
  .trim();

export const passwordField = yup
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .matches(/[A-Z]/, 'Debe contener mayúscula')
  .matches(/[0-9]/, 'Debe contener número');
```

### 2. Compose Schemas for Use Cases

```typescript
// features/users/schemas/user.schema.ts
import * as yup from 'yup';
import { emailField, nameField, passwordField } from './userFields';

// CREATE - All required
export const createUserSchema = yup.object({
  email: emailField.required('Email obligatorio'),
  name: nameField.required('Nombre obligatorio'),
  password: passwordField.required('Contraseña obligatoria'),
});

// UPDATE - All optional
export const updateUserSchema = yup.object({
  email: emailField.optional(),
  name: nameField.optional(),
});

// LOGIN - Minimal validation
export const loginSchema = yup.object({
  email: emailField.required('Email obligatorio'),
  password: yup.string().required('Contraseña obligatoria'),
});

// Infer types
export type CreateUserInput = yup.InferType<typeof createUserSchema>;
export type UpdateUserInput = yup.InferType<typeof updateUserSchema>;
export type LoginInput = yup.InferType<typeof loginSchema>;
```

### 3. Advanced Patterns

**Custom validation**:
```typescript
export const usernameField = yup
  .string()
  .test('no-spaces', 'Sin espacios permitidos', (value) => {
    return !value || !value.includes(' ');
  });
```

**Async validation**:
```typescript
export const uniqueEmailField = emailField.test(
  'unique',
  'Email ya registrado',
  async (value) => {
    if (!value) return true;
    const user = await findUserByEmailData(value);
    return !user;
  }
);
```

**Arrays**:
```typescript
export const tagsSchema = yup
  .array()
  .of(yup.string().required())
  .min(1).max(5);
```

**Nested objects**:
```typescript
export const addressSchema = yup.object({
  street: yup.string().required(),
  city: yup.string().required(),
});

export const userWithAddressSchema = yup.object({
  email: emailField.required(),
  address: addressSchema.required(),
});
```

## Usage in Server Actions

```typescript
"use server";

import { actionWrapper } from '@/features/core';
import { createUserSchema } from '../schemas/user.schema';

export async function createUser(formData: FormData) {
  return actionWrapper(async () => {
    // Validate - throws if invalid
    const data = await createUserSchema.validate({
      email: formData.get('email'),
      name: formData.get('name'),
    });

    const user = await createUserService(data);
    return { payload: user, message: 'Usuario creado' };
  });
}
```

## Usage in Client Forms

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createUserSchema, type CreateUserInput } from '../schemas/user.schema';

export function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserInput>({
    resolver: yupResolver(createUserSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Crear</button>
    </form>
  );
}
```

## Common Pitfalls

- **Duplicating Validations**: Extract to reusable fields
- **Using `any`**: Use `unknown` for dynamic values
- **Missing Type Inference**: Always export inferred types
- **Over-validating Login**: Don't run complex validations on login
- **Forgetting `.required()`**: Fields are optional by default
- **Multiple Validations**: Validate once in schema

## Best Practices

- Match field names to database columns
- Use consistent error message patterns
- Test edge cases (empty, null, undefined, whitespace)
- Document complex validation rules

For complete examples, see [validation-schemas-examples.md](./validation-schemas-examples.md)
