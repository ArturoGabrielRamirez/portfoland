"use client"

import { useState } from "react"
import { 
  GamingCard, 
  GamingButton,
  SkillTreeNode,
  NavTab,
  HUDPanel
} from "@/components/gaming"

// Skill categories
const skillCategories = [
  { id: "frontend", label: "Frontend", color: "text-primary" },
  { id: "backend", label: "Backend", color: "text-success" },
  { id: "database", label: "Databases", color: "text-warning" },
  { id: "devops", label: "DevOps", color: "text-secondary" },
  { id: "design", label: "Design", color: "text-accent" },
  { id: "soft", label: "Soft Skills", color: "text-skill-soft" },
]

// Mock skill tree data - Photography focused
const skillTreeData = {
  frontend: {
    root: { id: "frontend-root", name: "Frontend", level: 8, unlocked: true },
    children: [
      { 
        id: "html5", 
        name: "HTML5", 
        level: 9, 
        unlocked: true,
        children: [
          { id: "css3", name: "CSS3", level: 8, unlocked: true },
          { id: "javascript", name: "JavaScript", level: 7, unlocked: true },
        ]
      },
      { 
        id: "react", 
        name: "React", 
        level: 6, 
        unlocked: true,
        children: [
          { id: "nextjs", name: "Next.js", level: 5, unlocked: true },
          { id: "typescript", name: "TypeScript", level: 4, unlocked: true },
        ]
      },
    ]
  },
  backend: {
    root: { id: "backend-root", name: "Backend", level: 5, unlocked: true },
    children: [
      { id: "nodejs", name: "Node.js", level: 5, unlocked: true },
      { id: "python", name: "Python", level: 3, unlocked: true },
      { id: "rust", name: "Rust", level: 1, unlocked: false },
    ]
  },
  design: {
    root: { id: "design-root", name: "Fotografia", level: 10, unlocked: true },
    children: [
      { 
        id: "lightroom", 
        name: "Lightroom", 
        level: 9, 
        unlocked: true,
        children: [
          { id: "photoshop", name: "Photoshop", level: 8, unlocked: true },
          { id: "capture-one", name: "Capture One", level: 6, unlocked: true },
        ]
      },
      { 
        id: "composicion", 
        name: "Composicion", 
        level: 8, 
        unlocked: true,
        children: [
          { id: "iluminacion", name: "Iluminacion", level: 7, unlocked: true },
          { id: "retoque", name: "Retoque", level: 6, unlocked: true },
        ]
      },
    ]
  },
}

// Stats
const skillStats = {
  totalPoints: 12,
  unlockedSkills: 18,
  totalSkills: 24,
}

export default function SkillTreePage() {
  const [activeCategory, setActiveCategory] = useState("frontend")
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Arbol de Habilidades
          </h1>
          <p className="text-muted-foreground mt-1">
            Desbloquea y mejora tus habilidades tecnicas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GamingButton variant="outline" size="sm">
            Filtrar
          </GamingButton>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar skill..."
              className="h-9 w-40 pl-8 pr-3 rounded-lg border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="flex items-center gap-6 p-4 rounded-xl border border-secondary/30 bg-card">
        <div className="flex items-center gap-3">
          <div className="text-xs text-secondary font-medium tracking-wider">SKILL POINTS</div>
          <div className="font-display text-3xl font-bold text-secondary">{skillStats.totalPoints}</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-sm text-muted-foreground">
          Puntos disponibles para desbloquear habilidades
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {skillCategories.map((cat) => (
          <NavTab
            key={cat.id}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </NavTab>
        ))}
      </div>

      {/* Skill Tree Visualization */}
      <GamingCard variant="default" className="p-8 min-h-[500px]">
        {/* Tree Container */}
        <div className="flex flex-col items-center">
          {/* Legend */}
          <div className="flex items-center gap-6 mb-8 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Completado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span>En progreso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span>Bloqueado</span>
            </div>
          </div>

          {/* Root Node */}
          <SkillTreeNode
            name="Frontend"
            level={8}
            unlocked={true}
            active={selectedSkill === "frontend-root"}
            category="frontend"
            onClick={() => setSelectedSkill("frontend-root")}
          />

          {/* Connection Line */}
          <div className="w-px h-12 bg-gradient-to-b from-primary to-primary/50" />

          {/* Level 1 Skills */}
          <div className="flex items-start gap-16">
            {/* Left Branch */}
            <div className="flex flex-col items-center">
              <SkillTreeNode
                name="HTML5"
                level={9}
                unlocked={true}
                category="frontend"
                onClick={() => setSelectedSkill("html5")}
              />
              <div className="w-px h-8 bg-primary/50" />
              <div className="flex items-start gap-8">
                <div className="flex flex-col items-center">
                  <SkillTreeNode
                    name="CSS3"
                    level={8}
                    unlocked={true}
                    category="frontend"
                    onClick={() => setSelectedSkill("css3")}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <SkillTreeNode
                    name="JavaScript"
                    level={7}
                    unlocked={true}
                    category="frontend"
                    onClick={() => setSelectedSkill("javascript")}
                  />
                </div>
              </div>
            </div>

            {/* Right Branch */}
            <div className="flex flex-col items-center">
              <SkillTreeNode
                name="React"
                level={6}
                unlocked={true}
                category="frontend"
                onClick={() => setSelectedSkill("react")}
              />
              <div className="w-px h-8 bg-primary/50" />
              <div className="flex items-start gap-8">
                <div className="flex flex-col items-center">
                  <SkillTreeNode
                    name="TypeScript"
                    level={4}
                    unlocked={true}
                    category="frontend"
                    onClick={() => setSelectedSkill("typescript")}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <SkillTreeNode
                    name="Next.js"
                    level={5}
                    unlocked={true}
                    category="frontend"
                    onClick={() => setSelectedSkill("nextjs")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row - locked skills */}
          <div className="mt-8 flex items-center gap-8">
            <SkillTreeNode
              name="Remix"
              level={0}
              unlocked={false}
              category="frontend"
              onClick={() => setSelectedSkill("remix")}
            />
            <SkillTreeNode
              name="Svelte"
              level={0}
              unlocked={false}
              category="frontend"
              onClick={() => setSelectedSkill("svelte")}
            />
          </div>
        </div>
      </GamingCard>

      {/* Skill Detail Panel */}
      {selectedSkill && (
        <HUDPanel title="DETALLE DE SKILL">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {selectedSkill === "frontend-root" ? "Frontend Development" : 
                 selectedSkill.charAt(0).toUpperCase() + selectedSkill.slice(1)}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Habilidad en desarrollo frontend. Incluye HTML, CSS, JavaScript y frameworks modernos.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Nivel actual:</span>
                  <span className="font-display font-bold text-primary ml-2">8/10</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">XP para siguiente:</span>
                  <span className="font-display font-bold text-warning ml-2">150 XP</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <GamingButton variant="primary" size="sm">
                Mejorar Skill (+1)
              </GamingButton>
              <GamingButton variant="outline" size="sm">
                Ver proyectos
              </GamingButton>
            </div>
          </div>
        </HUDPanel>
      )}
    </div>
  )
}
