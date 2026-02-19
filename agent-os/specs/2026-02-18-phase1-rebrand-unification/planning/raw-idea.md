# Phase 1: Rebrand & Unification

From ROADMAP_V2.md Phase 1:

## Tasks:
1. **Renaming en codigo:**
   - `portfolioMode: "gaming"` → `"tech"` en DB y schema
   - `portfolioMode: "professional"` → `"classic"` en DB y schema
   - Todos los condicionales, prompts, cache keys, tipos
   - Migration script para usuarios existentes

2. **Unificar routing a subdominios:**
   - Eliminar ruta `/[locale]/[username]` (o redirect a subdominio)
   - Verificar que proxy/middleware de subdominios funcione para todos los casos
   - Redirect `portfoland.com/user` → `user.portfoland.com`

3. **Actualizar docs de estrategia:**
   - README.md → reflejar Tech Mode / Classic Mode
   - TWO_MODE_STRATEGY.md → marcar como superseded
   - MEMORY.md → actualizar naming y estrategia

4. **Ajustar system prompts de IA:**
   - `chat/route.ts`: RPG_MASTER_PROMPT → reescribir sin terminologia "gaming"
   - Tono: "Mission Briefing" tech-futurista, no "arcade RPG"
   - `narrate-portfolio`: diferenciar prompts Tech vs Classic
