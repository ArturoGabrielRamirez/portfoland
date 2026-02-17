# Specification: AI Assistant (v0.4.0)

## Goal
Integrate the Vercel AI SDK into Portfoland to provide a "Guided CV Interview" experience that helps users populate their profiles and "AI Content Suggestions" to optimize their professional descriptions.

## User Stories
- [NEW] As a new user, I want an AI assistant to interview me about my career so that I don't have to fill out complex forms manually. (Guided CV Interview)
- [NEW] As a portfolio owner, I want the AI to suggest improvements to my project descriptions so that my portfolio sounds more professional and impactful. (AI Content Suggestions)
- [NEW] As a visitor, I want to hear a narrative summary of the owner's career in the public portfolio AI section. (Career Timeline Narrator)
- [NEW] As a portfolio owner, I want to ask the AI what skills I should learn next based on my current tree. (Skill Explorer)

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
- **Location**: This lives in the `AI` section of the public portfolio (`/[locale]/[username]`).
- **Narrator Mode**: The public-facing AI summarizes the user's journey for recruiters. (Gaming: "AI Core Interface"; Professional: "Professional Assistant").
- **Safety**: Implement strict system prompts to prevent the AI from hallucinating or going off-topic.

### 5. Skill Explorer Integration (Idea #2)
- **Concept**: The AI analyzes the user's `UserSkill` records.
- **Advice**: Users can ask "What's next for my frontend path?" and the AI suggests nodes to unlock in the Skill Tree.

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
