# Tailwind CSS & Styling

## Overview

Tailwind utility-first approach: always use Tailwind utility classes. Only write custom CSS in exceptional cases.

**Why**: Utility classes keep styles consistent, reduce CSS bundle size, eliminate naming conflicts, and make components portable.

## Core Principles

- **Tailwind Utility-First**: Always use Tailwind utilities - avoid custom CSS
- **Variants for Conditionals**: Use variants (with CVA) for conditional styling
- **cn() Utility**: Always use `cn()` from `@/features/core/utils` to combine classes conditionally
- **Tailwind Config**: Define design tokens in `@theme` of Tailwind config
- **CSS Variables**: shadcn components use CSS variables for theming - they update automatically with dark mode

## Key Patterns

### Always Use Tailwind Utilities

```typescript
// ✅ Correct - Tailwind utilities
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click
  </button>
</div>

// ❌ Incorrect - Inline styles
<div style={{ display: 'flex', padding: '16px' }}>...</div>

// ❌ Incorrect - Custom CSS
.container { display: flex; padding: 16px; } /* Use Tailwind instead */
```

### Use shadcn/ui Components

```typescript
import { Button } from '@/features/shadcn/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/features/shadcn/ui/card';

export function MyComponent() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" className="w-full">
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Conditional Classes with cn()

```typescript
import { cn } from '@/features/core/utils';

interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'lg';
  disabled?: boolean;
}

export function Button({ variant, size, disabled }: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'rounded font-medium transition',
        // Variant styles
        variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        // Size styles
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'lg' && 'px-6 py-3 text-lg',
        // State styles
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      Click me
    </button>
  );
}
```

### Component Variants with CVA

For complex variant systems, use class-variance-authority (CVA):

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/features/core/utils';

const buttonVariants = cva(
  // Base styles
  'rounded font-medium transition',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children: React.ReactNode;
}

export function Button({ variant, size, className, children }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </button>
  );
}
```

### Tailwind Config - Design Tokens

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      spacing: {
        '128': '32rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config;
```

### Dark Mode with CSS Variables

shadcn components use CSS variables that automatically switch with dark mode:

```typescript
// ✅ Correct - Uses CSS variables (auto dark mode)
<div className="bg-background text-foreground">
  <Card className="border-border">
    <p className="text-muted-foreground">Secondary text</p>
  </Card>
</div>

// ❌ Don't use dark: prefix if using CSS variables
<div className="bg-white dark:bg-black"> {/* Variables handle this automatically */}
```

## When Custom CSS Is Valid

Only use custom CSS for:

1. **Complex animations** not available in Tailwind
2. **Global styles** specific to your project
3. **Third-party integrations** that require specific CSS

```css
/* app/globals.css */

/* Valid: Complex animation */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
}

/* Valid: Global typography reset */
@layer base {
  h1 { @apply text-4xl font-bold; }
  h2 { @apply text-3xl font-semibold; }
}
```

## Responsive Design

```typescript
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
  p-4
  sm:p-6
  lg:p-8
">
  {/* Responsive grid */}
</div>
```

## Common Pitfalls

- **Inline Styles**: Use Tailwind classes, not style prop
- **Custom CSS Files**: Use Tailwind utilities instead
- **Hardcoded Colors**: Use theme colors or CSS variables
- **Missing cn()**: Always use cn() for conditional classes
- **Dark Mode Prefix**: Not needed when using CSS variables

## Best Practices

- Use semantic spacing (p-4, m-6) instead of arbitrary values
- Leverage Tailwind's color palette for consistency
- Use responsive prefixes (sm:, md:, lg:) for breakpoints
- Keep custom CSS to absolute minimum
- Use CVA for complex component variant systems
- Define reusable design tokens in Tailwind config
