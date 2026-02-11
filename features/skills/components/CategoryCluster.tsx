'use client';

/**
 * CategoryCluster Component
 *
 * Hexagon arrangement for category skills in the galaxy visualization.
 * Displays skills in a cluster formation with category-colored glow effect.
 */

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserSkillWithDetails, SkillCategory } from '../types/skill';
import { SkillHexagonNode } from './SkillHexagonNode';
import { getCategoryColor, type CategorySlug } from '../constants/categories';

/**
 * Props for CategoryCluster
 */
interface CategoryClusterProps {
  /** The category for this cluster */
  category: SkillCategory;
  /** Skills belonging to this category */
  skills: UserSkillWithDetails[];
  /** Position of the cluster center */
  position: { x: number; y: number };
  /** Whether the cluster is in expanded view */
  isExpanded?: boolean;
  /** Callback when a skill is clicked */
  onSkillClick?: (skill: UserSkillWithDetails) => void;
  /** Callback when an empty slot is clicked */
  onEmptyClick?: (categoryId: string) => void;
  /** Current zoom level */
  zoomLevel?: number;
  /** Custom className */
  className?: string;
}

/**
 * Calculate hexagon positions in a cluster formation
 * Core skill at center, others arranged in concentric rings
 * Spacing is dynamic based on zoom level for smooth transitions
 */
function calculateHexagonPositions(
  skillCount: number,
  zoomLevel: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];

  // Dynamic spacing based on zoom level
  // At zoom 0.7: spacing = 45 (compact)
  // At zoom 1.0: spacing = 60 (normal)
  // At zoom 1.5+: spacing = 75 (spread out)
  const minSpacing = 45;
  const maxSpacing = 75;
  const normalizedZoom = Math.max(0.7, Math.min(1.5, zoomLevel));
  const spacing = minSpacing + ((normalizedZoom - 0.7) / 0.8) * (maxSpacing - minSpacing);

  // Center position
  positions.push({ x: 0, y: 0 });

  // Always generate first ring (6 positions) for skills + empty slot
  const ring1Angles = [0, 60, 120, 180, 240, 300];
  for (let i = 0; i < 6; i++) {
    const angle = (ring1Angles[i] * Math.PI) / 180;
    positions.push({
      x: Math.cos(angle) * spacing,
      y: Math.sin(angle) * spacing,
    });
  }

  // Second ring if needed (12 positions)
  if (skillCount >= 7) {
    const ring2Radius = spacing * 1.9;
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 30 + 15) * Math.PI) / 180;
      positions.push({
        x: Math.cos(angle) * ring2Radius,
        y: Math.sin(angle) * ring2Radius,
      });
    }
  }

  return positions;
}

/**
 * CategoryCluster renders a group of skill hexagons for a category
 */
function CategoryClusterComponent({
  category,
  skills,
  position,
  isExpanded = false,
  onSkillClick,
  onEmptyClick,
  zoomLevel = 1,
  className,
}: CategoryClusterProps) {
  // Get category color
  const categoryColor = getCategoryColor(category.slug as CategorySlug) ?? category.color;

  // Calculate positions for skills - dynamic based on zoom level
  const hexPositions = useMemo(
    () => calculateHexagonPositions(Math.max(skills.length, 1), zoomLevel),
    [skills.length, zoomLevel]
  );

  // Sort skills by XP (highest first), core skills first
  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => {
      // Core skills first
      if (a.skill?.isCore && !b.skill?.isCore) return -1;
      if (!a.skill?.isCore && b.skill?.isCore) return 1;
      // Then by XP
      return (b.totalXP ?? 0) - (a.totalXP ?? 0);
    });
  }, [skills]);

  // Determine if we show collapsed cluster or individual nodes
  // Collapsed: zoom < 0.7 AND not specifically expanded
  const showCollapsed = zoomLevel < 0.7 && !isExpanded;

  // Animation variants - simplified for reliability
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      className={cn('absolute', className)}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Category glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          width: isExpanded ? 300 : 150,
          height: isExpanded ? 300 : 150,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${categoryColor} 0%, transparent 70%)`,
        }}
      />

      <AnimatePresence mode="wait">
        {/* Collapsed cluster view */}
        {showCollapsed ? (
          <motion.button
            key="collapsed"
            type="button"
            className="relative flex flex-col items-center justify-center cursor-pointer"
            onClick={() => onSkillClick?.(sortedSkills[0])}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`${category.name} cluster with ${skills.length} skills`}
          >
            {/* Cluster hexagon */}
            <svg
              viewBox="0 0 80 92"
              className="w-20 h-24"
              style={{
                filter: `drop-shadow(0 0 12px ${categoryColor})`,
              }}
            >
              <path
                d="M40 4 L76 24 L76 68 L40 88 L4 68 L4 24 Z"
                fill={categoryColor}
                fillOpacity={0.3}
                stroke={categoryColor}
                strokeWidth={2}
              />
            </svg>

            {/* Skill count */}
            <span
              className="absolute text-lg font-bold text-white"
              style={{ textShadow: `0 0 10px ${categoryColor}` }}
            >
              {skills.length}
            </span>

            {/* Category name */}
            <span
              className="mt-2 text-xs font-medium text-white/80 whitespace-nowrap"
              style={{ textShadow: `0 0 10px ${categoryColor}` }}
            >
              {category.name}
            </span>
          </motion.button>
        ) : (
          /* Expanded view with individual nodes */
          <motion.div
            key="expanded"
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Category label */}
            <div
              className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span
                className="text-sm font-semibold px-3 py-1 rounded-full bg-[#0D1421]/80 border"
                style={{
                  color: categoryColor,
                  borderColor: `${categoryColor}40`,
                  textShadow: `0 0 10px ${categoryColor}`,
                }}
              >
                {category.name}
              </span>
            </div>

            {/* Skill nodes */}
            {sortedSkills.map((skill, index) => {
              const pos = hexPositions[index] ?? hexPositions[0];

              return (
                <motion.div
                  key={skill.id}
                  className="absolute"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <SkillHexagonNode
                    userSkill={skill}
                    categoryColor={categoryColor}
                    onClick={() => onSkillClick?.(skill)}
                  />
                </motion.div>
              );
            })}

            {/* Empty slot for adding new skill (only show if few skills) */}
            {skills.length < 7 && (
              <motion.div
                className="absolute"
                style={{
                  left: hexPositions[skills.length]?.x ?? hexPositions[1]?.x ?? 65,
                  top: hexPositions[skills.length]?.y ?? hexPositions[1]?.y ?? 0,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: skills.length * 0.03 }}
              >
                <SkillHexagonNode
                  isEmpty
                  suggestedSkillName="Add skill"
                  categoryColor={categoryColor}
                  onClick={() => onEmptyClick?.(category.id)}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const CategoryCluster = memo(CategoryClusterComponent);
