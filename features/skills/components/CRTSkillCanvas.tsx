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
import { getCategoryColor, type CategorySlug } from '../constants/categories';

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

// Category colors are imported from constants/categories.ts

// Generate positions in a circular/clustered layout (chronologically ordered)
function generateNodePositions(
  groups: CategoryGroup[],
  width: number,
  height: number
): SkillNode[] {
  const nodes: SkillNode[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusBase = Math.min(width, height) * 0.3;

  // Get label position for angle calculation
  const getLabelPosition = (slug: string, groupIndex: number, height: number, width: number): { x: number; y: number } => {
    const positions: Record<string, { x: number; y: number }> = {
      'frontend': { x: 140, y: 50 },
      'backend': { x: 120, y: height - 50 },
      'soft-skills': { x: width - 140, y: height / 2 },
      'devops': { x: width - 120, y: height - 50 },
      'design': { x: width - 140, y: 50 },
      'core': { x: width / 2, y: 50 },
    };

    if (positions[slug]) {
      return positions[slug];
    }

    const angle = (Math.PI * 2 * groupIndex) / groups.length;
    const margin = 80;
    if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
      return {
        x: Math.cos(angle) > 0 ? width - margin : margin,
        y: height / 2 + Math.sin(angle) * (height / 3),
      };
    } else {
      return {
        x: width / 2 + Math.cos(angle) * (width / 3),
        y: Math.sin(angle) > 0 ? height - margin : margin,
      };
    }
  };

  groups.forEach((group, groupIndex) => {
    // Sort skills by creation date (oldest first)
    const sortedSkills = [...group.skills].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

    const angleStep = (Math.PI * 2) / groups.length;
    const groupAngle = angleStep * groupIndex - Math.PI / 2;
    const groupRadius = radiusBase + (groupIndex % 2) * 80;

    // Group center position
    const groupCenterX = centerX + Math.cos(groupAngle) * groupRadius;
    const groupCenterY = centerY + Math.sin(groupAngle) * groupRadius;

    // Get label position to determine starting angle
    const labelPos = getLabelPosition(group.category.slug, groupIndex, height, width);
    const labelToGroupAngle = Math.atan2(groupCenterY - labelPos.y, groupCenterX - labelPos.x);

    // Arrange skills in a circle, starting from the direction of the label
    sortedSkills.forEach((skill, skillIndex) => {
      const skillCount = sortedSkills.length;

      // Start the circle from the label direction, then go around
      // This puts the oldest skill (index 0) closest to the label
      const skillAngle = labelToGroupAngle + (Math.PI * 2 * skillIndex) / Math.max(skillCount, 1);
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
          color: getCategoryColor(category.slug as CategorySlug),
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
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]">
        <defs>
          <pattern id="hex-grid" width="60" height="52" patternUnits="userSpaceOnUse">
            {/* Top-left hex (clipped) */}
            <path d="M15 0 L30 0 L30 8.66 L15 17.32 L0 8.66 L0 0 Z" fill="none" stroke="hsl(174,100%,50%)" strokeWidth="0.6" />
            {/* Center hex */}
            <path d="M30 8.66 L45 17.32 L45 34.64 L30 43.3 L15 34.64 L15 17.32 Z" fill="none" stroke="hsl(174,100%,50%)" strokeWidth="0.6" />
            {/* Right-side hex (clipped) */}
            <path d="M45 0 L60 0 L60 8.66 L45 17.32 L30 8.66 L30 0 Z" fill="none" stroke="hsl(174,100%,50%)" strokeWidth="0.6" />
            {/* Bottom hex row offset */}
            <path d="M0 26 L15 17.32 L30 26 L30 43.3 L15 52 L0 43.3 Z" fill="none" stroke="hsl(174,100%,50%)" strokeWidth="0.6" />
            <path d="M45 34.64 L60 26 L60 43.3 L45 52 L30 43.3 L30 26 Z" fill="none" stroke="hsl(174,100%,50%)" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-grid)" />
      </svg>

      {/* Canvas content (zoomable/pannable) */}
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

      </div>

      {/* Category labels with connectors (fixed to viewport, not affected by zoom/pan) */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={dimensions.width}
        height={dimensions.height}
        style={{ zIndex: 5 }}
      >
        {categoryGroups.map((group, groupIndex) => {
          // Get all nodes for this category
          const groupNodes = nodes.filter(n => n.category.id === group.category.id);
          if (groupNodes.length === 0) return null;

          // Strategic label positioning
          const slug = group.category.slug;
          let labelX = 0;
          let labelY = 0;

          const positions: Record<string, { x: number; y: number }> = {
            'frontend': { x: 140, y: 50 },
            'backend': { x: 120, y: dimensions.height - 50 },
            'soft-skills': { x: dimensions.width - 140, y: dimensions.height / 2 },
            'devops': { x: dimensions.width - 120, y: dimensions.height - 50 },
            'design': { x: dimensions.width - 140, y: 50 },
            'core': { x: dimensions.width / 2, y: 50 },
          };

          if (positions[slug]) {
            labelX = positions[slug].x;
            labelY = positions[slug].y;
          } else {
            const angle = (Math.PI * 2 * groupIndex) / categoryGroups.length;
            const margin = 80;
            if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
              labelX = Math.cos(angle) > 0 ? dimensions.width - margin : margin;
              labelY = dimensions.height / 2 + Math.sin(angle) * (dimensions.height / 3);
            } else {
              labelX = dimensions.width / 2 + Math.cos(angle) * (dimensions.width / 3);
              labelY = Math.sin(angle) > 0 ? dimensions.height - margin : margin;
            }
          }

          // Find the closest node to the label position (in canvas coordinates, not screen)
          let targetNode = groupNodes[0];
          let minDistance = Infinity;
          groupNodes.forEach(node => {
            // Calculate distance in canvas space (before zoom/pan transform)
            const dist = Math.sqrt(Math.pow(node.x - labelX, 2) + Math.pow(node.y - labelY, 2));
            if (dist < minDistance) {
              minDistance = dist;
              targetNode = node;
            }
          });

          // Transform node position to screen coordinates
          const nodeScreenX = targetNode.x * zoom + pan.x;
          const nodeScreenY = targetNode.y * zoom + pan.y;

          // Calculate angle from label to node center
          const angleToNode = Math.atan2(nodeScreenY - labelY, nodeScreenX - labelX);

          // Hexagon dimensions (64x64, but we need to account for zoom)
          const hexRadius = 32 * zoom; // Half of 64

          // Calculate connection point on hexagon edge
          // Include both vertices and edge midpoints for better accuracy (12 points total)
          const hexPoints = [
            // Vertices
            { x: hexRadius * 0, y: -hexRadius },           // Top
            { x: hexRadius * 0.866, y: -hexRadius * 0.5 }, // Top-right
            { x: hexRadius * 0.866, y: hexRadius * 0.5 },  // Bottom-right
            { x: hexRadius * 0, y: hexRadius },            // Bottom
            { x: -hexRadius * 0.866, y: hexRadius * 0.5 }, // Bottom-left
            { x: -hexRadius * 0.866, y: -hexRadius * 0.5 },// Top-left
            // Edge midpoints for better connection accuracy
            { x: hexRadius * 0.433, y: -hexRadius * 0.75 }, // Top to Top-right
            { x: hexRadius * 0.866, y: 0 },                 // Top-right to Bottom-right
            { x: hexRadius * 0.433, y: hexRadius * 0.75 },  // Bottom-right to Bottom
            { x: -hexRadius * 0.433, y: hexRadius * 0.75 }, // Bottom to Bottom-left
            { x: -hexRadius * 0.866, y: 0 },                // Bottom-left to Top-left
            { x: -hexRadius * 0.433, y: -hexRadius * 0.75 },// Top-left to Top
          ];

          // Find the point that's most aligned with the incoming angle
          // We want the point that faces the label (opposite direction from label to node)
          let bestPoint = hexPoints[0];
          let bestDot = -Infinity;

          hexPoints.forEach(point => {
            // Calculate angle of this point relative to hexagon center
            const pointAngle = Math.atan2(point.y, point.x);
            // How well does this point align with the direction FROM label TO node?
            // We want the point on the side facing the label (opposite side)
            const dot = Math.cos(angleToNode - pointAngle - Math.PI);
            if (dot > bestDot) {
              bestDot = dot;
              bestPoint = point;
            }
          });

          // Final connection point on hexagon edge (external side)
          const hexConnectX = nodeScreenX + bestPoint.x;
          const hexConnectY = nodeScreenY + bestPoint.y;

          // Calculate curved path
          const midX = (labelX + hexConnectX) / 2;
          const midY = (labelY + hexConnectY) / 2;
          const dx = hexConnectX - labelX;
          const dy = hexConnectY - labelY;

          const offsetX = -dy * 0.15;
          const offsetY = dx * 0.15;
          const controlX = midX + offsetX;
          const controlY = midY + offsetY;

          const pathData = `M ${labelX} ${labelY + 15} Q ${controlX} ${controlY} ${hexConnectX} ${hexConnectY}`;

          return (
            <g key={`connector-${group.category.id}`}>
              {/* Persistent dim background trace */}
              <path
                d={pathData}
                stroke={group.color}
                strokeWidth="1"
                fill="none"
                opacity="0.15"
              />

              {/* Main colored beam - solid with glow */}
              <path
                d={pathData}
                stroke={group.color}
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
                stroke={group.color}
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
                fill={group.color}
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
        })}
      </svg>

      {/* Category labels (fixed to viewport) */}
      {categoryGroups.map((group, groupIndex) => {
        const slug = group.category.slug;
        let x = 0;
        let y = 0;

        // Same positioning logic as connectors
        const positions: Record<string, { x: number; y: number }> = {
          'frontend': { x: 140, y: 50 },
          'backend': { x: 120, y: dimensions.height - 50 },
          'soft-skills': { x: dimensions.width - 140, y: dimensions.height / 2 },
          'devops': { x: dimensions.width - 120, y: dimensions.height - 50 },
          'design': { x: dimensions.width - 140, y: 50 },
          'core': { x: dimensions.width / 2, y: 50 },
        };

        if (positions[slug]) {
          x = positions[slug].x;
          y = positions[slug].y;
        } else {
          const angle = (Math.PI * 2 * groupIndex) / categoryGroups.length;
          const margin = 80;
          if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
            x = Math.cos(angle) > 0 ? dimensions.width - margin : margin;
            y = dimensions.height / 2 + Math.sin(angle) * (dimensions.height / 3);
          } else {
            x = dimensions.width / 2 + Math.cos(angle) * (dimensions.width / 3);
            y = Math.sin(angle) > 0 ? dimensions.height - margin : margin;
          }
        }

        return (
          <div
            key={group.category.id}
            className="absolute pointer-events-none z-10"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              color: group.color,
            }}
          >
            <div className="text-xs font-mono uppercase tracking-[0.3em] font-bold opacity-90 drop-shadow-[0_0_8px_currentColor] whitespace-nowrap bg-[hsl(200,30%,4%,0.8)] px-2 py-1 rounded-sm border border-current/20">
              {group.category.name}
            </div>
          </div>
        );
      })}

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
