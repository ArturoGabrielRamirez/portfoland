"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  GamingCard, 
  GamingButton,
  GamingInput,
  GamingAvatar,
  NavTab
} from "@/components/gaming"

// Settings tabs
const settingsTabs = [
  { id: "profile", label: "Perfil", icon: null },
  { id: "security", label: "Seguridad", icon: null },
  { id: "language", label: "Idioma", icon: null },
  { id: "appearance", label: "Apariencia", icon: null },
  { id: "notifications", label: "Notificaciones", icon: null },
]

// Mock user data
const userData = {
  name: "Maria Gonzalez",
  email: "maria@email.com",
  title: "Senior Photographer & Visual Artist",
  location: "Buenos Aires, Argentina",
  bio: "Fotografa profesional con 5+ anos de experiencia en fotografia de productos, eventos y moda. Apasionada por contar historias a traves de imagenes.",
  username: "maria",
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [formData, setFormData] = useState(userData)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h1 className="font-display text-xl font-bold text-foreground">Configuracion</h1>
        </div>
        <Link href="/dashboard">
          <GamingButton variant="outline" size="sm">
            Volver al Dashboard
          </GamingButton>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-48 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,212,255,0.3)]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <GamingCard variant="default" className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Perfil de Usuario</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Administra tu informacion personal y como apareces en tu portfolio
                  </p>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <GamingAvatar fallback="MG" size="lg" frame="cyan" />
                  <div className="space-y-2">
                    <GamingButton variant="outline" size="sm">
                      Cambiar foto
                    </GamingButton>
                    <p className="text-xs text-destructive">Eliminar foto</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nombre completo</label>
                    <GamingInput 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <GamingInput 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Titulo profesional</label>
                    <GamingInput 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Ubicacion</label>
                    <GamingInput 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Biografia</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={3}
                    className="flex w-full rounded-lg border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                {/* Portfolio URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">URL del portfolio</label>
                  <div className="flex items-center rounded-lg border border-border bg-input overflow-hidden">
                    <span className="px-4 py-2.5 bg-muted text-sm text-muted-foreground border-r border-border">
                      portfoland.com/
                    </span>
                    <input 
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="flex-1 px-4 py-2.5 bg-transparent text-sm text-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <GamingButton variant="primary">
                    Guardar cambios
                  </GamingButton>
                  <GamingButton variant="outline">
                    Cancelar
                  </GamingButton>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Seguridad</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Administra tu contrasena y opciones de seguridad
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contrasena actual</label>
                    <GamingInput type="password" placeholder="********" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nueva contrasena</label>
                    <GamingInput type="password" placeholder="********" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirmar contrasena</label>
                    <GamingInput type="password" placeholder="********" />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <GamingButton variant="primary">
                    Actualizar contrasena
                  </GamingButton>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Apariencia</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Personaliza el aspecto de tu portfolio
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-3">Modo de visualizacion</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 rounded-xl border-2 border-primary bg-primary/10 text-left">
                        <span className="font-medium text-foreground block">Modo Gaming</span>
                        <span className="text-xs text-muted-foreground">Con XP, logros y efectos</span>
                      </button>
                      <button className="p-4 rounded-xl border border-border hover:border-border-hover text-left transition-colors">
                        <span className="font-medium text-foreground block">Modo Profesional</span>
                        <span className="text-xs text-muted-foreground">Limpio y minimalista</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-3">Color de acento</label>
                    <div className="flex items-center gap-3">
                      <button className="w-8 h-8 rounded-full bg-primary ring-2 ring-offset-2 ring-offset-background ring-primary" />
                      <button className="w-8 h-8 rounded-full bg-secondary" />
                      <button className="w-8 h-8 rounded-full bg-success" />
                      <button className="w-8 h-8 rounded-full bg-warning" />
                      <button className="w-8 h-8 rounded-full bg-accent" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === "language" || activeTab === "notifications") && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Configuracion de {activeTab === "language" ? "idioma" : "notificaciones"} proximamente...</p>
              </div>
            )}
          </GamingCard>
        </div>
      </div>
    </div>
  )
}
