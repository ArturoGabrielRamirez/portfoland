'use client';

/**
 * GalaxyCanvas Component
 *
 * Container for the full galaxy visualization.
 * Renders CategoryClusters in orbital positions with pan/drag navigation.
 */

import { memo, useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserSkillWithDetails, SkillCategory, SkillsByCategory } from '../types/skill';
import { StarfieldBackground } from './StarfieldBackground';
import { CategoryCluster } from './CategoryCluster';
import { SkillConnections } from './SkillConnections';
import { ZoomControls } from './ZoomControls';
import { getCategoryColor, type CategorySlug } from '../constants/categories';

/**
 * Props for GalaxyCanvas
 */
interface GalaxyCanvasProps {
  /** User's skills with details */
  userSkills: UserSkillWithDetails[];
  /** Available categories */
  categories: SkillCategory[];
  /** Callback when a skill is clicked */
  onSkillClick?: (skill: UserSkillWithDetails) => void;
  /** Callback when add skill is triggered */
  onAddSkill?: (categoryId?: string) => void;
  /** Custom className */
  className?: string;
}

/**
 * Group skills by category
 */
function groupSkillsByCategory(
  userSkills: UserSkillWithDetails[],
  categories: SkillCategory[]
): SkillsByCategory[] {
  const grouped: Map<string, SkillsByCategory> = new Map();

  // Initialize groups for all categories
  for (const category of categories) {
    grouped.set(category.id, {
      category,
      skills: [],
      totalXP: 0,
    });
  }

  // Group skills
  for (const skill of userSkills) {
    const categoryId = skill.skill?.categoryId;
    if (categoryId) {
      const group = grouped.get(categoryId);
      if (group) {
        group.skills.push(skill);
        group.totalXP += skill.totalXP ?? 0;
      }
    }
  }

  // Return groups sorted by total XP, core first
  return Array.from(grouped.values())
    .filter((group) => group.skills.length > 0 || group.category.slug === 'core')
    .sort((a, b) => {
      // Core category first
      if (a.category.slug === 'core') return -1;
      if (b.category.slug === 'core') return 1;
      // Then by skill count
      return b.skills.length - a.skills.length;
    });
}

/**
 * Calculate orbital positions for category clusters
 */
function calculateClusterPositions(
  categories: SkillsByCategory[],
  containerWidth: number,
  containerHeight: number
): Map<string, { x: number; y: number }> {
  const positions: Map<string, { x: number; y: number }> = new Map();

  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  // Core category at center
  const coreCategory = categories.find((c) => c.category.slug === 'core');
  if (coreCategory) {
    positions.set(coreCategory.category.id, { x: centerX, y: centerY });
  }

  // Other categories in orbital positions
  const orbitCategories = categories.filter((c) => c.category.slug !== 'core');
  const orbitRadius = Math.min(containerWidth, containerHeight) * 0.35;

  orbitCategories.forEach((cat, index) => {
    const angle = ((index * 360) / orbitCategories.length - 90) * (Math.PI / 180);
    positions.set(cat.category.id, {
      x: centerX + Math.cos(angle) * orbitRadius,
      y: centerY + Math.sin(angle) * orbitRadius,
    });
  });

  return positions;
}

/**
 * GalaxyCanvas renders the full skill tree galaxy visualization
 */
function GalaxyCanvasComponent({
  userSkills,
  categories,
  onSkillClick,
  onAddSkill,
  className,
}: GalaxyCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Zoom limits
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.1;

  // Group skills by category
  const groupedSkills = useMemo(
    () => groupSkillsByCategory(userSkills, categories),
    [userSkills, categories]
  );

  // Calculate cluster positions
  const clusterPositions = useMemo(
    () => calculateClusterPositions(groupedSkills, containerSize.width, containerSize.height),
    [groupedSkills, containerSize.width, containerSize.height]
  );

  // Measure container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Constrain pan to keep content visible
  const constrainPan = useCallback(
    (newPan: { x: number; y: number }) => {
      const maxPan = containerSize.width * zoomLevel * 0.5;
      return {
        x: Math.max(-maxPan, Math.min(maxPan, newPan.x)),
        y: Math.max(-maxPan, Math.min(maxPan, newPan.y)),
      };
    },
    [containerSize.width, zoomLevel]
  );

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
    // Constrain pan when zooming out
    setPan((currentPan) => constrainPan(currentPan));
  }, [constrainPan]);

  const handleFitAll = useCallback(() => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setSelectedCategory(null);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoomLevel((prev) => {
      const newZoom = Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM);
      return newZoom;
    });
    // Constrain pan after zoom
    setPan((currentPan) => constrainPan(currentPan));
  }, [constrainPan]);

  // Handle pan start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  // Handle pan move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const newPan = {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        };
        setPan(constrainPan(newPan));
      }
    },
    [isPanning, panStart, constrainPan]
  );

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  }, [pan]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isPanning && e.touches.length === 1) {
        const touch = e.touches[0];
        const newPan = {
          x: touch.clientX - panStart.x,
          y: touch.clientY - panStart.y,
        };
        setPan(constrainPan(newPan));
      }
    },
    [isPanning, panStart, constrainPan]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle skill click
  const handleSkillClick = useCallback(
    (skill: UserSkillWithDetails) => {
      onSkillClick?.(skill);
    },
    [onSkillClick]
  );

  // Handle empty slot click
  const handleEmptyClick = useCallback(
    (categoryId: string) => {
      onAddSkill?.(categoryId);
    },
    [onAddSkill]
  );

  // Generate connections between related skills (placeholder for now)
  const connections: Array<{
    id: string;
    fromSkillId: string;
    toSkillId: string;
    type: 'direct' | 'suggested';
  }> = [];

  // Build skill positions map for connections
  const skillPositions = new Map<string, { x: number; y: number }>();

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full',
        'cursor-grab active:cursor-grabbing',
        className
      )}
      role="region"
      aria-label="Galaxy skill tree visualization"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overflow: 'hidden' }}
    >
      {/* Starfield Background */}
      <StarfieldBackground />

      {/* Transformed container for zoom/pan */}
      <div
        className="absolute w-full h-full"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
          transformOrigin: `${containerSize.width / 2}px ${containerSize.height / 2}px`,
          transition: isPanning ? 'none' : 'transform 0.15s ease-out',
          willChange: 'transform',
        }}
      >
        {/* Skill Connections */}
        <SkillConnections
          connections={connections}
          positions={skillPositions}
        />

        {/* Category Clusters */}
        {groupedSkills.map((group) => {
          const position = clusterPositions.get(group.category.id);
          if (!position) return null;

          return (
            <CategoryCluster
              key={`${group.category.id}-${zoomLevel < 0.7 ? 'collapsed' : 'expanded'}`}
              category={group.category}
              skills={group.skills}
              position={position}
              isExpanded={selectedCategory === group.category.id || zoomLevel >= 0.7}
              onSkillClick={handleSkillClick}
              onEmptyClick={handleEmptyClick}
              zoomLevel={zoomLevel}
            />
          );
        })}
      </div>

      {/* Zoom Controls */}
      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitAll={handleFitAll}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        className="absolute bottom-4 right-4"
      />

      {/* Add Skill Button (Desktop) */}
      {userSkills.length > 0 && onAddSkill && (
        <motion.button
          type="button"
          onClick={() => onAddSkill()}
          className={cn(
            'absolute bottom-4 right-20 z-10',
            'w-12 h-12 rounded-full',
            'flex items-center justify-center',
            'bg-[#00D4FF] text-[#0A0E1A]',
            'shadow-lg shadow-[#00D4FF]/30',
            'hover:bg-[#00D4FF]/90 hover:shadow-[#00D4FF]/50 hover:shadow-xl',
            'focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 focus:ring-offset-[#0A0E1A]',
            'transition-all duration-200'
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label="Add skill"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      )}

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-lg bg-[#0D1421]/90 border border-[#1E293B] backdrop-blur-sm">
          <span className="text-sm text-[#64748B]">Skills: </span>
          <span className="text-sm font-medium text-white">{userSkills.length}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-[#0D1421]/90 border border-[#1E293B] backdrop-blur-sm">
          <span className="text-sm text-[#64748B]">Total XP: </span>
          <span className="text-sm font-medium text-[#EAB308]">
            {userSkills.reduce((sum, s) => sum + (s.totalXP ?? 0), 0).toLocaleString()}
          </span>
        </div>
        {userSkills.length > 0 && onAddSkill && (
          <motion.button
            type="button"
            onClick={() => onAddSkill()}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium text-sm',
              'bg-[#00D4FF] text-[#0A0E1A]',
              'hover:bg-[#00D4FF]/90',
              'shadow-[0_0_10px_rgba(0,212,255,0.2)]',
              'transition-all duration-200'
            )}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add Skill
          </motion.button>
        )}
      </div>

      {/* Empty state */}
      {userSkills.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="text-center p-8 rounded-xl bg-[#0D1421]/90 border border-[#1E293B] backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Your Galaxy Awaits
            </h3>
            <p className="text-[#64748B] mb-4 max-w-md">
              Add experiences to your timeline or manually add skills to start
              building your skill constellation.
            </p>
            <button
              type="button"
              onClick={() => onAddSkill?.()}
              className={cn(
                'px-4 py-2 rounded-lg font-medium',
                'bg-[#00D4FF] text-[#0A0E1A]',
                'hover:bg-[#00D4FF]/90',
                'shadow-[0_0_15px_rgba(0,212,255,0.3)]',
                'transition-all duration-200'
              )}
            >
              Add Your First Skill
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export const GalaxyCanvas = memo(GalaxyCanvasComponent);
