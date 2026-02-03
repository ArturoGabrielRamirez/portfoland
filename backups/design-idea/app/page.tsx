import Link from "next/link"
import { GamingButton, GamingCard, GamingCardContent, StatCard } from "@/components/gaming"

// Icons
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function TimelineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-sm">P</span>
              </div>
              <span className="font-display font-bold text-lg text-foreground">PORTFOLAND</span>
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#caracteristicas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Caracteristicas
              </Link>
              <Link href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Como funciona
              </Link>
              <Link href="#precios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Precios
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <GamingButton variant="outline" size="sm">
                  Iniciar Sesion
                </GamingButton>
              </Link>
              <Link href="/login" className="hidden sm:block">
                <GamingButton variant="primary" size="sm">
                  Comenzar Gratis
                </GamingButton>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-8">
            <SparklesIcon className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Tu carrera, tu aventura</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Transforma tu CV en una{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent text-glow-cyan">
              Aventura Epica
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
            Crea portfolios interactivos con timelines gamificados, arboles de habilidades 
            y tu propio subdominio. Destaca ante recruiters con una experiencia unica.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login">
              <GamingButton variant="primary" size="lg">
                Comenzar Aventura
              </GamingButton>
            </Link>
            <Link href="/demo">
              <GamingButton variant="outline" size="lg">
                Ver Demo
              </GamingButton>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <span className="block font-display text-3xl font-bold text-primary">10K+</span>
              <span className="text-sm text-muted-foreground">Usuarios activos</span>
            </div>
            <div className="text-center">
              <span className="block font-display text-3xl font-bold text-secondary">50K+</span>
              <span className="text-sm text-muted-foreground">Portfolios creados</span>
            </div>
            <div className="text-center">
              <span className="block font-display text-3xl font-bold text-success">95%</span>
              <span className="text-sm text-muted-foreground">Satisfaccion</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-primary mb-4 tracking-wider">
              CARACTERISTICAS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
              Todo lo que necesitas para brillar
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Herramientas disenadas para contar tu historia profesional de manera unica
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 - Timeline */}
            <GamingCard variant="glow" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <TimelineIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Timeline Interactivo
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Mapea tu journey profesional como una aventura. Cada trabajo, proyecto y logro es un 
                punto en tu camino hacia el exito.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/timeline" className="text-primary hover:underline">
                  + Mas detalles
                </Link>
                <Link href="/demo" className="text-muted-foreground hover:text-foreground">
                  Demo en vivo
                </Link>
              </div>
            </GamingCard>

            {/* Feature 2 - Skill Tree */}
            <GamingCard variant="magenta" className="p-6">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <TreeIcon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Arbol de Habilidades
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Visualiza tus skills como un RPG. Desbloquea habilidades, sube de nivel y muestra tu 
                progresion de manera visual y memorable.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-secondary">Skill-cards</span>
                <span className="text-muted-foreground">Niveles</span>
              </div>
            </GamingCard>

            {/* Feature 3 - Subdomain */}
            <GamingCard variant="default" className="p-6 border-success/30">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mb-4">
                <GlobeIcon className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Portfolio con Subdominio
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Tu propio espacio en internet: usuario.portfoland.com. Comparte tu portfolio 
                con un link profesional y memorable.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-success">.portfoland</span>
                <span className="text-muted-foreground">Share URL</span>
              </div>
            </GamingCard>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-success mb-4 tracking-wider">
              COMO FUNCIONA
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
              3 pasos para comenzar tu aventura
            </h2>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="font-display text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Crea tu cuenta
              </h3>
              <p className="text-muted-foreground text-sm">
                Registrate gratis y elige tu personaje. Puedes ser un wizard, un developer, o cualquier 
                avatar que te represente.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-secondary bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                <span className="font-display text-2xl font-bold text-secondary">2</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Construye tu timeline
              </h3>
              <p className="text-muted-foreground text-sm">
                Agrega tus experiencias, educacion y proyectos. Nuestro asistente AI te ayuda a 
                escribir descripciones profesionales.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-success bg-success/10 flex items-center justify-center mx-auto mb-6">
                <span className="font-display text-2xl font-bold text-success">3</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Comparte y destaca
              </h3>
              <p className="text-muted-foreground text-sm">
                Obten tu subdominio personalizado y comparte tu portfolio con recruiters. Tu historia 
                profesional, lista para brillar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modes Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-warning mb-4 tracking-wider">
              DOS MODOS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
              Tu portfolio, tu estilo
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Elige como quieres presentarte al mundo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Professional Mode */}
            <GamingCard variant="default" className="p-8 border-primary/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">Modo Profesional</h3>
                  <p className="text-sm text-primary">Para recruiters y empresas</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckIcon className="w-5 h-5 text-primary" />
                  CV tradicional con IA asistida
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckIcon className="w-5 h-5 text-primary" />
                  Timeline cronologico limpio
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckIcon className="w-5 h-5 text-primary" />
                  Exportar a PDF profesional
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckIcon className="w-5 h-5 text-primary" />
                  Integracion con LinkedIn
                </li>
              </ul>
              <GamingButton variant="primary" className="w-full">
                Elegir Profesional
              </GamingButton>
            </GamingCard>

            {/* Gaming Mode */}
            <GamingCard variant="magenta" className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <ChartIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">Modo Gaming</h3>
                  <p className="text-sm text-secondary">Para creativos y gamers</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckIcon className="w-5 h-5 text-secondary" />
                  Timeline como aventura RPG
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckIcon className="w-5 h-5 text-secondary" />
                  Arbol de habilidades visual
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckIcon className="w-5 h-5 text-secondary" />
                  Sistema de logros y XP
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckIcon className="w-5 h-5 text-secondary" />
                  Avatar personalizable
                </li>
              </ul>
              <GamingButton variant="secondary" className="w-full">
                Elegir Gaming
              </GamingButton>
            </GamingCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Listo para tu aventura?
          </h2>
          <p className="text-muted-foreground mb-8">
            Unete a miles de profesionales que ya estan destacando con Portfoland
          </p>
          <Link href="/login">
            <GamingButton variant="primary" size="lg">
              Crear cuenta gratis
            </GamingButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-sm">P</span>
              </div>
              <span className="font-display font-bold text-lg text-foreground">PORTFOLAND</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Caracteristicas</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Precios</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Ayuda</Link>
            </div>

            {/* Social */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Hecho con{" "}
                <span className="text-destructive">{"<3"}</span>
              </span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            2025 Portfoland. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
