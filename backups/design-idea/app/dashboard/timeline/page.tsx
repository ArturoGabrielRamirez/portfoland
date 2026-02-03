"use client"

import { useState } from "react"
import { 
  GamingCard, 
  GamingButton,
  TimelineEvent,
  HUDPanel,
  NavTab
} from "@/components/gaming"

// Filter tabs
const filterTabs = [
  { id: "all", label: "Todos", icon: null },
  { id: "work", label: "Trabajo", icon: null },
  { id: "education", label: "Educacion", icon: null },
  { id: "project", label: "Proyectos", icon: null },
  { id: "certification", label: "Certificaciones", icon: null },
]

// Mock timeline data
const timelineData = [
  {
    id: 1,
    title: "Senior Photographer",
    company: "Studio Creativo Luna",
    period: "2023 - Presente",
    description: "Fotografia profesional de productos, eventos corporativos y sesiones de moda. Direccion de equipo de 3 fotografos.",
    tags: ["Fotografia", "Edicion", "Liderazgo"],
    type: "work" as const,
    xp: 500,
    current: true,
    location: "Buenos Aires, Argentina",
  },
  {
    id: 2,
    title: "Photographer Assistant",
    company: "Estudio Martinez Fotografia",
    period: "2021 - 2023",
    description: "Asistencia en sesiones fotograficas, manejo de iluminacion y post-produccion basica en Lightroom.",
    tags: ["Fotografia", "Lightroom"],
    type: "work" as const,
    xp: 350,
    current: false,
    location: "San Isidro, Argentina",
  },
  {
    id: 3,
    title: "Diplomatura en Fotografia Digital",
    company: "Instituto de Artes Visuales",
    period: "2019 - 2021",
    description: "Formacion completa en fotografia digital, composicion, iluminacion de estudio y edicion profesional.",
    tags: ["Educacion"],
    type: "education" as const,
    xp: 400,
    current: false,
    location: "Rosario, Argentina",
    achievement: "Mejor Portafolio Final - Promocion 2021",
  },
  {
    id: 4,
    title: "Proyecto Personal - Street Photography",
    company: "Proyecto Independiente",
    period: "2020 - 2021",
    description: "Serie fotografica documentando la vida urbana durante la pandemia. Exhibida en galeria local.",
    tags: ["Street Photography", "Documental"],
    type: "project" as const,
    xp: 200,
    current: false,
  },
  {
    id: 5,
    title: "Certificacion Adobe Lightroom",
    company: "Adobe Certified Professional",
    period: "2022",
    description: "Certificacion oficial de Adobe en edicion y post-produccion fotografica con Lightroom Classic y CC.",
    tags: ["Adobe", "Lightroom", "Certificacion"],
    type: "certification" as const,
    xp: 150,
    current: false,
  },
]

// Stats data
const journeyStats = {
  totalXP: 2450,
  milestones: 5,
  experiences: 8,
  achievements: 12,
}

export default function TimelinePage() {
  const [activeFilter, setActiveFilter] = useState("all")

  const filteredTimeline = activeFilter === "all" 
    ? timelineData 
    : timelineData.filter(item => item.type === activeFilter)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mi Timeline
          </h1>
          <p className="text-muted-foreground mt-1">
            Tu journey profesional en un vistazo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <GamingButton variant="outline" size="sm">
            Filtrar
          </GamingButton>
          <GamingButton variant="primary" size="sm">
            + Agregar
          </GamingButton>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-card">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="font-display font-bold text-primary">
              {journeyStats.totalXP.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">XP Total</span>
            <span className="text-sm font-medium text-foreground">Experiencia</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-secondary/30 bg-card">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            <span className="font-display font-bold text-secondary">{journeyStats.milestones}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Completados</span>
            <span className="text-sm font-medium text-foreground">Hitos</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-success/30 bg-card">
          <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
            <span className="font-display font-bold text-success">{journeyStats.experiences}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Registradas</span>
            <span className="text-sm font-medium text-foreground">Experiencias</span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-warning/30 bg-card">
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
            <span className="font-display font-bold text-warning">{journeyStats.achievements}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Desbloqueados</span>
            <span className="text-sm font-medium text-foreground">Logros</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => (
          <NavTab
            key={tab.id}
            active={activeFilter === tab.id}
            onClick={() => setActiveFilter(tab.id)}
          >
            {tab.label}
          </NavTab>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Main timeline line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-muted" />

        {/* Timeline Events */}
        <div className="space-y-6">
          {filteredTimeline.map((item) => (
            <TimelineEvent
              key={item.id}
              title={item.title}
              company={item.company}
              period={item.period}
              description={item.description}
              tags={item.tags}
              type={item.type}
              xp={item.xp}
              current={item.current}
            />
          ))}
        </div>

        {/* Add New Entry Button */}
        <div className="relative pl-8 mt-6">
          <div className="absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center">
            <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <GamingButton variant="outline" className="w-full border-dashed">
            Agregar nueva experiencia
          </GamingButton>
        </div>
      </div>
    </div>
  )
}
