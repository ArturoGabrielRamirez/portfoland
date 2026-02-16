# Toast Border Effects - Ideas & Evolution

## Current Implementation (v1)
- ✅ Pulsing border around viewport
- ✅ Hexagonal corner indicators (4 corners)
- ✅ Scanline flash effect
- ✅ Color-coded by toast type
- ✅ Custom hook `useCyberpunkToast()`

## Current Implementation (v2) - ACTIVE
- ✅ Pulsing border around viewport
- ✅ Single status indicator (top-right corner)
- ✅ Three states: idle (dim) → loading (blinking) → active (colored)
- ✅ Hexagon with ring design
- ✅ Color-coded by toast type

## Status Indicator Design Options

### Option 1: Hexagon with Ring (IMPLEMENTED)
```
   ╱───╲
  ╱  ●  ╲  ← Central dot that blinks during loading
  ╲     ╱  ← Hexagonal ring that lights up on completion
   ╲───╱
```
- Most consistent with app's hexagonal theme
- Simple and non-invasive
- Ring can rotate/pulse for loading state
- Central dot can blink/pulse

### Option 2: Tech Circle with Segments
```
   ╱─────╲
  │ ● ─── │  ← Segments that fill progressively
   ╲─────╱
```
- Progress indication through segment filling
- More tech/industrial feel
- Could show loading percentage

### Option 3: Mini CRT Screen Indicator
```
┌─────┐
│░▓▓░░│ ← Mini screen with scanlines
└─────┘
```
- Matches CRT toast aesthetic
- Could show mini status text
- More detailed but potentially distracting

### Option 4: Corner Hexagon Cluster (Original v1)
- 4 hexagons in all corners
- Synced animations
- More visual presence
- Rejected: too invasive

## Section-Specific Effects (Future)

### Component Wrapper Approach
```tsx
<CyberpunkSection onError onSuccess>
  <LoginForm />
</CyberpunkSection>
```
- Wraps individual components/sections
- Local effects instead of global
- Better error localization
- Each section can have its own indicator

### Auto-Detection
- Detect error boundaries
- Trigger effects on caught errors
- Form validation integration
- Server action response handling

## Future Enhancements

### Corner Effects
- [ ] Animated hexagon trails (multiple hexagons cascading from corners)
- [ ] Corner "data burst" particles
- [ ] Rotating hexagon patterns in corners
- [ ] Corner hex grid that expands/contracts

### Screen Effects
- [ ] Subtle screen shake for errors (very brief, like 200ms)
- [ ] Glitch effect (RGB split) for critical errors
- [ ] CRT screen distortion wave
- [ ] Matrix-style code rain in background for success
- [ ] Static noise overlay for warnings

### Border Variations
- [ ] Animated dashed border (chasing dashes)
- [ ] Gradient border that rotates
- [ ] Multiple border layers with different speeds
- [ ] Border segments that light up sequentially

### Particle Systems
- [ ] Particles flowing from toast to corners
- [ ] Explosion effect from corners on critical events
- [ ] Floating hexagon particles in background
- [ ] Data stream particles along edges

### Sound Effects (Optional)
- [ ] Subtle beep/blip sounds for different toast types
- [ ] Cyberpunk UI sounds (optional, user preference)

### Performance Optimizations
- [ ] Use CSS transforms for better performance
- [ ] Reduce repaints with will-change
- [ ] Throttle/debounce for rapid toast events
- [ ] Web Workers for particle calculations

### Integration Ideas
- [ ] Trigger effects from server actions automatically
- [ ] Connect to form validation errors
- [ ] Dashboard stat change animations
- [ ] Achievement unlock celebrations
- [ ] Skill tree node activation effects

## Implementation Priority
1. Screen shake for errors (subtle, high impact)
2. Particle systems (visual appeal)
3. Enhanced corner animations (polish)
4. Sound effects (optional feature)
