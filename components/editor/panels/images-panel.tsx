"use client";

import { useState } from "react";
import { Upload, Link, Trash2, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface DynamicImageField {
  key: string;
  label: string;
  type: "image" | "background";
  originalValue?: string;
}

interface ImagesConfig {
  galleryImages: string[];
  [key: string]: string | string[];
}

interface ImagesPanelProps {
  config: ImagesConfig;
  dynamicFields?: DynamicImageField[];
  onChange: (config: ImagesConfig) => void;
}

export function ImagesPanel({
  config,
  dynamicFields = [],
  onChange,
}: ImagesPanelProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");

  const fixedFields: DynamicImageField[] = [
    {
      key: "logo",
      label: "Logotipo",
      type: "image",
    },
    {
      key: "banner",
      label: "Imagen del banner",
      type: "background",
    },
    {
      key: "heroImage",
      label: "Imagen principal",
      type: "background",
    },
    {
      key: "aboutImage",
      label: "Imagen de nosotros",
      type: "image",
    },
  ];

  const allFields = [...fixedFields, ...dynamicFields].filter(
    (field, index, fields) =>
      fields.findIndex((item) => item.key === field.key) === index
  );

  const handleImageChange = (key: string, value: string) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const getImageValue = (key: string): string => {
    const value = config[key];

    if (typeof value === "string") {
      return value;
    }

    return "";
  };

  const handleGalleryAdd = (url: string) => {
    const galleryImages = Array.isArray(config.galleryImages)
      ? config.galleryImages
      : [];

    if (!url.trim() || galleryImages.length >= 6) {
      return;
    }

    onChange({
      ...config,
      galleryImages: [...galleryImages, url],
    });
  };

  const handleGalleryRemove = (index: number) => {
    const galleryImages = Array.isArray(config.galleryImages)
      ? config.galleryImages
      : [];

    onChange({
      ...config,
      galleryImages: galleryImages.filter(
        (_image, imageIndex) => imageIndex !== index
      ),
    });
  };

  const galleryImages = Array.isArray(config.galleryImages)
    ? config.galleryImages
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium">
          Imágenes de la plantilla
        </h3>

        <p className="text-xs text-muted-foreground">
          Aquí aparecen automáticamente las imágenes detectadas en la
          plantilla.
        </p>
      </div>

      <div className="flex gap-2 rounded-lg bg-background/50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "upload"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="mr-2 inline-block h-4 w-4" />
          Subir archivo
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === "url"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link className="mr-2 inline-block h-4 w-4" />
          Usar enlace
        </button>
      </div>

      {allFields.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <ImageIcon className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            No se encontraron imágenes editables.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {allFields.map((field) => {
            const currentValue = getImageValue(field.key);

            return (
              <div
                key={field.key}
                className="space-y-2 rounded-lg border border-border/50 p-3"
              >
                <div>
                  <Label htmlFor={`image-${field.key}`}>
                    {field.label}
                  </Label>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {field.type === "background"
                      ? "Imagen utilizada como fondo"
                      : "Imagen visible de la plantilla"}
                  </p>
                </div>

                {activeTab === "upload" ? (
                  <div>
                    {currentValue ? (
                      <div className="relative overflow-hidden rounded-lg border">
                        <img
                          src={currentValue}
                          alt={field.label}
                          className="h-32 w-full object-cover"
                        />

                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2 h-8 w-8"
                          onClick={() =>
                            handleImageChange(field.key, "")
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-background/30 hover:border-primary/50">
                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />

                        <span className="text-xs text-muted-foreground">
                          Haz clic para subir una imagen
                        </span>

                        <input
                          id={`image-${field.key}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];

                            if (!file) {
                              return;
                            }

                            const temporaryUrl =
                              URL.createObjectURL(file);

                            handleImageChange(
                              field.key,
                              temporaryUrl
                            );
                          }}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <Input
                    id={`image-${field.key}`}
                    value={currentValue}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    onChange={(event) =>
                      handleImageChange(
                        field.key,
                        event.target.value
                      )
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3 border-t border-border/50 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <Label>Galería de imágenes</Label>

            <p className="text-xs text-muted-foreground">
              Puedes agregar hasta 6 imágenes.
            </p>
          </div>

          <span className="text-xs text-muted-foreground">
            {galleryImages.length}/6
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {galleryImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border"
            >
              <img
                src={image}
                alt={`Imagen de galería ${index + 1}`}
                className="h-full w-full object-cover"
              />

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleGalleryRemove(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {activeTab === "upload" && galleryImages.length < 6 && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50">
              <Upload className="mb-1 h-5 w-5 text-muted-foreground" />

              <span className="text-[10px] text-muted-foreground">
                Añadir
              </span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  handleGalleryAdd(URL.createObjectURL(file));
                }}
              />
            </label>
          )}
        </div>

        {activeTab === "url" && galleryImages.length < 6 && (
          <div className="flex gap-2">
            <Input
              id="gallery-url"
              placeholder="Pega el enlace de la imagen"
              onKeyDown={(event) => {
                if (event.key !== "Enter") {
                  return;
                }

                const input = event.currentTarget;

                handleGalleryAdd(input.value);
                input.value = "";
              }}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const input = document.getElementById(
                  "gallery-url"
                ) as HTMLInputElement | null;

                if (!input) {
                  return;
                }

                handleGalleryAdd(input.value);
                input.value = "";
              }}
            >
              Añadir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}