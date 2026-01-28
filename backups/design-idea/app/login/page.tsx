"use client"

import { useState } from "react"
import Link from "next/link"
import { GamingButton, GamingInput, GamingCard, CharacterSelect } from "@/components/gaming"

// Character options
const characters = [
  { id: "developer", name: "Developer", icon: "D", color: "cyan" as const },
  { id: "designer", name: "Designer", icon: "D", color: "magenta" as const },
  { id: "wizard", name: "Wizard", icon: "W", color: "yellow" as const },
  { id: "warrior", name: "Warrior", icon: "W", color: "green" as const },
]

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [step, setStep] = useState<"auth" | "character">("auth")

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-background-secondary border-r border-border flex-col justify-between p-12">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-lg">P</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">PORTFOLAND</span>
          </Link>
        </div>

        <div className="space-y-8">
          <h1 className="font-display text-4xl font-bold text-foreground leading-tight text-balance">
            INICIA TU AVENTURA
          </h1>
          <p className="text-muted-foreground text-lg">
            Crea tu portfolio gamificado y destaca entre la multitud de candidatos.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-foreground">Timeline Interactivo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-foreground">Sistema de Logros</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-foreground">CV con IA</span>
            </div>
          </div>

          {/* Avatar Preview */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">ELIGE TU AVATAR:</span>
            <div className="w-10 h-10 rounded-full border-2 border-muted bg-muted" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          2025 Portfoland
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-lg">P</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">PORTFOLAND</span>
            </Link>
          </div>

          {step === "auth" ? (
            <>
              {/* Auth Tabs */}
              <div className="flex rounded-lg border border-border bg-card p-1 mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    isLogin 
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.3)]" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  INICIAR SESION
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    !isLogin 
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.3)]" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  REGISTRARSE
                </button>
              </div>

              {/* Auth Form */}
              <div className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">EMAIL</label>
                  <GamingInput 
                    type="email" 
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">CONTRASENA</label>
                  <div className="relative">
                    <GamingInput 
                      type={showPassword ? "text" : "password"} 
                      placeholder="********"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                {isLogin && (
                  <Link 
                    href="/forgot-password" 
                    className="block text-sm text-primary hover:underline"
                  >
                    Olvidaste tu contrasena?
                  </Link>
                )}

                {/* Submit Button */}
                <GamingButton 
                  variant="primary" 
                  className="w-full"
                  onClick={() => !isLogin && setStep("character")}
                >
                  {isLogin ? "INICIAR PARTIDA" : "CONTINUAR"}
                </GamingButton>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-background text-muted-foreground">O CONTINUAR CON</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                  <GamingButton variant="outline" className="w-full">
                    <GoogleIcon className="w-5 h-5" />
                    Google
                  </GamingButton>
                  <GamingButton variant="outline" className="w-full">
                    <GitHubIcon className="w-5 h-5" />
                    GitHub
                  </GamingButton>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Character Selection */}
              <div className="text-center mb-8">
                <span className="text-sm text-muted-foreground tracking-wider">TEMPLATES - CONSOLE FRAMES</span>
                <h2 className="font-display text-2xl font-bold text-foreground mt-2">
                  SELECT YOUR CLASS
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {characters.map((char) => (
                  <CharacterSelect
                    key={char.id}
                    name={char.name}
                    icon={
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-display font-bold ${
                        char.color === "cyan" ? "bg-primary/20 text-primary" :
                        char.color === "magenta" ? "bg-secondary/20 text-secondary" :
                        char.color === "yellow" ? "bg-warning/20 text-warning" :
                        "bg-success/20 text-success"
                      }`}>
                        {char.icon}
                      </div>
                    }
                    selected={selectedCharacter === char.id}
                    color={char.color}
                    onClick={() => setSelectedCharacter(char.id)}
                  />
                ))}
              </div>

              <div className="flex gap-4">
                <GamingButton 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setStep("auth")}
                >
                  Atras
                </GamingButton>
                <GamingButton 
                  variant="primary" 
                  className="flex-1"
                  disabled={!selectedCharacter}
                >
                  Crear
                </GamingButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
