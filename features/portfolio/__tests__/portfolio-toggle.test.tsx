/**
 * Portfolio Mode Toggle Tests
 *
 * Tests for the PortfolioModeToggle client component:
 * - Renders correct icon for current mode (briefcase for professional, gamepad for gaming)
 * - Clicking the toggle calls togglePortfolioMode server action
 * - Shows loading state during transition
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the server action
const mockTogglePortfolioMode = vi.fn();
vi.mock('../actions/togglePortfolioMode', () => ({
  togglePortfolioMode: (...args: any[]) => mockTogglePortfolioMode(...args),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// =============================================================================
// Tests
// =============================================================================

describe('PortfolioModeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTogglePortfolioMode.mockResolvedValue({
      hasError: false,
      message: 'Portfolio mode updated successfully',
      payload: {},
    });
  });

  it('renders briefcase icon for classic mode and tech icon for tech mode', async () => {
    const { PortfolioModeToggle } = await import(
      '../components/PortfolioModeToggle'
    );

    // Render with classic mode
    const { unmount } = render(
      <PortfolioModeToggle currentMode="classic" />
    );

    expect(screen.getByTestId('icon-briefcase')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-terminal')).not.toBeInTheDocument();

    unmount();

    // Render with tech mode
    render(<PortfolioModeToggle currentMode="tech" />);

    expect(screen.getByTestId('icon-terminal')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-briefcase')).not.toBeInTheDocument();
  });

  it('calls togglePortfolioMode server action with opposite mode when clicked', async () => {
    const { PortfolioModeToggle } = await import(
      '../components/PortfolioModeToggle'
    );

    render(<PortfolioModeToggle currentMode="classic" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockTogglePortfolioMode).toHaveBeenCalledWith({
        mode: 'tech',
      });
    });
  });

  it('shows loading state during transition', async () => {
    // Make the action hang to capture loading state
    mockTogglePortfolioMode.mockReturnValue(new Promise(() => {}));

    const { PortfolioModeToggle } = await import(
      '../components/PortfolioModeToggle'
    );

    render(<PortfolioModeToggle currentMode="classic" />);

    // Before click: should show briefcase icon
    expect(screen.getByTestId('icon-briefcase')).toBeInTheDocument();

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // During transition: should show loading spinner
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    // Button should be disabled during loading
    expect(button).toBeDisabled();
  });
});
