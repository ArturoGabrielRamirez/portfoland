# Task Breakdown: AI Assistant (Phase 4) - ACTUALIZADO

> **Última actualización:** 2026-02-17
> **Estado:** Fase 4 parcialmente completa - Correcciones críticas pendientes

## Overview
- **Total Tasks Original:** 12
- **Tasks Completadas:** 9/12 (75%)
- **Tasks Pendientes Críticas:** 3
- **Features Extra Implementadas:** 6 (Dashboard Portfolio completo)

---

## ✅ COMPLETADO (Layer 1-3: Database, API & UI)

### Layer 1: Database & Foundation

#### Task Group 1: Chat Storage ✅ COMPLETO
- [x] 1.0 Update `prisma/schema.prisma` to include AI support.
  - [x] 1.1 Add `Conversation` and `Message` models.
  - [x] 1.2 Add `meta` JSON field to User for AI-specific personality settings.
  - [x] 1.3 Run `bunx prisma generate` and `prisma db push`.
- [x] 2.0 Install Dependencies.
  - [x] 2.1 Install AI SDK: `bun add ai @ai-sdk/google zod`.

**Estado:** ✅ Prisma schema actualizado, models creados, dependencias instaladas.

---

### Layer 2: API & Logic

#### Task Group 2: Vercel AI SDK Integration ✅ COMPLETO (con exceptions)
- [x] 3.0 Implement `/api/chat` route handler.
  - [x] 3.1 Setup Google AI provider (Gemini 2.0 Flash) with nodejs runtime.
  - [x] 3.2 Implement RPG Master system prompt (Dungeon Master persona).
  - [x] 3.3 Verify streaming responses (funciona correctamente).

**Estado:** ✅ API route implementada con Gemini 2.0 Flash, streaming funcional.

---

#### Task Group 2.1: Lives System ⚠️ PARCIALMENTE COMPLETO

- [x] 3.4.0 Create `lib/ai/lives.ts` with Lives logic.
  - [x] 3.4.0.1 Implement `checkAndConsumLives` function.
  - [x] 3.4.0.2 Implement daily reset logic (3 lives/24h).
  - [x] 3.4.0.3 Implement `getUserAIConfig` helper.

**Estado:** ✅ Código creado y funcional.

**🔴 PERO - NO INTEGRADO:**

- [ ] **3.4.1 Integrate Lives check in `/api/chat` route.** 🔴 CRÍTICO
  - [ ] 3.4.1.1 Import and call `checkAndConsumLives(userId)` before processing.
  - [ ] 3.4.1.2 Return 429 error if `hasLives === false`.
  - [ ] 3.4.1.3 Include `remainingLives` in response metadata.

- [ ] **3.4.2 Display Lives in AIChatContainer UI.** 🔴 CRÍTICO
  - [ ] 3.4.2.1 Fetch current lives on component mount.
  - [ ] 3.4.2.2 Update lives display after each message.
  - [ ] 3.4.2.3 Show "Out of Lives" message when depleted.
  - [ ] 3.4.2.4 Show countdown timer for reset.

**Archivos a modificar:**
- `app/api/chat/route.ts` (agregar check al inicio de POST)
- `features/dashboard/components/ai/AIChatContainer.tsx` (agregar lives UI)

---

#### Task Group 3: Tool Calling ⚠️ PARCIALMENTE COMPLETO

- [x] 4.0 Implement Tool Calling for Profile Updates.
  - [x] 4.1 Define `add_skill` and `add_experience` tools for the AI.
  - [x] 4.2 Link tools to existing `portfolio.service.ts` logic.
  - [x] 4.2.1 Create `add_experience` tool with zod validation.
  - [x] 4.2.2 Create `add_skill` tool with zod validation.
  - [x] 4.2.3 Create `get_portfolio_data` tool to read user skills.

**Estado:** ✅ 3 tools básicos implementados y funcionales.

**🔴 TOOLS FALTANTES:**

- [ ] **4.3 Add `getSkillTreeData` tool.** 🔴 ALTA PRIORIDAD
  - [ ] 4.3.1 Create tool that returns full skill tree with levels.
  - [ ] 4.3.2 Include skill categories and dependencies.
  - [ ] 4.3.3 AI can suggest "next nodes to unlock".

- [ ] 4.4 Add `suggestLearningResource` tool. 🟡 BAJA (v0.4.1+)
  - [ ] 4.4.1 Search YouTube/Udemy for relevant courses.
  - [ ] 4.4.2 Return structured resource recommendations.

**Archivos a modificar:**
- `app/api/chat/route.ts` (agregar nuevos tools al objeto `tools`)
- `features/skills/data/getSkillTree.data.ts` (crear si no existe)

---

### Layer 3: UI Implementation

#### Task Group 4: AI Chat Interface ✅ COMPLETO

- [x] 5.0 Create `AIChatContainer.tsx` component.
  - [x] 5.1 Use `useChat` hook for streaming state.
  - [x] 5.2 Style with "Cyberpunk" variant (Gaming Mode).
  - [x] 5.3 Implement auto-scroll behavior.
  - [x] 5.4 Add loading states and error handling.
  - [x] 5.5 Add hydration safety (mounted state).

**Estado:** ✅ Componente completo con excelente UX cyberpunk.

---

- [x] 6.0 Integrate AI Assistant into Dashboard.
  - [x] 6.1 Add AI chat to Dashboard Portfolio page.
  - [x] 6.2 Implement as HUDPanel for consistent styling.

**Estado:** ✅ Integrado en `DashboardPortfolioView.tsx` con HUDPanel.

---

#### Task Group 5: Content Optimization ❌ NO IMPLEMENTADO

- [ ] **7.0 Implement "Improve with AI" buttons.** 🟡 MEDIA PRIORIDAD
  - [ ] 7.1 Add "Improve with AI" button to Bio field.
    - [ ] 7.1.1 Create `ImproveBioButton.tsx` component.
    - [ ] 7.1.2 Call `/api/ai/improve-bio` endpoint.
    - [ ] 7.1.3 Replace bio text with AI suggestion (editable).

  - [ ] 7.2 Add "Improve with AI" button to Project descriptions.
    - [ ] 7.2.1 Create `ImproveDescriptionButton.tsx` component.
    - [ ] 7.2.2 Implement specialized prompt for "impact-focused" descriptions.
    - [ ] 7.2.3 Support Gaming Mode vs Professional Mode tone.

**Archivos a crear/modificar:**
- `features/ai/components/ImproveBioButton.tsx` (nuevo)
- `features/ai/components/ImproveDescriptionButton.tsx` (nuevo)
- `app/api/ai/improve-bio/route.ts` (nuevo)
- `app/api/ai/improve-description/route.ts` (nuevo)
- `DashboardPortfolioView.tsx` (agregar botón junto a bio textarea)

---

### Layer 4: Public Portfolio Section

#### Task Group 6: The Narrator ❌ NO IMPLEMENTADO

- [ ] **8.0 Refactor placeholder AI sections.** 🔴 ALTA PRIORIDAD (visible en portfolio público)
  - [ ] 8.1 Connect `GamingAI.tsx` to backend.
    - [ ] 8.1.1 Create `/api/ai/narrate-portfolio` endpoint.
    - [ ] 8.1.2 Pass user data (skills, experiences, projects) to AI.
    - [ ] 8.1.3 AI generates narrative summary (Gaming tone).
    - [ ] 8.1.4 Cache result for 24h to reduce costs.

  - [ ] 8.2 Connect `ProfessionalAI.tsx` to backend.
    - [ ] 8.2.1 Use same endpoint with `mode` parameter.
    - [ ] 8.2.2 AI generates professional summary.
    - [ ] 8.2.3 Implement "Ask a question" feature.

**Archivos a modificar:**
- `features/portfolio/components/gaming/GamingAI.tsx`
- `features/portfolio/components/professional/ProfessionalAI.tsx`
- `app/api/ai/narrate-portfolio/route.ts` (nuevo)

---

## 🎁 BONUS: Features Extra Implementadas (No en spec original)

### Dashboard Portfolio Edit Page - COMPLETO ✅

> **Context:** Implementado desde `DELEGATION-PLAN.md` - Feature completa de edición de portfolio.

- [x] 9.0 Dashboard Portfolio Edit Page (BONUS)
  - [x] 9.1 Create server page component (`app/.../dashboard/portfolio/page.tsx`)
  - [x] 9.2 Create client view component (`DashboardPortfolioView.tsx`)
  - [x] 9.3 Create `updateProfile` server action (three-layer architecture)
    - [x] 9.3.1 `features/portfolio/actions/updateProfile.ts`
    - [x] 9.3.2 `features/portfolio/services/portfolio.service.ts`
    - [x] 9.3.3 `features/portfolio/data/updateProfile.data.ts`
  - [x] 9.4 Add `updateProfileSchema` to Yup schemas
  - [x] 9.5 Basic fields: name, bio, image, portfolioMode

**Features Avanzadas Agregadas:**
- [x] 9.6 Section Ordering System
  - [x] 9.6.1 Drag with arrows (up/down) to reorder sections
  - [x] 9.6.2 Store order in `User.sectionOrder` array
  - [x] 9.6.3 Apply order to public portfolio rendering

- [x] 9.7 Contact Links Management
  - [x] 9.7.1 Fixed links (GitHub, LinkedIn, Email)
  - [x] 9.7.2 Custom links (label + URL pairs)
  - [x] 9.7.3 Store in `User.contactLinks` JSON field

- [x] 9.8 Section Visibility Toggles
  - [x] 9.8.1 Show/hide sections on public portfolio
  - [x] 9.8.2 Store in `User.sectionVisibility` JSON field
  - [x] 9.8.3 Eye icon toggle in each HUDPanel

- [x] 9.9 Profile Image Upload
  - [x] 9.9.1 `uploadProfileImage` server action
  - [x] 9.9.2 Vercel Blob storage integration
  - [x] 9.9.3 `deleteProfileImage` server action
  - [x] 9.9.4 `ProfileImageUpload` component

- [x] 9.10 Markdown Bio Support
  - [x] 9.10.1 Professional mode: rendered as markdown
  - [x] 9.10.2 Gaming mode: terminal-style rendering
  - [x] 9.10.3 Character counter (500 chars max)

**Estado:** ✅ Feature completa y funcional con excelentes extras.

---

## 🔴 SECCIÓN 1: TAREAS CRÍTICAS PENDIENTES (Para implementar YA)

### Prioridad: ALTA - Afectan funcionalidad core y costos

#### **TAREA 1.1: Integrar Lives System en /api/chat** 🔴

**Objetivo:** Limitar llamadas a AI a 3 por día por usuario.

**Archivos a modificar:**
- `app/api/chat/route.ts`

**Cambios necesarios:**

```typescript
// En app/api/chat/route.ts, después de auth check (línea ~54):

const userId = session.user.id;

// 🆕 AGREGAR: Check y consumir lives
const { hasLives, remainingLives, error } = await checkAndConsumLives(userId);

if (!hasLives) {
  return new Response(
    JSON.stringify({
      error: error || 'No lives remaining',
      remainingLives: 0,
      resetTime: 'tomorrow'
    }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Continuar con processing...
const { messages } = await req.json();
```

**Testing:**
- [ ] Verificar que después de 3 llamadas retorna 429
- [ ] Verificar que al día siguiente (cambiar fecha en DB) se resetea
- [ ] Verificar que `remainingLives` decrementa correctamente

**Estimación:** 30 min

---

#### **TAREA 1.2: Mostrar Lives en UI (AIChatContainer)** 🔴

**Objetivo:** Usuario vea cuántas "vidas" le quedan.

**Archivos a modificar:**
- `features/dashboard/components/ai/AIChatContainer.tsx`

**Cambios necesarios:**

1. **Crear endpoint para leer lives:**
   - Archivo: `app/api/ai/lives/route.ts` (nuevo)
   ```typescript
   import { getUserAIConfig } from '@/lib/ai/lives';
   // GET endpoint que retorna { remainingLives, lastResetDate }
   ```

2. **Actualizar AIChatContainer:**
   ```tsx
   // Estado para lives
   const [lives, setLives] = useState<number>(3);

   // Fetch al montar
   useEffect(() => {
     fetch('/api/ai/lives')
       .then(res => res.json())
       .then(data => setLives(data.remainingLives));
   }, []);

   // Decrementar después de cada mensaje exitoso
   useEffect(() => {
     if (messages.length > 0) {
       setLives(prev => Math.max(0, prev - 1));
     }
   }, [messages.length]);

   // Actualizar header visual (línea ~68-74):
   <div className="flex gap-0.5">
     {[1, 2, 3].map(i => (
       <div
         key={i}
         className={cn(
           "w-1.5 h-1.5 rounded-full border",
           i <= lives
             ? "bg-[#00D4FF] border-[#00D4FF]" // Vida activa
             : "bg-gray-800 border-gray-700"    // Vida perdida
         )}
       />
     ))}
   </div>
   <span className="text-[8px] font-mono text-gray-500 uppercase">
     Energy: {lives}/3 Lives
   </span>
   ```

3. **Manejar "Out of Lives":**
   ```tsx
   // Si lives === 0, deshabilitar input
   {lives === 0 && (
     <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-xs">
       ⚠️ Out of energy! Recharge in 24h.
     </div>
   )}

   <input
     disabled={lives === 0 || isLoading}
     // ...
   />
   ```

**Testing:**
- [ ] Lives display actualiza correctamente
- [ ] Después de 3 mensajes, input se deshabilita
- [ ] Mensaje de "Out of Lives" aparece
- [ ] Visual de "vidas" refleja estado real

**Estimación:** 1 hora

---

#### **TAREA 1.3: Implementar getSkillTreeData tool** 🟡

**Objetivo:** AI puede ver todo el skill tree y sugerir qué aprender.

**Archivos a crear/modificar:**
- `app/api/chat/route.ts` (agregar tool)
- `features/skills/data/getSkillTree.data.ts` (posiblemente ya existe)

**Cambios necesarios:**

```typescript
// En app/api/chat/route.ts, agregar tool:

get_skill_tree: tool({
  description: 'Retrieve the user\'s complete skill tree with levels and categories.',
  parameters: z.object({
    reason: z.string().describe('Why you need the skill tree data'),
  }),
  execute: async () => {
    try {
      const skillTree = await getUserSkillTreeData(userId);

      return skillTree.map(us => ({
        skill: us.skill.name,
        category: us.skill.category.name,
        level: us.selfAssessmentLevel,
        validated: us.githubValidated,
        dependencies: us.skill.dependencies || []
      }));
    } catch (err) {
      console.error('TOOL_ERROR (get_skill_tree):', err);
      return { error: 'Failed to retrieve skill tree' };
    }
  },
}),
```

**Data layer:**
```typescript
// features/skills/data/getSkillTree.data.ts (crear si no existe)
export async function getUserSkillTreeData(userId: string) {
  return prisma.userSkill.findMany({
    where: { userId },
    include: {
      skill: {
        include: {
          category: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

**Testing:**
- [ ] AI puede llamar `get_skill_tree` tool
- [ ] Retorna skills con categorías y niveles
- [ ] AI sugiere skills basándose en el tree

**Estimación:** 45 min

---

## 🟡 SECCIÓN 2: TAREAS DE MEJORA (Media Prioridad)

### **TAREA 2.1: Conversation Persistence** 🟡

**Objetivo:** Guardar historial de chat en DB para continuidad.

**Archivos a modificar:**
- `app/api/chat/route.ts`

**Cambios necesarios:**

1. **Crear/recuperar Conversation al inicio:**
   ```typescript
   let conversation = await prisma.conversation.findFirst({
     where: { userId },
     orderBy: { updatedAt: 'desc' }
   });

   if (!conversation) {
     conversation = await prisma.conversation.create({
       data: {
         userId,
         title: 'Career Guidance Chat'
       }
     });
   }
   ```

2. **Guardar mensajes después del streaming:**
   ```typescript
   async onFinish({ text, messages }) {
     // Guardar todos los mensajes nuevos
     await prisma.message.createMany({
       data: messages.map(m => ({
         conversationId: conversation.id,
         role: m.role === 'user' ? 'USER' : 'ASSISTANT',
         content: m.content,
         metadata: m.toolInvocations ? { tools: m.toolInvocations } : null
       }))
     });
   }
   ```

3. **Cargar mensajes previos:**
   ```typescript
   const previousMessages = await prisma.message.findMany({
     where: { conversationId: conversation.id },
     orderBy: { createdAt: 'asc' },
     take: 20 // últimos 20 mensajes
   });
   ```

**Testing:**
- [ ] Refrescar página mantiene historial
- [ ] Mensajes persisten en DB
- [ ] Limit de 20 mensajes funciona

**Estimación:** 1.5 horas

---

### **TAREA 2.2: "Improve with AI" - Bio Field** 🟡

**Objetivo:** Botón junto a bio para optimizar con IA.

**Archivos a crear:**
- `features/ai/components/ImproveBioButton.tsx`
- `app/api/ai/improve-bio/route.ts`

**Implementación:**

1. **Componente:**
   ```tsx
   // ImproveBioButton.tsx
   export function ImproveBioButton({
     currentBio,
     onImproved
   }: {
     currentBio: string;
     onImproved: (newBio: string) => void
   }) {
     const [isImproving, setIsImproving] = useState(false);

     const handleImprove = async () => {
       setIsImproving(true);
       const res = await fetch('/api/ai/improve-bio', {
         method: 'POST',
         body: JSON.stringify({ bio: currentBio }),
       });
       const { improvedBio } = await res.json();
       onImproved(improvedBio);
       setIsImproving(false);
     };

     return (
       <button onClick={handleImprove} disabled={isImproving}>
         <Sparkles /> Improve with AI
       </button>
     );
   }
   ```

2. **API Route:**
   ```typescript
   // app/api/ai/improve-bio/route.ts
   import { google } from '@ai-sdk/google';
   import { generateText } from 'ai';

   export async function POST(req: Request) {
     const { bio } = await req.json();

     const result = await generateText({
       model: google('gemini-2.0-flash'),
       prompt: `Improve this bio to be more impactful and professional:

       "${bio}"

       Make it concise (50-80 words), focus on value and achievements.
       Return only the improved bio, no explanation.`
     });

     return Response.json({ improvedBio: result.text });
   }
   ```

3. **Integrar en DashboardPortfolioView:**
   ```tsx
   // Junto al bio textarea (línea ~249)
   <div className="flex items-center justify-between">
     <label>Developer Bio</label>
     <ImproveBioButton
       currentBio={bio}
       onImproved={(newBio) => setBio(newBio)}
     />
   </div>
   ```

**Testing:**
- [ ] Botón genera bio mejorada
- [ ] Bio se actualiza en el campo
- [ ] Usuario puede editar después

**Estimación:** 2 horas

---

### **TAREA 2.3: "Improve with AI" - Project Descriptions** 🟡

**Similar a TAREA 2.2 pero para proyectos.**

**Archivos a crear:**
- `features/ai/components/ImproveDescriptionButton.tsx`
- `app/api/ai/improve-description/route.ts`

**Estimación:** 2 horas (similar a bio)

---

## 🔵 SECCIÓN 3: FEATURES PÚBLICAS (Baja Prioridad - Visible pero no crítico)

### **TAREA 3.1: Public AI Narrator (Gaming Mode)** 🔵

**Objetivo:** AI cuenta la historia profesional del usuario en portfolio público.

**Archivos a modificar:**
- `features/portfolio/components/gaming/GamingAI.tsx`
- `app/api/ai/narrate-portfolio/route.ts` (nuevo)

**Implementación:**

1. **API Route:**
   ```typescript
   // Fetch user data (skills, experiences, projects)
   // Generate narrative with AI
   // Cache result for 24h (Redis or DB)
   ```

2. **Component:**
   ```tsx
   // GamingAI.tsx
   useEffect(() => {
     fetch(`/api/ai/narrate-portfolio?username=${username}`)
       .then(res => res.json())
       .then(data => setNarrative(data.narrative));
   }, [username]);
   ```

**Estimación:** 3 horas

---

### **TAREA 3.2: Public AI Narrator (Professional Mode)** 🔵

**Similar a TAREA 3.1 pero tono profesional.**

**Estimación:** 2 horas (reutiliza endpoint)

---

## 🌟 SECCIÓN 4: FEATURES FUTURAS (Opcional - No bloquean v0.4.0)

### **TAREA 4.1: Screenshot de Links (Vision AI)** 🌟

**Objetivo:** AI toma screenshot de URL y la analiza.

**Context:** Usuario mencionó esta idea para futuro.

**Implementación posible:**
- Tool `take_screenshot` que usa Playwright
- Envía screenshot a Gemini Vision
- Retorna análisis del contenido

**Estimación:** 4-6 horas (requiere Playwright setup)

**Estado:** 📝 Idea guardada para v0.4.2+

---

### **TAREA 4.2: Upload de Imágenes para Proyectos** 🌟

**Objetivo:** Pasar múltiples imágenes al AI para agregar a proyecto.

**Implementación posible:**
- Tool `add_project_images`
- Integración con Vercel Blob
- Vision AI para generar descripciones automáticas

**Estimación:** 3-4 horas

**Estado:** 📝 Idea guardada para v0.4.2+

---

### **TAREA 4.3: AI Edit Database (Experimento)** 🌟

**Objetivo:** AI puede editar datos existentes (no solo crear).

**Consideraciones de seguridad:**
- ⚠️ Requiere confirmación del usuario
- ⚠️ Solo ciertos campos editables
- ⚠️ Historial de cambios (audit log)

**Tools necesarios:**
```typescript
update_experience: tool({
  description: 'Update an existing experience',
  parameters: z.object({
    experienceId: z.string(),
    updates: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      // ...
    })
  }),
  execute: async ({ experienceId, updates }) => {
    // Pedir confirmación al usuario primero
    // Update en DB
  }
})
```

**Estimación:** 6-8 horas (con confirmación UI)

**Estado:** 📝 Idea guardada - evaluar viabilidad y seguridad

---

## 📊 RESUMEN DE ESFUERZO

### Prioridad ALTA (Completar para v0.4.0)
- TAREA 1.1: Lives System integration → **30 min** ⚡
- TAREA 1.2: Lives UI → **1 hora** ⚡
- TAREA 1.3: getSkillTreeData tool → **45 min** ⚡

**Total Crítico:** ~2.25 horas

---

### Prioridad MEDIA (v0.4.1)
- TAREA 2.1: Conversation persistence → **1.5 horas**
- TAREA 2.2: Improve Bio button → **2 horas**
- TAREA 2.3: Improve Description button → **2 horas**

**Total Media:** ~5.5 horas

---

### Prioridad BAJA (v0.4.2)
- TAREA 3.1: Gaming AI Narrator → **3 horas**
- TAREA 3.2: Professional AI Narrator → **2 horas**

**Total Baja:** ~5 horas

---

### FUTURO (v0.5.0+)
- TAREA 4.1: Screenshot de links → **4-6 horas**
- TAREA 4.2: Upload imágenes → **3-4 horas**
- TAREA 4.3: AI Edit DB → **6-8 horas**

**Total Futuro:** ~13-18 horas

---

## 🎯 PLAN DE EJECUCIÓN RECOMENDADO

### Sprint 1: Correcciones Críticas (1 sesión)
```bash
# Commit 1: Lives System Integration
- Implementar TAREA 1.1 (30 min)
- Testing manual

# Commit 2: Lives UI
- Implementar TAREA 1.2 (1h)
- Testing visual

# Commit 3: getSkillTreeData Tool
- Implementar TAREA 1.3 (45 min)
- Testing con AI
```

**Entregable:** v0.4.0-final con Lives funcional

---

### Sprint 2: Content Optimization (1-2 sesiones)
```bash
# Commit 4: Conversation Persistence
- Implementar TAREA 2.1

# Commit 5: Improve Bio AI
- Implementar TAREA 2.2

# Commit 6: Improve Descriptions AI
- Implementar TAREA 2.3
```

**Entregable:** v0.4.1 con AI content optimization

---

### Sprint 3: Public Features (1 sesión)
```bash
# Commit 7: AI Narrator (Gaming + Professional)
- Implementar TAREA 3.1 y 3.2
```

**Entregable:** v0.4.2 con portfolio público completo

---

## ✅ CHECKLIST DE VERIFICACIÓN PRE-COMMIT

Antes de cada commit, verificar:

- [ ] Código sigue three-layer architecture
- [ ] Server actions usan `actionWrapper` + Yup/Zod
- [ ] Client components usan `useTransition` + `toast`
- [ ] Auth checks presentes en routes
- [ ] Types definidos correctamente
- [ ] `revalidatePath` para cache invalidation
- [ ] Error handling con try-catch
- [ ] Console logs removidos (production)
- [ ] Testing manual completado
- [ ] Git status clean antes de commit
- [ ] Commit message descriptivo con Co-Authored-By

---

## 📝 NOTAS FINALES

### Decisiones Tomadas
1. ✅ Usar Gemini 2.0 Flash (más económico que Sonnet)
2. ✅ Lives system con meta JSON field (no tabla separada)
3. ✅ Dashboard Portfolio como feature extra (no bloqueó AI Assistant)
4. ✅ Conversation/Message models para futuro persistence

### Features No Implementadas (Intencionalmente)
- ❌ OpenAI/Anthropic providers (solo Google por ahora)
- ❌ Conversation persistence (v0.4.1)
- ❌ Public AI Narrator (v0.4.2)
- ❌ Learning resource suggester (futuro)

### Costos Estimados (con Lives System activo)
```
1000 users × 3 lives/día × 30 días = 90,000 interacciones/mes
90,000 × ~2000 tokens avg = 180M tokens/mes
180M tokens × $0.000015/token (Gemini) = $2,700/mes

Con Lives: $2,700/mes
Sin Lives: Ilimitado → insostenible
```

**Conclusión:** Lives System es CRÍTICO para viabilidad económica.

---

**Estado Final:** Listo para implementación por secciones con commits manuales.
