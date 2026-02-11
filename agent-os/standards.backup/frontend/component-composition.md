# Component Composition Patterns

## Overview

Composition over duplication: when components share similar UI/UX, create a base component from which others derive. This avoids code duplication and eases maintenance.

**Why**: Reusing component structure keeps code DRY, makes updates easier, and ensures consistent UX across variants.

## Core Principles

- **Identify Patterns**: If 2+ components have similar structure, create a base component
- **Props Flexibility**: Use `ReactNode` for maximum flexibility
- **Composition over Inheritance**: Prefer composition (children/props) over class inheritance
- **Keep Base Simple**: Base component should be generic and minimal
- **Specific Derivations**: Derived components add specific business logic
- **Avoid Over-engineering**: Only create base when there's real duplication

## When to Use Composition

### ✅ Use Composition For

- **Multiple header variants** (Public, Private, Subdomain)
- **Different card types** (Product, User, Post)
- **Modal variations** with different content but same structure
- **Form variants** with different fields but same layout
- **List variations** (ProductList, UserList, PostList)
- **Table variants** with different columns but same structure
- **Dialogs/Alerts** with different messages but same behavior

### ❌ Don't Use Composition When

- Component is unique with no variants
- Components are very different from each other
- Abstraction complicates more than it simplifies
- Components have completely different logic

## Key Patterns

### Base Component Pattern

```typescript
// components/base/BaseCard.tsx
import type { ReactNode } from 'react';

interface BaseCardProps {
  title: ReactNode;
  content: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function BaseCard({ title, content, actions, className }: BaseCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
      {actions && <CardFooter>{actions}</CardFooter>}
    </Card>
  );
}
```

### Derived Component Pattern

```typescript
// features/products/components/ProductCard.tsx
import { BaseCard } from '@/components/base/BaseCard';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <BaseCard
      title={<h3>{product.name}</h3>}
      content={
        <div>
          <p>{product.description}</p>
          <p className="font-bold">${product.price}</p>
        </div>
      }
      actions={
        <Button onClick={() => onAddToCart(product.id)}>
          Add to Cart
        </Button>
      }
    />
  );
}
```

### Multiple Derived Components

```typescript
// features/users/components/UserCard.tsx
export function UserCard({ user }: UserCardProps) {
  return (
    <BaseCard
      title={user.name}
      content={
        <div>
          <p>{user.email}</p>
          <p>Joined: {user.createdAt}</p>
        </div>
      }
      actions={
        <Button variant="outline">View Profile</Button>
      }
    />
  );
}

// features/posts/components/PostCard.tsx
export function PostCard({ post }: PostCardProps) {
  return (
    <BaseCard
      title={post.title}
      content={<p>{post.excerpt}</p>}
      actions={
        <>
          <Button variant="ghost">Read More</Button>
          <Button variant="destructive">Delete</Button>
        </>
      }
    />
  );
}
```

### Flexible Content with Children

```typescript
// components/base/BaseModal.tsx
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BaseModal({ isOpen, onClose, title, children }: BaseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// Usage in specific component
export function DeleteConfirmModal({ isOpen, onClose, onConfirm }: Props) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Confirm Delete">
      <p>Are you sure you want to delete this item?</p>
      <Button onClick={onConfirm} variant="destructive">Delete</Button>
      <Button onClick={onClose} variant="outline">Cancel</Button>
    </BaseModal>
  );
}
```

## Common Pitfalls

- **Over-abstracting**: Don't create base components for one-time use
- **Too Rigid**: Base should be flexible enough for all variants
- **Missing Props**: Ensure base accepts all common customization needs
- **Complex Logic in Base**: Keep business logic in derived components

## Best Practices

- Keep base components in `components/base/` directory
- Use TypeScript for clear prop interfaces
- Document what variations the base supports
- Test base component with multiple derived examples
- Use `ReactNode` for flexible content slots
