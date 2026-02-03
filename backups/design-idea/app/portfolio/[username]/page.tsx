import Link from "next/link"
import { 
  GamingCard, 
  GamingCardHeader, 
  GamingCardTitle, 
  GamingCardContent,
  GamingButton,
  GamingAvatar,
  StatCard,
  SkillProgress,
  HUDPanel,
  AchievementBadge
} from "@/components/gaming"

// Mock user data
const userData = {
  username: "maria",
  name: "Maria Gonzalez",
  title: "Senior Photographer & Visual Artist",
  location: "Buenos Aires, Argentina",
  bio: "Fotografa profesional con 5+ anos de experiencia en fotografia de productos, eventos y moda. Apasionada por contar historias a traves de imagenes.",
  stats: {
    xp: 2450,
    experience: 8,
    skills: 15,
    achievements: 12,
  },
  level: 42,
}

// Mock skills
const topSkills = [
  { name: "Fotografia Profesional", level: 11, category: "design" as const },
  { name: "Edicion Digital", level: 8, category: "design" as const },
  { name: "Iluminacion de Estudio", level: 7, category: "soft" as const },
]

// Mock timeline highlights
const timelineHighlights = [
  { 
    id: 1, 
    title: "Senior Photographer", 
    company: "Studio Creativo Luna", 
    period: "2023 - Presente",
    current: true,
    type: "work"
  },
  { 
    id: 2, 
    title: "Photographer Assistant", 
    company: "Estudio Martinez Fotografia", 
    period: "2021 - 2023",
    current: false,
    type: "work"
  },
  { 
    id: 3, 
    title: "Diplomatura Fotografia", 
    company: "Instituto de Artes Visuales", 
    period: "2019 - 2021",
    current: false,
    type: "education"
  },
]

// Mock projects
const projects = [
  { 
    id: 1, 
    title: "Catalogo Merca XYZ", 
    description: "Sesion fotografica para catalogo de temporada primavera-verano 2025",
    category: "Fotografia de Producto",
    color: "primary"
  },
  { 
    id: 2, 
    title: "Boda Ana & Carlos", 
    description: "Cobertura completa de ceremonia y recepcion con album de 200+ fotos",
    category: "Fotografia de Eventos",
    color: "secondary"
  },
  { 
    id: 3, 
    title: "Editorial Revista Vogue", 
    description: "Sesion editorial para portada y doble-pagina interior por 5 modelos",
    category: "Fotografia de Moda",
    color: "warning"
  },
  { 
    id: 4, 
    title: "Menu Restaurante Gourmet", 
    description: "Fotografia de comida para menu. Mas de 40 platos para carta digital",
    category: "Fotografia Gastronomica",
    color: "success"
  },
]

// Mock achievements
const featuredAchievements = [
  { id: 1, title: "Mejor Proyecto", description: "Proyecto destacado #1", xp: 100, unlocked: true, rarity: "epic" as const },
  { id: 2, title: "5 Anos Experiencia", description: "Veterano", xp: 200, unlocked: true, rarity: "rare" as const },
  { id: 3, title: "1000 Fotos", description: "Prolifico", xp: 150, unlocked: true, rarity: "rare" as const },
  { id: 4, title: "Skill Master", description: "10+ skills al maximo", xp: 250, unlocked: true, rarity: "legendary" as const },
]

export default async function PortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo + URL */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                  <span className="font-display font-bold text-primary-foreground text-xs">P</span>
                </div>
              </Link>
              <span className="text-sm text-muted-foreground">
                portfoland.com/<span className="text-primary">{username}</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <GamingButton variant="outline" size="sm">
                Compartir
              </GamingButton>
              <GamingButton variant="primary" size="sm">
                Contactar
              </GamingButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <GamingCard variant="glow" className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start">
              <GamingAvatar fallback="MG" size="xl" frame="cyan" />
              <div className="mt-3 text-center lg:text-left">
                <span className="text-xs text-muted-foreground">Nivel {userData.level}</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                {userData.name}
              </h1>
              <p className="text-secondary font-medium mt-1">{userData.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{userData.location}</p>
              <p className="text-sm text-foreground/80 mt-3 max-w-xl">{userData.bio}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 lg:gap-4">
              <div className="text-center p-3 rounded-xl border border-primary/30 bg-primary/5">
                <span className="block font-display text-xl font-bold text-primary">
                  {userData.stats.xp.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">XP Total</span>
              </div>
              <div className="text-center p-3 rounded-xl border border-secondary/30 bg-secondary/5">
                <span className="block font-display text-xl font-bold text-secondary">
                  {userData.stats.experience}
                </span>
                <span className="text-xs text-muted-foreground">Experiencias</span>
              </div>
              <div className="text-center p-3 rounded-xl border border-success/30 bg-success/5">
                <span className="block font-display text-xl font-bold text-success">
                  {userData.stats.skills}
                </span>
                <span className="text-xs text-muted-foreground">Skills</span>
              </div>
              <div className="text-center p-3 rounded-xl border border-warning/30 bg-warning/5">
                <span className="block font-display text-xl font-bold text-warning">
                  {userData.stats.achievements}
                </span>
                <span className="text-xs text-muted-foreground">Logros</span>
              </div>
            </div>
          </div>
        </GamingCard>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Skills & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Skills + Timeline Preview Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Skills */}
              <HUDPanel 
                title="Top Skills"
                action={<Link href="#" className="text-xs text-primary hover:underline">Ver todo</Link>}
              >
                <div className="space-y-4">
                  {topSkills.map((skill) => (
                    <SkillProgress
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                      category={skill.category}
                    />
                  ))}
                </div>
              </HUDPanel>

              {/* Timeline Highlights */}
              <HUDPanel 
                title="Timeline Destacado"
                action={<Link href="#" className="text-xs text-primary hover:underline">Ver completo</Link>}
              >
                <div className="space-y-4">
                  {timelineHighlights.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        item.current ? "bg-primary" : 
                        item.type === "education" ? "bg-accent" : "bg-muted-foreground"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.current && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
                              ACTUAL
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.company}</p>
                        <p className="text-xs text-muted-foreground">{item.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </HUDPanel>
            </div>

            {/* Projects Section */}
            <HUDPanel 
              title="Proyectos & Trabajos"
              action={<Link href="#" className="text-xs text-primary hover:underline">Ver galeria completa</Link>}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <GamingCard key={project.id} variant="default" className="p-4 hover:border-primary/30 transition-all">
                    {/* Project Image Placeholder */}
                    <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Imagen</span>
                    </div>
                    <span className={`text-xs font-medium ${
                      project.color === "primary" ? "text-primary" :
                      project.color === "secondary" ? "text-secondary" :
                      project.color === "warning" ? "text-warning" : "text-success"
                    }`}>
                      {project.category}
                    </span>
                    <h4 className="font-display font-semibold text-foreground mt-1">{project.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                  </GamingCard>
                ))}
              </div>
            </HUDPanel>

            {/* Achievements Row */}
            <HUDPanel 
              title="Logros Destacados"
              action={<Link href="#" className="text-xs text-primary hover:underline">Ver todos</Link>}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {featuredAchievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    title={achievement.title}
                    description={achievement.description}
                    xp={achievement.xp}
                    unlocked={achievement.unlocked}
                    rarity={achievement.rarity}
                  />
                ))}
              </div>
            </HUDPanel>
          </div>

          {/* Right Column - Contact & More */}
          <div className="space-y-6">
            {/* Contact Card */}
            <GamingCard variant="glow" className="p-5">
              <h3 className="font-display font-semibold text-foreground mb-4">Contactar</h3>
              <div className="space-y-3">
                <GamingButton variant="primary" className="w-full">
                  Enviar Mensaje
                </GamingButton>
                <GamingButton variant="outline" className="w-full">
                  Ver CV Profesional
                </GamingButton>
              </div>
            </GamingCard>

            {/* Links Card */}
            <GamingCard variant="default" className="p-5">
              <h3 className="font-display font-semibold text-foreground mb-4">Enlaces</h3>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-foreground">LinkedIn</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-foreground">GitHub</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <span className="text-sm text-foreground">Website</span>
                </a>
              </div>
            </GamingCard>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Creado con{" "}
            <Link href="/" className="text-primary hover:underline">PORTFOLAND</Link>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              Crear tu portfolio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
