# Dashboard Tech Mode UI Polish — Implementation Plan

## Analysis Summary

### Current State (from screenshot)
- WelcomeCard: Avatar + name + XP bar + streak badge. Right side (quick actions honeycomb) is empty because no quickActions are passed from page.tsx
- CRTWithAI: Console with boot lines + AI eye on right side. Working but animations need polish
- HexStatGrid: 4-hex diamond cluster in center. Clean but surrounded by empty space
- Layout: 3-column ROW 2 with missions, hex center, skills+runners

### Reference Design (from image)
- WelcomeCard has a compact SYS_MONITOR panel with session stats, rank, skills info
- Bottom-left has a SYS_LOG section with recent activity entries
- Layout feels denser, more "filled" with data readouts
- Overall more HUD-like with data everywhere

---

## Task 1: WelcomeCard — Transform bottom into tech panel
**File:** `features/tech/components/welcome-card.tsx`

**Plan:** Since quickActions are NOT passed from page.tsx, the right panel never renders. Instead of depending on quickActions, add a new "System Status" HUD panel in the bottom area of the WelcomeCard that shows:
- SYS_MONITOR header with timestamp
- session_stats: active
- Rank: Explorer
- Skills: 24 active
- Next goal: XP progress bar mini
- Network/CPU/RAM mock bars with percentages
- Small status badges (ONLINE, SYNCED, etc.)

**Changes:**
- Add the HUD panel below the XP bar section (replace the quickActions conditional or add alongside it)
- Keep quickActions rendering if passed (backward compat)
- All mock data, no new props needed

---

## Task 2: Avatar swap when AI active
**File:** `features/tech/components/welcome-card.tsx`, `app/[locale]/(protected)/dashboard/page.tsx`

**Decision: Option B — Dashboard page coordinates via callback**
- Reason: WelcomeCard and CRTWithAI are siblings. The dashboard page already has access to both. Using a shared state via useState in page.tsx (lifted to client wrapper) is cleanest.
- BUT page.tsx is a Server Component. So we need a small client wrapper.

**Plan:**
- Create a client component `DashboardContent` that wraps ROW 1 (WelcomeCard + CRTWithAI)
- Add `onAIStateChange?: (state: AIState) => void` callback to CRTWithAI
- Add `aiActive?: boolean` prop to WelcomeCard
- When aiActive, crossfade the avatar SVG to a mini AIEye SVG

**Simplification:** Actually, since we want minimal changes, the simplest approach:
- Add `aiActive?: boolean` prop to WelcomeCard
- Export AIState type from crt-with-ai
- Create a thin client wrapper in dashboard page that manages the state

---

## Task 3: Avatar white corners fix
**File:** `features/tech/components/welcome-card.tsx`

**Problem:** Google profile photos have circular crop → white/transparent corners. The hex clipPath clips the image, but the white background of the circular crop leaks through.

**Fix:**
- Add a `<rect>` fill with the dark background color BEFORE the image, INSIDE the clipPath group
- OR: Apply the clipPath to a `<g>` that contains both the dark fill and the image
- The current approach already has a dark polygon fill, but the image sits ON TOP of it and the white corners of the circular Google image show through the hex shape because the circle is inscribed in the hex

**Better fix:** Add `style={{ background: 'hsl(200,30%,8%)' }}` to the SVG container div, AND ensure the image has a dark background rect behind it within the clip. Actually the real fix is: wrap the image in a group with clipPath, and add a background rect ALSO clipped. Current code already does this. The issue is the image itself has white pixels in the corners that are inside the hex but outside the circle.

**Definitive fix:** Use a circular clip INSIDE the hex clip — double clip. Or better: add a `<rect>` with dark fill that covers the entire viewBox, THEN the image, all inside a clipped group. The dark rect will show through transparent areas of the image.

Actually looking again at the code: there's already `<polygon fill="hsl(200,30%,8%)" .../>` before the image. The issue is that the image (100x100) covers it completely, and Google images have white (not transparent) corners. So we need to clip the IMAGE to a circle first, then the hex clip will show the dark background in the hex corners.

**Solution:** Add a circular clipPath for the image specifically:
```svg
<clipPath id="circle-avatar-clip">
  <circle cx="50" cy="50" r="48" />
</clipPath>
```
Apply this to the image. The hex background fill shows through the hex-but-not-circle areas.

---

## Task 4: AIEye states and animations
**File:** `features/tech/components/crt-with-ai.tsx`

### 4a. Drowsy + blink pupil snap fix
**Problem:** When drowsy and blinking, `isBlinking=true` hides iris/pupil entirely (line 208: `!isSleeping && !isBlinking`). When blink ends, motion.g re-animates from origin.

**Fix:**
- During drowsy state, don't fully hide the iris/pupil on blink. Instead, animate the eyelid (the curved path) over the pupil
- OR: Keep the pupil rendered but at a fixed drowsy position (y=+3), and animate eyelid scaleY instead
- Simplest: When drowsy, keep pupil visible with fixed position {x: 0, y: 3} and use the sleeping line path for blinks but with faster animation

**Implementation:**
- Change pupilY calculation: add `isDrowsy ? 3 : 0` offset
- For drowsy blinks: instead of hiding pupil completely, show a half-closed eye line AND keep pupil at drowsy position underneath (lower opacity)
- Modify the conditional rendering: `{!isSleeping && !(isBlinking && !isDrowsy) && (` — show pupil during drowsy blinks

### 4b. Waking transition
- Add waking state handling: eye opens progressively
- irisRY: sleeping=0, waking=6 (half open), awake=13 (full)
- Add intermediate animation for waking

### 4c. Listening state
- Add slow orbital pupil movement
- Add pulse animation on outer ring
- Change mainColor to a listening-specific color or use cyan with extra glow

### 4d. Ready state
- Visual: stable, alert, slightly enlarged pupil
- Color: green (success-adjacent but calmer)
- Subtle "ready" indicator — steady glow, no jitter

---

## Task 5: Chat history animation
**File:** `features/tech/components/crt-with-ai.tsx`

**Current:** `initial={{ opacity: 0, y: 10 }}` — simple fade up

**Improvement:**
- Entry: slide up from bottom + scanline sweep effect
- Exit: already has a good effect (x: 200, scale: 0.2, blur)
- Add staggered children animation for individual messages
- Entry animation: `initial={{ opacity: 0, y: 40, filter: "blur(2px)" }}` with spring

---

## Task 6: Dashboard empty spaces
**File:** `app/[locale]/(protected)/dashboard/page.tsx`

**Plan:** Add HUD elements above and below the hex cluster in the center column:
- Above hexes: Section title "CORE_METRICS" with decorative lines and connection status
- Below heatmap: System data readout line (uptime, last sync, data integrity %)

---

## Implementation Order
1. Task 3 (avatar fix) — smallest, isolated
2. Task 1 (WelcomeCard HUD panel) — self-contained
3. Task 4 (AIEye improvements) — complex but isolated to one component
4. Task 5 (chat animation) — small change in same file
5. Task 6 (dashboard spaces) — layout additions
6. Task 2 (avatar swap) — requires coordination between components

## Status: [ ] Not started
