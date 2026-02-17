# Task Breakdown: AI Assistant (Phase 4)

## Overview
Total Tasks: 12

## Task List

### Layer 1: Database & Foundation

#### Task Group 1: Chat Storage
- [ ] 1.0 Update `prisma/schema.prisma` to include AI support.
  - [ ] 1.1 Add `Conversation` and `Message` models.
  - [ ] 1.2 Add `meta` JSON field to User for AI-specific personality settings.
  - [ ] 1.3 Run `bunx prisma generate` and `prisma db push`.
- [ ] 2.0 Install Dependencies.
  - [ ] 2.1 Install AI SDK: `bun add ai @ai-sdk/openai zod`.

---

### Layer 2: API & Logic

#### Task Group 2: Vercel AI SDK Integration
- [ ] 3.0 Implement `/api/chat` route handler.
  - [ ] 3.1 Setup OpenAI provider with edge runtime.
  - [ ] 3.2 Implement basic system prompt for "Guided Interview".
  - [ ] 3.3 Verify streaming responses via curl/Insomnia.
- [ ] 4.0 Implement Tool Calling for Profile Updates.
  - [ ] 4.1 Define `addSkill` and `addExperience` tools for the AI.
  - [ ] 4.2 Link tools to existing `portfolio.service.ts` logic.

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
