# AI Features Ideas (Phase 4+)

> Ideas recopiladas para futuras implementaciones de IA en Portfoland.

---

## 🔥 Ideas Fuertes (Alto Valor)

### 1. Portfolio Adaptativo al Visitante
**Concepto:** "Este portfolio se reordena según quién lo mira"

**Flujo:**
- Visitante elige rol: Recruiter / Tech Lead / Founder / Cliente
- La IA:
  - Reordena skills
  - Resalta proyectos relevantes
  - Ajusta el timeline
  - Genera un mini pitch arriba

**Ejemplo output:**
> "Para un Tech Lead, este perfil destaca arquitectura, escalabilidad y liderazgo técnico."

**Valor:** Demuestra producto + UX + IA en acción.

---

### 2. Explorador Inteligente de Skills (Árbol Vivo)
**Concepto:** Skills tree conversacional

**Capacidades IA:**
- "¿Qué skills me faltan para ser Senior Frontend?"
- "Comparame este perfil con el de un Backend Dev"
- "¿Qué nodo del árbol debería fortalecer primero?"

**Visual:**
- La IA resalta nodos relevantes
- Sugiere caminos: "Si reforzás X → Y → Z, en 3-6 meses estás listo para roles SSR"

---

### 3. Timeline Explicado por IA (Narrador de Carrera)
**Concepto:** IA como narrador de la historia profesional

**Capacidades:**
- "Contame la historia de esta carrera"
- "¿Qué decisiones fueron clave?"
- "¿Dónde hubo cambios de rumbo?"

**Ejemplo output:**
> "En 2023 hay un punto de inflexión: pasa de ejecutar tareas a liderar decisiones técnicas."

**Valor:** Oro para recruiters que quieren entender el journey.

---

### 4. CV Dinámico Generado en Tiempo Real
**Concepto:** CV optimizado para cada job description

**Flujo:**
1. Usuario pega job description
2. La IA:
   - Genera CV optimizado
   - Ajusta bullets
   - Reordena skills
   - Marca gaps

**Extra:**
> "Este CV tiene 82% de match con la posición."

---

### 5. Simulador de Entrevistas
**Concepto:** Práctica de entrevistas con feedback IA

**Tipos:**
- Entrevista técnica
- Behavioral (STAR method)
- System design (si aplica)

**Feedback:**
- "Tu respuesta fue clara, pero faltó impacto"
- "Acá podrías usar el método STAR"

**Valor:** Hace que la gente se quede en el sitio.

---

## ✨ Ideas Livianas (Menor Complejidad)

### 6. AI Career Coach
Mini coach basado en el perfil:
- "¿Qué aprender ahora?"
- "¿Qué proyecto sumar?"
- "¿Cómo vender mejor este perfil?"

### 7. Modo Comparación
- Comparar dos timelines
- Comparar dos árboles de skills
- IA explica diferencias

### 8. Storytelling Automático
Botón: "Contá esta carrera como historia"

**Outputs:**
- LinkedIn About section
- Pitch de 30 segundos
- Bio para web

---

## Priorización Sugerida para Phase 4

| Prioridad | Feature | Complejidad | Impacto |
|-----------|---------|-------------|---------|
| 1 | CV Dinámico (#4) | M | Alto - uso práctico inmediato |
| 2 | Explorador de Skills (#2) | M | Alto - integra con Phase 3 |
| 3 | Timeline Narrador (#3) | S | Medio - diferenciador único |
| 4 | Career Coach (#6) | S | Medio - engagement |
| 5 | Portfolio Adaptativo (#1) | L | Muy Alto - wow factor |
| 6 | Simulador Entrevistas (#5) | L | Alto - retención |
| 7 | Storytelling (#8) | S | Medio - quick win |
| 8 | Modo Comparación (#7) | M | Bajo - nicho |

---

## Notas Técnicas

- Requiere Vercel AI SDK (Phase 4 roadmap)
- Considerar streaming responses para UX fluida
- Data model de skills debe estar preparado (Phase 3)
- Posible integración con LinkedIn API para imports
