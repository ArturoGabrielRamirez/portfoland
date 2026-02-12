'use client';

/**
 * CRTSkillCanvas - Cyberpunk skill tree with CRT aesthetic
 *
 * Features:
 * - Hexagonal skill nodes color-coded by category
 * - Light beam connectors between skills
 * - Category labels and grouping
 * - Zoom and pan controls
 * - Space/CRT background aesthetic
 */

import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserSkillWithDetails, SkillCategory } from '../types/skill';

interface CRTSkillCanvasProps {
  userSkills: UserSkillWithDetails[];
  categories: SkillCategory[];
  onSkillClick?: (skill: UserSkillWithDetails, position?: { x: number; y: number; color?: string }) => void;
  onAddSkill?: (categoryId?: string) => void;
  className?: string;
}

interface SkillNode {
  id: string;
  skill: UserSkillWithDetails;
  x: number;
  y: number;
  category: SkillCategory;
  color: string;
}

interface CategoryGroup {
  category: SkillCategory;
  skills: UserSkillWithDetails[];
  color: string;
}

// Category colors matching cyberpunk palette
const categoryColors: Record<string, string> = {
  'core': 'hsl(330,100%,65%)', // Magenta
  'fundamentals': 'hsl(330,100%,65%)', // Magenta
  'backend': 'hsl(150,100%,45%)', // Green
  'frontend': 'hsl(174,100%,50%)', // Cyan
  'tools': 'hsl(60,100%,50%)', // Yellow
  'soft-skills': 'hsl(280,100%,70%)', // Purple
  'default': 'hsl(174,100%,50%)', // Cyan
};

function getCategoryColor(slug: string): string {
  return categoryColors[slug.toLowerCase()] || categoryColors.default;
}

// Generate positions in a circular/clustered layout
function generateNodePositions(
  groups: CategoryGroup[],
  width: number,
  height: number
): SkillNode[] {
  const nodes: SkillNode[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusBase = Math.min(width, height) * 0.3;

  groups.forEach((group, groupIndex) => {
    const angleStep = (Math.PI * 2) / groups.length;
    const groupAngle = angleStep * groupIndex - Math.PI / 2;
    const groupRadius = radiusBase + (groupIndex % 2) * 80;

    // Group center position
    const groupCenterX = centerX + Math.cos(groupAngle) * groupRadius;
    const groupCenterY = centerY + Math.sin(groupAngle) * groupRadius;

    // Arrange skills in a cluster around group center
    group.skills.forEach((skill, skillIndex) => {
      const skillCount = group.skills.length;
      const skillAngle = (Math.PI * 2 * skillIndex) / Math.max(skillCount, 1);
      const skillRadius = 60 + (skillCount > 3 ? 40 : 0);

      const x = groupCenterX + Math.cos(skillAngle) * skillRadius;
      const y = groupCenterY + Math.sin(skillAngle) * skillRadius;

      nodes.push({
        id: skill.id,
        skill,
        x,
        y,
        category: group.category,
        color: group.color,
      });
    });
  });

  return nodes;
}

function CRTSkillCanvasComponent({
  userSkills,
  categories,
  onSkillClick,
  onAddSkill,
  className,
}: CRTSkillCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Group skills by category
  const categoryGroups = useMemo(() => {
    const groups: CategoryGroup[] = [];
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

    // Group skills by category
    const skillsByCategory = new Map<string, UserSkillWithDetails[]>();
    userSkills.forEach(skill => {
      const catId = skill.skill?.categoryId;
      if (catId) {
        if (!skillsByCategory.has(catId)) {
          skillsByCategory.set(catId, []);
        }
        skillsByCategory.get(catId)!.push(skill);
      }
    });

    // Create groups
    skillsByCategory.forEach((skills, catId) => {
      const category = categoryMap.get(catId);
      if (category && skills.length > 0) {
        groups.push({
          category,
          skills,
          color: getCategoryColor(category.slug),
        });
      }
    });

    return groups;
  }, [userSkills, categories]);

  // Generate node positions
  const nodes = useMemo(() => {
    return generateNodePositions(categoryGroups, dimensions.width, dimensions.height);
  }, [categoryGroups, dimensions]);

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Handle pan/drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle skill click
  const handleNodeClick = useCallback((node: SkillNode) => {
    if (!isDragging && onSkillClick) {
      // Calculate absolute position considering zoom and pan
      const absoluteX = node.x * zoom + pan.x;
      const absoluteY = node.y * zoom + pan.y;
      onSkillClick(node.skill, { x: absoluteX, y: absoluteY });
    }
  }, [isDragging, onSkillClick, zoom, pan]);

  return (
    <div
      ref={canvasRef}
      className={cn(
        'relative w-full h-full rounded-sm border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,4%)] overflow-hidden',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* CRT effect overlay */}
      <div className="absolute inset-0 pointer-events-none crt-lines opacity-30" />
      <div className="crt-scanner" />

      {/* Hexagonal grid background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.15]">
        <defs>
          <pattern id="hex-grid" width="56" height="48.5" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
            {/* Row 1 hexagon */}
            <path d="M28 0 L56 14 L56 34 L28 48.5 L0 34 L0 14 Z" fill="none" stroke="hsl(174,100%,50%)" strokeWidth="1" />
            {/* Row 2 offset hexagon (shifted by half) */}
            <path d="M56 24.25 L84 38.25 L84 58.25 L56 72.75 L28 58.25 L28 38.25 Z" fill="none" stroke="hsl(174,100%,50%)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-grid)" />
      </svg>

      {/* Canvas content */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {/* Floating particles (decorative) */}
        <svg className="absolute inset-0 pointer-events-none opacity-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <circle
              key={i}
              cx={`${Math.random() * 100}%`}
              cy={`${Math.random() * 100}%`}
              r={Math.random() * 1.5 + 0.5}
              fill="hsl(174,100%,50%)"
            >
              <animate
                attributeName="opacity"
                values={`${0.1 + Math.random() * 0.3};${0.4 + Math.random() * 0.4};${0.1 + Math.random() * 0.3}`}
                dur={`${3 + Math.random() * 4}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>

        {/* Connection lines (light beams) */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={dimensions.width}
          height={dimensions.height}
        >
          <defs>
            <filter id="glow-beam">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-soft">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Draw connections between skills in same category */}
          {categoryGroups.map((group) => {
            const groupNodes = nodes.filter(n => n.category.id === group.category.id);
            const connections: Array<{from: typeof groupNodes[0], to: typeof groupNodes[0]}> = [];

            // Connect each skill to the next one in the category
            groupNodes.forEach((node, i) => {
              const nextIndex = (i + 1) % groupNodes.length;
              if (groupNodes.length > 1 && i < groupNodes.length - 1) {
                connections.push({ from: node, to: groupNodes[nextIndex] });
              }
            });

            return connections.map((conn) => {
              const key = `${conn.from.id}-${conn.to.id}`;
              const midX = (conn.from.x + conn.to.x) / 2;
              const midY = (conn.from.y + conn.to.y) / 2;
              const dx = conn.to.x - conn.from.x;
              const dy = conn.to.y - conn.from.y;

              const offsetX = -dy * 0.15;
              const offsetY = dx * 0.15;
              const controlX = midX + offsetX;
              const controlY = midY + offsetY;

              const pathData = `M ${conn.from.x} ${conn.from.y} Q ${controlX} ${controlY} ${conn.to.x} ${conn.to.y}`;

              return (
                <g key={key}>
                  {/* Persistent dim background trace */}
                  <path
                    d={pathData}
                    stroke={conn.from.color}
                    strokeWidth="1"
                    fill="none"
                    opacity="0.15"
                  />

                  {/* Main colored beam - solid with glow */}
                  <path
                    d={pathData}
                    stroke={conn.from.color}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow-soft)"
                    opacity="0.4"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.25;0.5;0.25"
                      dur={`${3 + Math.random() * 2}s`}
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Animated energy pulse along path */}
                  <path
                    d={pathData}
                    stroke={conn.from.color}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow-beam)"
                    strokeDasharray="8,40"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-48"
                      dur={`${2 + Math.random()}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0.9;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Particle flowing along path */}
                  <circle
                    r="2.5"
                    fill={conn.from.color}
                    opacity="0.8"
                    filter="url(#glow-beam)"
                  >
                    <animateMotion
                      dur={`${3 + Math.random() * 2}s`}
                      repeatCount="indefinite"
                      path={pathData}
                    />
                  </circle>
                </g>
              );
            });
          })}
        </svg>

        {/* Skill nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute group"
            style={{
              left: node.x,
              top: node.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Hexagon node */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                if (onSkillClick) {
                  onSkillClick(node.skill, { x: centerX, y: centerY, color: node.color });
                }
              }}
              className="relative flex flex-col items-center justify-center w-16 h-16 transition-all duration-200 hover:scale-110 cursor-pointer z-10"
              style={{ color: node.color }}
            >
              {/* Hexagon SVG */}
              <svg width="64" height="64" viewBox="0 0 100 100" className="absolute">
                <path
                  d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
                  fill="hsl(200,30%,8%)"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="group-hover:fill-[hsl(200,30%,12%)] transition-colors"
                />
              </svg>

              {/* Skill initial */}
              <span className="relative text-sm font-mono font-bold z-10">
                {node.skill.skill?.name?.charAt(0) || '?'}
              </span>

              {/* Mini level badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[hsl(200,30%,8%)] border border-current flex items-center justify-center z-20">
                <span className="text-[7px] font-mono font-bold">{node.skill.level}</span>
              </div>

              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-lg"
                style={{
                  backgroundColor: node.color,
                  filter: 'blur(8px)',
                }}
              />
            </button>

            {/* Skill name tooltip */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
              <div className="bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.3)] px-2 py-1 rounded-sm">
                <p className="text-[10px] font-mono text-foreground">
                  {node.skill.skill?.name || 'Skill'}
                </p>
                <p className="text-[8px] font-mono text-muted-foreground">
                  Level {node.skill.level} • {node.skill.totalXP} XP
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Category labels */}
        {categoryGroups.map((group, index) => {
          const angleStep = (Math.PI * 2) / categoryGroups.length;
          const angle = angleStep * index - Math.PI / 2;
          const radius = Math.min(dimensions.width, dimensions.height) * 0.3 + (index % 2) * 80;
          const x = dimensions.width / 2 + Math.cos(angle) * radius;
          const y = dimensions.height / 2 + Math.sin(angle) * radius;

          return (
            <div
              key={group.category.id}
              className="absolute pointer-events-none"
              style={{
                left: x,
                top: y - 80,
                transform: 'translate(-50%, -50%)',
                color: group.color,
              }}
            >
              <div className="text-xs font-mono uppercase tracking-[0.3em] opacity-70">
                {group.category.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.3)] rounded-sm text-[hsl(174,100%,50%)] hover:bg-[hsl(200,30%,12%)] transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.3)] rounded-sm text-[hsl(174,100%,50%)] hover:bg-[hsl(200,30%,12%)] transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 bg-[hsl(200,30%,8%)] border border-[hsl(174,100%,50%,0.3)] rounded-sm text-[hsl(174,100%,50%)] hover:bg-[hsl(200,30%,12%)] transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Instructions */}
      {userSkills.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground font-mono mb-4">No skills yet</p>
            {onAddSkill && (
              <button
                onClick={() => onAddSkill()}
                className="bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)] px-4 py-2 text-sm font-mono font-bold hover:shadow-[0_0_12px_hsl(174_100%_50%_/_0.4)] transition-shadow"
              >
                Add Your First Skill
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const CRTSkillCanvas = memo(CRTSkillCanvasComponent);
