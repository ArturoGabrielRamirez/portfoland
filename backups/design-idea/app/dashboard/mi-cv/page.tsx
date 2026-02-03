"use client"

import { useState } from "react"
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  RefreshCw,
  Check,
  Copy,
  Palette,
  Layout,
  Type
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GamingBadge, StatBox } from "@/components/gaming"

const cvTemplates = [
  { id: "professional", name: "Profesional", description: "Clasico y elegante", popular: true },
  { id: "modern", name: "Moderno", description: "Minimalista y limpio", popular: false },
  { id: "creative", name: "Creativo", description: "Unico y llamativo", popular: false },
  { id: "tech", name: "Tech", description: "Para desarrolladores", popular: true },
]

const aiSuggestions = [
  { id: 1, type: "mejora", text: "Agrega metricas cuantificables a tu experiencia como Senior Photographer" },
  { id: 2, type: "tip", text: "Tu seccion de habilidades podria incluir certificaciones relevantes" },
  { id: 3, type: "alerta", text: "La descripcion de tu ultimo proyecto es muy corta" },
]

export default function MiCVPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("professional")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Mi CV Profesional
          </h1>
          <p className="text-sm text-muted-foreground">
            Genera tu CV optimizado con IA basado en tu timeline y habilidades
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border bg-card hover:bg-card-hover">
            <Eye className="h-4 w-4" />
            Vista Previa
          </Button>
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - CV Preview */}
        <div className="lg:col-span-2">
          <div className="gaming-card rounded-xl p-6">
            {/* CV Preview Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Vista Previa del CV
              </h2>
              <div className="flex gap-2">
                <button className="rounded-lg border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary">
                  <Layout className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary">
                  <Palette className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-border p-2 text-muted-foreground hover:border-primary hover:text-primary">
                  <Type className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CV Preview */}
            <div className="aspect-[8.5/11] rounded-lg border border-border bg-white p-8">
              {/* CV Content Preview */}
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-gray-200 pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">Maria Gonzalez</h1>
                  <p className="text-sm text-primary">Senior Photographer & Visual Artist</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Buenos Aires, Argentina</span>
                    <span>maria@email.com</span>
                    <span>portfoland.com/maria</span>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h2 className="mb-2 text-sm font-semibold uppercase text-gray-700">Perfil Profesional</h2>
                  <p className="text-xs leading-relaxed text-gray-600">
                    Fotografa profesional con 5+ anos de experiencia en fotografia de productos, 
                    eventos y moda. Apasionada por contar historias a traves de imagenes.
                  </p>
                </div>

                {/* Experience */}
                <div>
                  <h2 className="mb-2 text-sm font-semibold uppercase text-gray-700">Experiencia</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between">
                        <p className="text-xs font-medium text-gray-800">Senior Photographer</p>
                        <p className="text-xs text-gray-500">2023 - Presente</p>
                      </div>
                      <p className="text-xs text-primary">Studio Creativo Luna</p>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <p className="text-xs font-medium text-gray-800">Photographer Assistant</p>
                        <p className="text-xs text-gray-500">2021 - 2023</p>
                      </div>
                      <p className="text-xs text-primary">Estudio Martinez Fotografia</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h2 className="mb-2 text-sm font-semibold uppercase text-gray-700">Habilidades</h2>
                  <div className="flex flex-wrap gap-1">
                    {["Fotografia", "Lightroom", "Photoshop", "Edicion Digital", "Iluminacion"].map((skill) => (
                      <span key={skill} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Ultima actualizacion: Hace 2 horas
              </p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <Copy className="h-3 w-3" />
                  Copiar enlace
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Options */}
        <div className="space-y-6">
          {/* AI Assistant */}
          <div className="gaming-card rounded-xl p-4">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-secondary/20 p-2">
                <Sparkles className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Asistente IA</h3>
                <p className="text-xs text-muted-foreground">Optimiza tu CV automaticamente</p>
              </div>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Optimizar con IA
                </>
              )}
            </Button>

            {/* Suggestions */}
            <div className="mt-4 space-y-2">
              {aiSuggestions.map((suggestion) => (
                <div 
                  key={suggestion.id}
                  className={`rounded-lg border p-3 text-xs ${
                    suggestion.type === "mejora" ? "border-primary/30 bg-primary/5" :
                    suggestion.type === "tip" ? "border-warning/30 bg-warning/5" :
                    "border-destructive/30 bg-destructive/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                      suggestion.type === "mejora" ? "bg-primary" :
                      suggestion.type === "tip" ? "bg-warning" :
                      "bg-destructive"
                    }`} />
                    <p className="text-muted-foreground">{suggestion.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="gaming-card rounded-xl p-4">
            <h3 className="mb-3 font-display font-semibold text-foreground">Plantillas</h3>
            <div className="grid grid-cols-2 gap-2">
              {cvTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`relative rounded-lg border p-3 text-left transition-all ${
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-border-hover"
                  }`}
                >
                  {template.popular && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-warning px-1.5 py-0.5 text-[10px] font-medium text-warning-foreground">
                      Popular
                    </span>
                  )}
                  <p className={`text-sm font-medium ${
                    selectedTemplate === template.id ? "text-primary" : "text-foreground"
                  }`}>
                    {template.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                  {selectedTemplate === template.id && (
                    <Check className="absolute bottom-2 right-2 h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="gaming-card rounded-xl p-4">
            <h3 className="mb-3 font-display font-semibold text-foreground">Estadisticas</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatBox value="156" label="Vistas" color="cyan" size="sm" />
              <StatBox value="23" label="Descargas" color="magenta" size="sm" />
              <StatBox value="89%" label="Completado" color="green" size="sm" />
              <StatBox value="A+" label="Score ATS" color="yellow" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
