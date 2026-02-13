# UI Features - Cyberpunk Toast Border Effects

Sistema de efectos visuales cyberpunk para notificaciones toast.

## Características

- 🔲 **Borde pulsante** - El viewport se ilumina con el color del tipo de toast
- 🔶 **Hexágonos en esquinas** - Indicadores hexagonales animados en las 4 esquinas
- 📡 **Scanline flash** - Efecto de líneas escaneadas que atraviesa la pantalla
- 🎨 **Color-coded** - Colores automáticos según tipo de notificación
  - Error: Rojo (`hsl(0,100%,50%)`)
  - Success: Verde (`hsl(150,100%,45%)`)
  - Warning: Amarillo (`hsl(60,100%,50%)`)
  - Info: Cyan (`hsl(174,100%,50%)`)

## Uso Básico

### Opción 1: Hook personalizado (Recomendado)

```tsx
'use client';

import { useCyberpunkToast } from '@/features/ui';

export function MyComponent() {
  const toast = useCyberpunkToast();

  const handleClick = () => {
    // Automáticamente dispara el efecto visual + toast
    toast.success('Skill added successfully!');
    toast.error('Database connection failed');
    toast.warning('This action cannot be undone');
    toast.info('New achievement unlocked');
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

### Opción 2: Manual con sonner + trigger

```tsx
'use client';

import { toast } from 'sonner';
import { triggerToastEffect } from '@/features/ui';

export function MyComponent() {
  const handleClick = () => {
    // Disparar efecto visual manualmente
    triggerToastEffect('success');

    // Mostrar toast
    toast.success('Operation completed');
  };

  return <button onClick={handleClick}>Show Toast</button>;
}
```

## Integración

El componente `ToastBorderEffect` ya está integrado en `app/[locale]/layout.tsx`, por lo que funciona automáticamente en toda la aplicación.

## Arquitectura

```
features/ui/
├── components/
│   └── ToastBorderEffect.tsx    # Componente visual principal
├── hooks/
│   └── useCyberpunkToast.ts     # Hook con efectos integrados
├── utils/
│   └── toast-effects.ts         # Disparadores de eventos
├── index.tsx                     # Barrel export
├── IDEAS.md                      # Ideas para futuras mejoras
└── README.md                     # Esta documentación
```

## Personalización

### Ajustar duración de animación

En `ToastBorderEffect.tsx`, línea 35:
```tsx
setTimeout(() => {
  setIsAnimating(false);
  setTimeout(() => setActiveToast(null), 300);
}, 2000); // Cambiar este valor (ms)
```

### Cambiar colores

En `ToastBorderEffect.tsx`, líneas 15-20:
```tsx
const TOAST_COLORS = {
  error: 'hsl(0, 100%, 50%)',     // Rojo
  success: 'hsl(150, 100%, 45%)', // Verde
  warning: 'hsl(60, 100%, 50%)',  // Amarillo
  info: 'hsl(174, 100%, 50%)',    // Cyan
};
```

### Desactivar efectos específicos

Comenta las secciones en `ToastBorderEffect.tsx`:
- Borde: Líneas 58-66
- Hexágonos: Líneas 68-95
- Scanlines: Líneas 98-110

## Futuras Mejoras

Ver `IDEAS.md` para la lista completa de mejoras planeadas, incluyendo:
- Screen shake para errores críticos
- Sistemas de partículas
- Efectos de glitch
- Sonidos opcionales
- Y más...

## Notas Técnicas

- **Performance**: Usa CSS animations en lugar de JS para mejor rendimiento
- **Accessibility**: Los efectos son puramente visuales, no interfieren con lectores de pantalla
- **Mobile**: Funciona en dispositivos móviles (efectos reducidos automáticamente)
- **Z-index**: Usa `z-50` para estar sobre el contenido pero bajo modales críticos
