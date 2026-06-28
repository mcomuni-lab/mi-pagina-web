"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Image as ImageIcon, Trash2, Link } from "lucide-react"

interface ImagesPanelProps {
  config: {
    logo: string
    banner: string
    heroImage: string
    aboutImage: string
    galleryImages: string[]
  }
  onChange: (config: ImagesPanelProps["config"]) => void
}

export function ImagesPanel({ config, onChange }: ImagesPanelProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload")

  const handleImageChange = (key: keyof Omit<ImagesPanelProps["config"], "galleryImages">, value: string) => {
    onChange({ ...config, [key]: value })
  }

  const handleGalleryAdd = (url: string) => {
    if (url && config.galleryImages.length < 6) {
      onChange({ ...config, galleryImages: [...config.galleryImages, url] })
    }
  }

  const handleGalleryRemove = (index: number) => {
    const newGallery = config.galleryImages.filter((_, i) => i !== index)
    onChange({ ...config, galleryImages: newGallery })
  }

  const imageFields = [
    { key: "logo" as const, label: "Logotipo", description: "El logo de tu marca" },
    { key: "banner" as const, label: "Imagen de Banner", description: "Banner principal de la página" },
    { key: "heroImage" as const, label: "Imagen Principal (Hero)", description: "Imagen destacada de la sección de inicio" },
    { key: "aboutImage" as const, label: "Imagen de Nosotros", description: "Imagen para la sección de información o quiénes somos" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Imágenes</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Sube imágenes o pega enlaces (URLs) para tu sitio web
        </p>
      </div>

      {/* Upload Method Toggle */}
      <div className="flex gap-2 p-1 bg-background/50 rounded-lg">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "upload"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="h-4 w-4 inline-block mr-2" />
          Subir archivo
        </button>
        <button
          onClick={() => setActiveTab("url")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === "url"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link className="h-4 w-4 inline-block mr-2" />
          Enlace URL
        </button>
      </div>

      {/* Image Fields */}
      <div className="space-y-4">
        {imageFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label className="text-sm font-medium text-foreground">{field.label}</Label>
            <p className="text-xs text-muted-foreground">{field.description}</p>
            
            {activeTab === "upload" ? (
              <div className="relative">
                {config[field.key] ? (
                  <div className="relative group">
                    <div className="aspect-video bg-background/50 rounded-lg border border-border/50 overflow-hidden flex items-center justify-center">
                      {field.key === "logo" ? (
                        <div className="h-12 w-auto flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground truncate max-w-[150px]">
                            {config[field.key].split("/").pop()}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground truncate max-w-[150px]">
                            {config[field.key].split("/").pop()}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleImageChange(field.key, "")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-background/30">
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Haz clic para subir</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = URL.createObjectURL(file)
                          handleImageChange(field.key, url)
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            ) : (
              <Input
                placeholder="https://ejemplo.com/imagen.png"
                value={config[field.key]}
                onChange={(e) => handleImageChange(field.key, e.target.value)}
                className="bg-background/50 border-border/50"
              />
            )}
          </div>
        ))}
      </div>

      {/* Gallery Images */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium text-foreground">Imágenes de la Galería</Label>
            <p className="text-xs text-muted-foreground">Añade hasta 6 imágenes</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {config.galleryImages.length}/6
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {config.galleryImages.map((img, index) => (
            <div key={index} className="relative group aspect-square bg-background/50 rounded-lg border border-border/50 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleGalleryRemove(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {config.galleryImages.length < 6 && (
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-background/30">
              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
              <span className="text-[10px] text-muted-foreground">Añadir</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = URL.createObjectURL(file)
                    handleGalleryAdd(url)
                  }
                }}
              />
            </label>
          )}
        </div>

        {activeTab === "url" && config.galleryImages.length < 6 && (
          <div className="flex gap-2">
            <Input
              id="gallery-url"
              placeholder="Pega la URL de la imagen..."
              className="bg-background/50 border-border/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = e.target as HTMLInputElement
                  handleGalleryAdd(input.value)
                  input.value = ""
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.getElementById("gallery-url") as HTMLInputElement
                handleGalleryAdd(input.value)
                input.value = ""
              }}
            >
              Añadir
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}