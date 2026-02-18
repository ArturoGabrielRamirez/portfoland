# Specification: AI Assistant (v0.4.0)

## Goal
Integrate the Vercel AI SDK into Portfoland to provide a "Guided CV Interview" experience that helps users populate their profiles and "AI Content Suggestions" to optimize their professional descriptions.

## User Stories
- [NEW] As a new user, I want an "RPG Master" AI to interview me about my career journey so that I feel like I'm building a character.
- [NEW] As a system admin, I want to limit users to 3 AI interactions per day (Lives) to manage operational costs.
- [NEW] As a user, I want the AI to "see" my current skill tree so it can suggest exactly which "nodes" to learn next and provide documentation links. (Learning Path Suggester)

## Specific Requirements

### 1. Vercel AI SDK Integration
- **Framework**: Use `@ai-sdk/openai` or `@ai-sdk/anthropic` via the Vercel AI SDK.
- **Streaming**: Implement streaming responses for a fluid "typing" feel.
- **Server Actions**: Use `ai/react` hooks (`useChat`) and edge-compatible server actions for chat processing.
- **Provider**: Configure OpenAI (GPT-4o/mini) as the default provider.

### 2. Guided CV Interview (The Onboarding Assistant)
- **Interface**: A chat interface in the dashboard that guides the user.
- **Tool Calling**: The AI should be able to "propose" new experiences or skills.
- **State Management**: Persist conversation state in the database so users can return to the interview.
- **Integration**: Once the user approves a suggestion, the AI calls the existing `portfolio.service.ts` to save the data.

### 3. AI Content Suggestions (Dashboard Enhancement)
- **Inline Optimization**: Buttons next to "Project Description" or "About Me" fields to "Improve with AI".
- **Context Awareness**: The AI should use the user's existing skills and projects as context for suggestions.
- **Gaming Mode Tone**: In project cards, allow the AI to generate "Flavor Text" for the Gaming mode (e.g., "This project was a Rank S mission...").

### 4. AI Public Portfolio Section (The Narrator)
- **Public Assistant**: Move the AI section from a placeholder to a functional "Storyteller" component.
- **Narrator Mode**: The public-facing AI summarizes the user's journey for recruiters. (Gaming: "AI Core Interface"; Professional: "Professional Assistant").

### 5. Gamification: RPG Master Persona (Task 3.2 refined)
- **Voice**: The AI speaks as a Dungeon Master or AI Overseer. "MISSION LOG DETECTED", "PROPOSING NEW SKILL ACQUISITION...".
- **Interaction**: Questions should be framed as "Quest Objectives".

### 6. Gamification: Lives System (Cost Protection)
- **Quota**: Users get 3 "Lives" (interactions) per 24 hours.
- **Tracking**: Store `remainingLives` and `lastResetDate` in the User's `meta` JSON field.
- **Reset Logic**: A middleware or helper should reset lives if `lastResetDate` is not today.

### 7. Skill Tree Reader & Suggester (Task 4.0 expanded)
- **Tool CALLING**: Add `getSkillTreeData` tool so the AI can retrieve current levels.
- **External Links**: AI suggests YouTube, MDN, or documentation links for low-level or missing nodes.

## Technical Architecure

### [API Routes]
- `POST /api/chat`: Main endpoint for the AI SDK `useChat` hook.
- `app/api/chat/route.ts`: Edge Runtime implementation.

### [Schema Updates]
- Add `Conversation` model to Prisma to store AI interactions.
- Add `aiSuggestions` field to user metadata if needed.

### [Components]
- `features/ai/components/AIChatContainer.tsx`: Reusable chat window.
- `features/ai/components/SuggestionButton.tsx`: Wrapper for text fields to spark AI optimization.

## Verification Plan

### Automated Tests
- Integration tests for `/api/chat` endpoint.
- Prompt validation tests (ensuring it doesn't leak system instructions).

### Manual Verification
- Complete a full "Guided Interview" from a fresh account.
- Verify streaming works without flickering.
- Test "Improve with AI" button on a project description.
