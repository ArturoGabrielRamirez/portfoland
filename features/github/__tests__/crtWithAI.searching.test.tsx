/**
 * CRTWithAI — `searching` state tests (TG6)
 *
 * Test 1: When the `searchingTrigger` prop changes (incremented), the component
 *         enters the `"searching"` AIState, rendering STATUS: SEARCHING in the header.
 *
 * Test 2: `"searching"` does NOT auto-return — the state persists after 2500ms
 *         (beyond xp_gain's 1200ms and life_loss's 2000ms auto-return windows)
 *         without an external exit signal from the parent.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'

// =============================================================================
// Mocks
// =============================================================================

// Stub framer-motion — motion components render as plain divs/SVG elements
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, key: string) =>
        // eslint-disable-next-line react/display-name
        React.forwardRef(({ children, animate, transition, initial, exit, ...rest }: any, ref: any) =>
          React.createElement(key as string, { ref, ...rest }, children)
        ),
    }
  ),
  AnimatePresence: ({ children }: any) => children,
}))

// Stub localStorage (jsdom provides it, but ensure it's clean per test)
beforeEach(() => {
  localStorage.clear()
})

// =============================================================================
// Import component (must come after vi.mock declarations)
// =============================================================================

import { CRTWithAI } from '../../tech/components/crt-with-ai'

// =============================================================================
// Tests
// =============================================================================

describe('CRTWithAI — searching state (TG6)', () => {
  it('enters "searching" state when searchingTrigger prop is incremented', async () => {
    const { rerender } = render(
      <CRTWithAI
        userName="Test"
        searchingTrigger={0}
      />
    )

    // Initially the component is "sleeping"
    expect(screen.queryByText(/STATUS: SEARCHING/i)).toBeNull()

    // Increment the trigger to fire the searching state
    await act(async () => {
      rerender(
        <CRTWithAI
          userName="Test"
          searchingTrigger={1}
        />
      )
    })

    // The header STATUS label should now display "SEARCHING"
    expect(screen.getByText(/STATUS: SEARCHING/i)).toBeTruthy()
  })

  it('"searching" does not auto-return — state persists beyond xp_gain (1200ms) and life_loss (2000ms) windows', async () => {
    vi.useFakeTimers()

    const { rerender } = render(
      <CRTWithAI
        userName="Test"
        searchingTrigger={0}
      />
    )

    // Trigger searching state
    await act(async () => {
      rerender(
        <CRTWithAI
          userName="Test"
          searchingTrigger={1}
        />
      )
    })

    expect(screen.getByText(/STATUS: SEARCHING/i)).toBeTruthy()

    // Advance time to just past life_loss's 2000ms auto-return window
    // but short of the 5000ms inactivity timer that could also change state
    await act(async () => {
      vi.advanceTimersByTime(2200)
    })

    // State must still be "searching" — no internal timer should have returned it.
    // (xp_gain auto-returns at 1200ms, life_loss at 2000ms — neither applies to "searching")
    expect(screen.getByText(/STATUS: SEARCHING/i)).toBeTruthy()

    vi.useRealTimers()
  })
})
