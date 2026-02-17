# Task Breakdown: AI Assistant (Phase 4)

## Overview
Total Tasks: 12

## Task List

### Layer 1: Database & Foundation

#### Task Group 1: Chat Storage
- [x] 1.0 Update `prisma/schema.prisma` to include AI support.
  - [x] 1.1 Add `Conversation` and `Message` models.
  - [x] 1.2 Add `meta` JSON field to User for AI-specific personality settings.
  - [x] 1.3 Run `bunx prisma generate` and `prisma db push`.
- [x] 2.0 Install Dependencies.
  - [x] 2.1 Install AI SDK: `bun add ai @ai-sdk/openai zod`.

---

###- [x] **Phase 4: AI Assistant (v0.4.0) [x]**
  - [x] Install AI SDK dependencies via Bun (`@ai-sdk/google`)
  - [x] Implement `/api/chat` backend route with Tool Calling (Gemini 2.0 Flash)
  - [x] Implement RPG Master Persona & Lives System logic
  - [x] Sync database schema (Conversation/Message/Meta)
  - [x] Create `AIChatContainer` UI component
  - [x] Stability Fixes (Google AI initialization & Hydration fixes)
  - [x] Integrate Skill Explorer and Narrator logic
- [x] **Phase 8: Aesthetic Enhancements (Cyberpunk/Developer)**
  - [x] Implement global CRT/Scanline effects for Gaming mode
  - [x] Add glitch text animations to Gaming Hero
  - [x] Implement terminal-style bio for Professional mode
  - [x] Add "filesystem" metadata to Professional sections
  - [x] Implement system-boot loading transition

### Layer 2: API & Logic

#### Task Group 2: Vercel AI SDK Integration
- [x] 3.0 Implement `/api/chat` route handler.
  - [x] 3.1 Setup OpenAI provider with edge runtime.
  - [/] 3.2 Implement RPG Master system prompt (Dungeon Master persona).
  - [x] 3.3 Verify streaming responses via curl/Insomnia.
- [ ] 3.4 Implement "Lives System" check in `/api/chat`.
  - [ ] 3.4.1 Read `meta.remainingLives` and `meta.lastResetDate`.
  - [ ] 3.4.2 Implement daily reset logic (3 lives/24h).
  - [ ] 3.4.3 Handle "Out of Lives" response.
- [ ] 4.0 Implement Tool Calling for Profile Updates.
  - [x] 4.1 Define `addSkill` and `addExperience` tools for the AI.
  - [x] 4.2 Link tools to existing `portfolio.service.ts` logic.
  - [ ] 4.3 Add `getSkillTreeData` tool to allow AI to see player progress.
  - [ ] 4.4 Add `suggestLearningResource` tool for external links (v0.4.1).

---

### Layer 3: UI Implementation

#### Task Group 3: AI Chat Interface
- [ ] 5.0 Create `AIChatContainer.tsx` component.
  - [ ] 5.1 Use `useChat` hook for streaming state.
  - [ ] 5.2 Style with "Cyberpunk" (Gaming) and "Clean" (Professional) variants.
- [ ] 6.0 Integrate AI Assistant into Dashboard.
  - [ ] 6.1 Add "Start Interview" button to the Hero HUD panel.
  - [ ] 6.2 Implement modal/drawer for the chat experience.

#### Task Group 4: Content Optimization
- [ ] 7.0 Implement "Improve with AI" buttons.
  - [ ] 7.1 Add button to Project description fields.
  - [ ] 7.2 Implement specialized prompt for "impact-focused" descriptions.

---

### Layer 4: Public Portfolio Section

#### Task Group 5: The Narrator
- [ ] 8.0 Refactor placeholder AI sections.
  - [ ] 8.1 Connect `GamingAI.tsx` and `ProfessionalAI.tsx` to the backend.
  - [ ] 8.2 Implement "Narrative" mode where the AI summarizes the user's data.

---

## Execution Order
1. [Chat Storage] (Foundation)
2. [Vercel AI SDK Integration] (API)
3. [AI Chat Interface] (Dashboard UI)
4. [The Narrator] (Public UI)
