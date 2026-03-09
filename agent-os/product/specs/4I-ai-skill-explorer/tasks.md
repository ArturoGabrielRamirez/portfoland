# Task Breakdown: 4I — AI Skill Explorer & Global AI Sidebar

## Overview

Total Task Groups: 4
Total Tasks: ~15

This spec transitions the existing locally-scoped `AIChatContainer` inside the Portfolio Settings into a **Persistent Global Sidebar** (a sliding drawer) available across the entire Dashboard. It also equips the AI with tools to highlight skills in the `CRTSkillCanvas` in real-time, bridging conversational text and interactive visualizations.

**Key Requirements:**
- The sidebar must smoothly push the main dashboard content aside (reducing its width) so that the AI and the Skill Tree can be viewed side-by-side.
- The user must be able to toggle the sidebar via a new icon in the `DashboardTopNav`.
- A global React context (`AIContext`) manages both the sidebar's open state and the list of currently `highlightedSkills`.
- The `CRTSkillCanvas` elements react dynamically to `highlightedSkills` by applying glowing highlights.

---

## Task List

### TG1: Global AI Sidebar UI Framework
- [x] TG1-A: Create `features/ai/context/AIContext.tsx` to hold `{ isSidebarOpen, setIsSidebarOpen, highlightedSkills, setHighlightedSkills }`. Wrap `DashboardPageLayout` with this Provider.
- [x] TG1-B: Create `features/ai/components/GlobalAISidebar.tsx`. Use a fixed or sticky container that animates entering from the right. It should wrap the existing `AIChatContainer`.
- [x] TG1-C: Update `DashboardPageLayout` to conditionally squeeze the main content (e.g., changing width to `calc(100% - 320px)` or using a CSS Grid layout) when `isSidebarOpen` is true. Render `GlobalAISidebar` next to it.
- [x] TG1-D: Update `features/dashboard/components/DashboardTopNav.tsx` or similar. Add an AI "Magic Wand" or Bot Icon button that toggles `setIsSidebarOpen`.

### TG2: Removing Old HUD AI Location
- [x] TG2-A: Remove the `HUDPanel` and `AIChatContainer` from `app/[locale]/(dashboard)/dashboard/portfolio/DashboardPortfolioView.tsx`. The layout now handles the chat globally. (Note: retain the original imports inside `DashboardPortfolioView` if used elsewhere, or clean up).

### TG3: Cross-Reference Highlight State Integration
- [x] TG3-A: Update `CRTSkillCanvas` to consume `useAIContext()`.
- [x] TG3-B: Inside the node rendering loop of `CRTSkillCanvas`, check if `node.skill.skill?.name` (or slug) exists within `highlightedSkills`.
- [x] TG3-C: Apply a distinct `#00D4FF` drop-shadow "glow" and active border state to any highlighted hexagon to make it pop visually.

### TG4: AI Server Tools (suggestLearningPath)
- [x] TG4-A: Update `app/api/chat/route.ts` to attach an AI SDK `tool` called `suggestLearningPath`.
- [x] TG4-B: Define the tool schema: parameters like `skillsToLearn` (array of strings). 
- [x] TG4-C: In `AIChatContainer.tsx` (or where `useChat` is defined), intercept `onToolCall` (or use the tool invocation component) to dispatch `setHighlightedSkills(toolCall.args.skillsToLearn)` into the Context when the tool fires!

### TG5: QA Checklist
- [x] Verify TopNav button slides out the sidebar seamlessly.
- [x] Verify the Skill Tree isn't obstructed by the sidebar; it shrinks in flex layout properly.
- [x] Verify the AI Chat retains its history and energy counter.
- [x] When asking "What frontend skills should I learn next?", verify that if it mentions React/Next.js, those respective nodes start glowing instantly on the tree.
