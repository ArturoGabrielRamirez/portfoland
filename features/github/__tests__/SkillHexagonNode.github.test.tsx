/**
 * SkillHexagonNode — GitHub dual-validation visual tests (TG7)
 *
 * Test 1: GitHub-only state — SVG filter contains green `#22C55E` drop-shadow.
 * Test 2: Dual-validated state — SVG filter contains gold `#FFD700` drop-shadow
 *         and the gold pulsing ring `motion.div` is present in the DOM.
 * Test 3: Dual-validated state — `aria-label` includes "AI & GitHub Verified".
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// =============================================================================
// Mocks
// =============================================================================

// Stub framer-motion — renders motion.* as plain HTML elements with all props forwarded
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, key: string) =>
        // eslint-disable-next-line react/display-name
        React.forwardRef(({ children, animate, transition, initial, exit, whileHover, whileTap, ...rest }: any, ref: any) =>
          React.createElement(key as string, { ref, ...rest }, children)
        ),
    }
  ),
  AnimatePresence: ({ children }: any) => children,
}))

// Stub lucide-react icons — return plain spans
vi.mock('lucide-react', () => ({
  HelpCircle: (props: any) => React.createElement('span', { 'data-testid': 'help-circle', ...props }),
  Crown: (props: any) => React.createElement('span', { 'data-testid': 'crown', ...props }),
  Sparkles: (props: any) => React.createElement('span', { 'data-testid': 'sparkles', ...props }),
}))

// =============================================================================
// Import component (must come after vi.mock declarations)
// =============================================================================

import { SkillHexagonNode } from '../../skills/components/SkillHexagonNode'

// =============================================================================
// Test helpers
// =============================================================================

/**
 * Minimal `UserSkillWithDetails`-compatible object for test use.
 * Only the fields read by SkillHexagonNode are needed.
 */
function makeUserSkill(overrides: {
  aiValidated?: boolean;
  githubValidated?: boolean;
  level?: number;
  id?: string;
  skillName?: string;
}) {
  const {
    aiValidated = false,
    githubValidated = false,
    level = 1,
    id = 'test-skill-id',
    skillName = 'TypeScript',
  } = overrides;

  return {
    id,
    level,
    aiValidated,
    githubValidated,
    totalXP: 100,
    userId: 'user-1',
    skillId: 'skill-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    skill: {
      id: 'skill-1',
      name: skillName,
      slug: skillName.toLowerCase(),
      categoryId: 'cat-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: 'cat-1',
        name: 'Frontend',
        color: '#00D4FF',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    sources: [],
  } as any;
}

// =============================================================================
// Tests
// =============================================================================

describe('SkillHexagonNode — GitHub dual-validation visuals (TG7)', () => {
  it('GitHub-only: SVG filter contains green #22C55E drop-shadow', () => {
    const userSkill = makeUserSkill({ githubValidated: true, aiValidated: false })

    render(
      <SkillHexagonNode
        userSkill={userSkill}
        categoryColor="#00D4FF"
      />
    )

    // The SVG element has the filter style applied via inline `style.filter`
    const svg = document.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg!.style.filter).toContain('drop-shadow(0 0 10px #22C55E)')
  })

  it('Dual-validated: SVG filter contains gold #FFD700 and gold pulsing ring is present', () => {
    const userSkill = makeUserSkill({ aiValidated: true, githubValidated: true })

    const { container } = render(
      <SkillHexagonNode
        userSkill={userSkill}
        categoryColor="#00D4FF"
      />
    )

    // Verify the gold drop-shadow is in the SVG filter.
    // SVG filter strings are not normalized by jsdom — the hex value is preserved.
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg!.style.filter).toContain('drop-shadow(0 0 12px #FFD700)')

    // Verify the gold pulsing ring div is rendered.
    // jsdom normalizes border hex colors to rgb() in computed style, so we use
    // style.borderColor which also gives rgb(). #FFD700 = rgb(255, 215, 0).
    const allDivs = container.querySelectorAll('div')
    const goldRingDiv = Array.from(allDivs).find((div) =>
      div.style.borderColor === 'rgb(255, 215, 0)'
    )
    expect(goldRingDiv).toBeTruthy()
  })

  it('Dual-validated: aria-label includes "AI & GitHub Verified"', () => {
    const userSkill = makeUserSkill({ aiValidated: true, githubValidated: true, skillName: 'React' })

    render(
      <SkillHexagonNode
        userSkill={userSkill}
        categoryColor="#00D4FF"
      />
    )

    // The motion.button stub forwards aria-label as-is to a plain <button>
    const button = screen.getByRole('button')
    expect(button).toBeTruthy()
    expect(button.getAttribute('aria-label')).toContain('AI & GitHub Verified')
  })
})
