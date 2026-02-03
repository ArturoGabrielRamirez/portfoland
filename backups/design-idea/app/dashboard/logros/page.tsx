"use client"

import { useState } from "react"
import { Trophy, Star, Briefcase, GraduationCap, Code, Filter } from "lucide-react"
import { 
  StatBox, 
  GamingBadge, 
  CategoryPill 
} from "@/components/gaming"

const achievements = [
  {
    id: 1,
    name: "Primer Proyecto",
    description: "Completaste tu primer proyecto profesional",
    xp: 100,
    category: "carrera",
    unlocked: true,
    unlockedAt: "Hace 2 horas",
    icon: Briefcase,
    color: "cyan" as const,
  },
  {
    id: 2,
    name: "Skill Master",
    description: "Alcanzaste nivel 10 en una habilidad",
    xp: 250,
    category: "skills",
    unlocked: true,
    unlockedAt: "Hace 1 semana",
    icon: Star,
    color: "yellow" as const,
  },
  {
    id: 3,
    name: "Portfolio Pro",
    description: "Tu portfolio fue visto 100+ veces",
    xp: 300,
    category: "carrera",
    unlocked: true,
    unlockedAt: "Hace 2 semanas",
    icon: Trophy,
    color: "magenta" as const,
  },
  {
    id: 4,
    name: "5 Anos Exp",
    description: "Acumulaste 5 anos de experiencia profesional",
    xp: 500,
    category: "carrera",
    unlocked: true,
    unlockedAt: "Hace 1 mes",
    icon: Briefcase,
    color: "green" as const,
  },
  {
    id: 5,
    name: "Educador",
    description: "Obtuviste una certificacion profesional",
    xp: 200,
    category: "proyectos",
    unlocked: false,
    progress: 70,
    icon: GraduationCap,
    color: "purple" as const,
  },
  {
    id: 6,
    name: "Code Ninja",
    description: "Domina 5 lenguajes de programacion",
    xp: 350,
    category: "skills",
    unlocked: false,
    progress: 60,
    icon: Code,
    color: "cyan" as const,
  },
]

const categories = [
  { id: "todos", label: "Todos", count: 12 },
  { id: "carrera", label: "Carrera", count: 4 },
  { id: "skills", label: "Skills", count: 5 },
  { id: "proyectos", label: "Proyectos", count: 3 },
]

export default function LogrosPage() {
  const [activeCategory, setActiveCategory] = useState("todos")
  
  const filteredAchievements = activeCategory === "todos" 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory)
  
  const totalLogros = achievements.filter(a => a.unlocked).length
  const totalXP = achievements.filter(a => a.unlocked).reduce((acc, a) => acc + a.xp, 0)
  const completionRate = Math.round((totalLogros / achievements.length) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Galeria de Logros
          </h1>
          <p className="text-sm text-muted-foreground">
            Cada logro representa un hito en tu carrera profesional
          </p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-3">
          <StatBox 
            value={totalLogros} 
            label="Logros" 
            color="cyan" 
            size="sm"
          />
          <StatBox 
            value={totalXP.toLocaleString()} 
            label="XP Total" 
            color="yellow" 
            size="sm"
          />
          <StatBox 
            value={`${completionRate}%`} 
            label="Completado" 
            color="green" 
            size="sm"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            color={cat.id === "carrera" ? "cyan" : cat.id === "skills" ? "magenta" : cat.id === "proyectos" ? "yellow" : "cyan"}
          >
            {cat.label} ({cat.count})
          </CategoryPill>
        ))}
        
        <button className="ml-auto flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:border-border-hover hover:text-foreground">
          <Filter className="h-4 w-4" />
          Filtrar
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-badge group relative overflow-hidden p-4 transition-all hover:scale-[1.02] ${
              achievement.unlocked ? "unlocked" : "locked"
            }`}
          >
            {/* Glow effect for unlocked */}
            {achievement.unlocked && (
              <div 
                className={`absolute inset-0 opacity-10 ${
                  achievement.color === "cyan" ? "bg-primary" :
                  achievement.color === "magenta" ? "bg-secondary" :
                  achievement.color === "yellow" ? "bg-warning" :
                  achievement.color === "green" ? "bg-success" :
                  "bg-accent"
                }`}
              />
            )}
            
            <div className="relative">
              {/* Icon */}
              <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                achievement.unlocked 
                  ? achievement.color === "cyan" ? "border-primary bg-primary/10" :
                    achievement.color === "magenta" ? "border-secondary bg-secondary/10" :
                    achievement.color === "yellow" ? "border-warning bg-warning/10" :
                    achievement.color === "green" ? "border-success bg-success/10" :
                    "border-accent bg-accent/10"
                  : "border-border bg-muted"
              }`}>
                <achievement.icon className={`h-8 w-8 ${
                  achievement.unlocked 
                    ? achievement.color === "cyan" ? "text-primary" :
                      achievement.color === "magenta" ? "text-secondary" :
                      achievement.color === "yellow" ? "text-warning" :
                      achievement.color === "green" ? "text-success" :
                      "text-accent"
                    : "text-muted-foreground"
                }`} />
              </div>
              
              {/* Content */}
              <h3 className={`font-display font-semibold ${
                achievement.unlocked ? "text-foreground" : "text-muted-foreground"
              }`}>
                {achievement.unlocked ? achievement.name : "???"}
              </h3>
              
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {achievement.unlocked ? achievement.description : "Logro bloqueado"}
              </p>
              
              {/* XP Badge */}
              <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                achievement.unlocked 
                  ? achievement.color === "cyan" ? "bg-primary/20 text-primary" :
                    achievement.color === "magenta" ? "bg-secondary/20 text-secondary" :
                    achievement.color === "yellow" ? "bg-warning/20 text-warning" :
                    achievement.color === "green" ? "bg-success/20 text-success" :
                    "bg-accent/20 text-accent"
                  : "bg-muted text-muted-foreground"
              }`}>
                +{achievement.xp} XP
              </div>
              
              {/* Unlocked date or progress */}
              {achievement.unlocked ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {achievement.unlockedAt}
                </p>
              ) : achievement.progress ? (
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progreso</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <div className="progress-gaming">
                    <div 
                      className="progress-gaming-fill opacity-50"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold text-foreground">
            No hay logros en esta categoria
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Sigue completando tu perfil para desbloquear mas logros
          </p>
        </div>
      )}
    </div>
  )
}
