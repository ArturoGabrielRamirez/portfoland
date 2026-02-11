/**
 * ProjectDetailModal Tests (TG7)
 *
 * Tests for the project detail modal component
 * in both professional and gaming modes.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'ui.technologies': 'Technologies',
      'ui.links': 'Links',
      'ui.status': 'Status',
      'ui.dates': 'Dates',
      'ui.featured': 'Featured',
      'ui.closeModal': 'Close',
      'ui.statusLabels.IN_PROGRESS': 'In Progress',
      'ui.statusLabels.COMPLETED': 'Completed',
      'ui.statusLabels.ARCHIVED': 'Archived',
      'ui.linkTypes.LIVE': 'Live Site',
      'ui.linkTypes.REPO': 'Repository',
      'ui.linkTypes.DOCS': 'Documentation',
      'ui.linkTypes.VIDEO': 'Video',
      'ui.linkTypes.CASE_STUDY': 'Case Study',
      'ui.linkTypes.OTHER': 'Link',
    };
    return translations[key] ?? key;
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// Mock framer-motion with AnimatePresence tracking
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animate-presence">{children}</div>
  ),
  motion: {
    div: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: any;
    }) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock radix-ui Dialog primitives for professional mode
vi.mock('radix-ui', () => {
  const Root = ({ children, open, onOpenChange, ...props }: any) =>
    open ? (
      <div data-slot="dialog" data-state="open" {...props}>
        {children}
      </div>
    ) : null;
  const Portal = ({ children }: any) => <>{children}</>;
  const Overlay = ({ className, ...props }: any) => (
    <div data-slot="dialog-overlay" className={className} {...props} />
  );
  const Content = ({ children, className, ...props }: any) => (
    <div data-slot="dialog-content" className={className} {...props}>
      {children}
    </div>
  );
  const Close = ({ children, ...props }: any) => (
    <button data-slot="dialog-close" {...props}>
      {children}
    </button>
  );
  const Title = ({ children, className, ...props }: any) => (
    <h2 data-slot="dialog-title" className={className} {...props}>
      {children}
    </h2>
  );
  const Description = ({ children, className, ...props }: any) => (
    <p data-slot="dialog-description" className={className} {...props}>
      {children}
    </p>
  );
  const Trigger = ({ children, ...props }: any) => (
    <button data-slot="dialog-trigger" {...props}>
      {children}
    </button>
  );

  return {
    Dialog: {
      Root,
      Portal,
      Overlay,
      Content,
      Close,
      Title,
      Description,
      Trigger,
    },
  };
});

// =============================================================================
// Test Data
// =============================================================================

const mockProject = {
  id: 'proj-1',
  userId: 'user-1',
  title: 'Awesome Project',
  slug: 'awesome-project',
  description:
    'This is a full detailed description of the awesome project that includes all the relevant information.',
  shortDescription: 'Short desc',
  imageUrl: 'https://example.com/image.jpg',
  technologies: ['React', 'TypeScript', 'Node.js'],
  links: [
    { type: 'LIVE', label: 'Live Demo', url: 'https://example.com' },
    { type: 'REPO', label: 'GitHub Repo', url: 'https://github.com/example' },
    {
      type: 'DOCS',
      label: 'API Docs',
      url: 'https://docs.example.com',
    },
  ],
  featured: true,
  status: 'COMPLETED',
  startDate: new Date('2023-01-01'),
  endDate: new Date('2023-12-01'),
  order: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// =============================================================================
// Tests
// =============================================================================

describe('ProjectDetailModal (TG7)', () => {
  it('renders project title, full description, and all technology badges when open', async () => {
    const { ProjectDetailModal } = await import(
      '../components/ProjectDetailModal'
    );

    render(
      <ProjectDetailModal
        project={mockProject as any}
        mode="professional"
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Title
    expect(screen.getByText('Awesome Project')).toBeInTheDocument();

    // Full description (not the short one)
    expect(
      screen.getByText(
        'This is a full detailed description of the awesome project that includes all the relevant information.'
      )
    ).toBeInTheDocument();

    // Technology badges
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('renders all project links as labeled buttons/anchors', async () => {
    const { ProjectDetailModal } = await import(
      '../components/ProjectDetailModal'
    );

    render(
      <ProjectDetailModal
        project={mockProject as any}
        mode="professional"
        isOpen={true}
        onClose={() => {}}
      />
    );

    // All link labels should be visible
    expect(screen.getByText('Live Demo')).toBeInTheDocument();
    expect(screen.getByText('GitHub Repo')).toBeInTheDocument();
    expect(screen.getByText('API Docs')).toBeInTheDocument();
  });

  it('calls onClose callback when close action is triggered', async () => {
    const { ProjectDetailModal } = await import(
      '../components/ProjectDetailModal'
    );
    const onClose = vi.fn();

    render(
      <ProjectDetailModal
        project={mockProject as any}
        mode="gaming"
        isOpen={true}
        onClose={onClose}
      />
    );

    // Gaming mode has a close button rendered by the component
    const closeButton = screen.getByTestId('modal-close-button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses AnimatePresence for open/close animation', async () => {
    const { ProjectDetailModal } = await import(
      '../components/ProjectDetailModal'
    );

    render(
      <ProjectDetailModal
        project={mockProject as any}
        mode="gaming"
        isOpen={true}
        onClose={() => {}}
      />
    );

    // AnimatePresence wrapper should be present
    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();

    // motion.div should be present for animated content
    expect(screen.getAllByTestId('motion-div').length).toBeGreaterThan(0);
  });
});
