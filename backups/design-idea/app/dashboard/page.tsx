import Link from "next/link"
import { 
  GamingCard, 
  GamingCardHeader, 
  GamingCardTitle, 
  GamingCardContent,
  GamingButton,
  StatCard,
  XPBar,
  AchievementBadge,
  HUDPanel 
} from "@/components/gaming"

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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

// Mock data
const recentAchievements = [
  { id: 1, title: "Primer Paso!", description: "Completaste tu primer timeline de carrera", xp: 50, unlocked: true, rarity: "common" as const },
  { id: 2, title: "Skill Master", description: "Agregaste 10 habilidades al skill tree", xp: 100, unlocked: true, rarity: "rare" as const },
  { id: 3, title: "Early Adopter", description: "Te uniste durante el lanzamiento beta", xp: 75, unlocked: true, rarity: "epic" as const },
]

const recentActivity = [
  { id: 1, action: "Desbloqueaste el logro", detail: '"Primer Paso"', time: "Hace 2 horas", color: "text-warning" },
  { id: 2, action: "Agregaste", detail: '"React" al Skill Tree', time: "Hace 5 horas", color: "text-primary" },
  { id: 3, action: "Tu portfolio recibio", detail: "42 visitas", time: "Hace 1 dia", color: "text-success" },
  { id: 4, action: "Completaste tu nivel al", detail: "85%", time: "Hace 2 dias", color: "text-secondary" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Bienvenida, Maria!
          </h1>
          <p className="text-muted-foreground mt-1">
            Continua construyendo tu aventura profesional
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          value="2,450"
          label="Experiencia"
          color="yellow"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          value="18/42"
          label="Logros"
          color="magenta"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
        <StatCard
          value="24"
          label="Habilidades"
          color="cyan"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
        <StatCard
          value="1,247"
          label="Visitas"
          color="green"
          icon={<ChartIcon className="w-5 h-5" />}
        />
      </div>

      {/* Level Progress */}
      <HUDPanel title="PROGRESO AL NIVEL 19" className="relative overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Nivel actual</span>
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <span className="font-display text-xl font-bold text-primary-foreground">18</span>
            </div>
          </div>
          <div className="flex-1">
            <XPBar current={2450} max={3000} level={18} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          550 XP restantes - 81% completado - Sigue asi!
        </p>
      </HUDPanel>

      {/* Quick Actions */}
      <HUDPanel title="ACCIONES RAPIDAS">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/dashboard/timeline">
            <GamingCard variant="default" className="p-4 text-center hover:border-primary/50 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <PlusIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">Agregar Experiencia</span>
              <p className="text-xs text-muted-foreground mt-1">Nuevo item en timeline</p>
            </GamingCard>
          </Link>
          <Link href="/dashboard/skills">
            <GamingCard variant="default" className="p-4 text-center hover:border-secondary/50 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <EditIcon className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm font-medium text-foreground">Editar Skills</span>
              <p className="text-xs text-muted-foreground mt-1">Actualiza tu skill tree</p>
            </GamingCard>
          </Link>
          <Link href="/dashboard/my-cv">
            <GamingCard variant="default" className="p-4 text-center hover:border-success/50 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <DownloadIcon className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm font-medium text-foreground">Generar CV</span>
              <p className="text-xs text-muted-foreground mt-1">Crea tu CV con IA</p>
            </GamingCard>
          </Link>
          <Link href="/portfolio/maria">
            <GamingCard variant="default" className="p-4 text-center hover:border-warning/50 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ShareIcon className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm font-medium text-foreground">Compartir Portfolio</span>
              <p className="text-xs text-muted-foreground mt-1">Comparte tu perfil</p>
            </GamingCard>
          </Link>
        </div>
      </HUDPanel>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <HUDPanel 
          title="LOGROS RECIENTES"
          action={
            <Link href="/dashboard/achievements" className="text-xs text-primary hover:underline">
              Ver todos
            </Link>
          }
        >
          <div className="grid grid-cols-3 gap-4">
            {recentAchievements.map((achievement) => (
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

        {/* Recent Activity */}
        <HUDPanel 
          title="ACTIVIDAD RECIENTE"
          action={
            <span className="text-xs text-muted-foreground">5 nuevas</span>
          }
        >
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    {item.action}{" "}
                    <span className={item.color}>{item.detail}</span>
                  </p>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </HUDPanel>
      </div>
    </div>
  )
}
