"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { TemplateConfig } from "@/lib/templates";

interface ColorPanelProps {
  config: TemplateConfig;
  updateConfig: (
    updates: Partial<TemplateConfig>
  ) => void;
}

const colorFields = [
  {
    key: "primary",
    label: "Color principal",
  },
  {
    key: "secondary",
    label: "Color secundario",
  },
  {
    key: "background",
    label: "Color de fondo",
  },
  {
    key: "text",
    label: "Color del texto",
  },
  {
    key: "button",
    label: "Color del botón",
  },
] as const;

const colorPresets = [
  {
    name: "Moderno",
    primary: "#8b5cf6",
    secondary: "#1e1b4b",
    background: "#ffffff",
    text: "#111827",
    button: "#ef4444",
  },
  {
    name: "Profesional",
    primary: "#3b82f6",
    secondary: "#1e3a5f",
    background: "#f8fafc",
    text: "#0f172a",
    button: "#22c55e",
  },
  {
    name: "Creativo",
    primary: "#f59e0b",
    secondary: "#451a03",
    background: "#fff7ed",
    text: "#292524",
    button: "#ec4899",
  },
  {
    name: "Natural",
    primary: "#10b981",
    secondary: "#064e3b",
    background: "#f0fdf4",
    text: "#14532d",
    button: "#6366f1",
  },
];

export function ColorPanel({
  config,
  updateConfig,
}: ColorPanelProps) {
  const handleColorChange = (
    key: keyof typeof config.colors,
    value: string
  ) => {
    updateConfig({
      colors: {
        ...config.colors,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Personaliza la combinación de colores de tu sitio web.
        Los cambios se reflejan en tiempo real.
      </p>

      <div className="space-y-4">
        {colorFields.map(({ key, label }) => {
          const selectedColor =
            config.colors[key];

          return (
            <div
              key={key}
              className="space-y-2 rounded-lg border border-border/50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <Label
                  htmlFor={key}
                  className="text-sm font-semibold"
                  style={{
                    color: selectedColor,
                  }}
                >
                  {label}
                </Label>

                <span
                  className="rounded-md border bg-background px-2 py-1 font-mono text-xs font-semibold uppercase"
                  style={{
                    color: selectedColor,
                    borderColor: selectedColor,
                  }}
                >
                  {selectedColor}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label
                  htmlFor={`picker-${key}`}
                  className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border shadow-sm"
                  style={{
                    backgroundColor:
                      selectedColor,
                  }}
                >
                  <input
                    id={`picker-${key}`}
                    type="color"
                    value={selectedColor}
                    onChange={(event) =>
                      handleColorChange(
                        key,
                        event.target.value
                      )
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label={`Seleccionar ${label}`}
                  />
                </label>

                <Input
                  id={key}
                  value={selectedColor}
                  maxLength={7}
                  placeholder="#000000"
                  onChange={(event) =>
                    handleColorChange(
                      key,
                      event.target.value
                    )
                  }
                  className="font-mono text-sm font-semibold uppercase"
                  style={{
                    color: selectedColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 border-t border-border/50 pt-5">
        <div>
          <Label className="text-sm font-semibold">
            Preajustes rápidos
          </Label>

          <p className="mt-1 text-xs text-muted-foreground">
            Selecciona una combinación completa de colores.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {colorPresets.map(
            (preset) => (
              <button
                key={preset.name}
                type="button"
                className="overflow-hidden rounded-lg border border-border text-left transition-all hover:border-primary hover:shadow-md"
                onClick={() =>
                  updateConfig({
                    colors: {
                      ...config.colors,
                      primary:
                        preset.primary,
                      secondary:
                        preset.secondary,
                      background:
                        preset.background,
                      text: preset.text,
                      button:
                        preset.button,
                    },
                  })
                }
              >
                <div className="flex h-12 w-full">
                  <div
                    className="flex-1"
                    style={{
                      backgroundColor:
                        preset.primary,
                    }}
                  />

                  <div
                    className="flex-1"
                    style={{
                      backgroundColor:
                        preset.secondary,
                    }}
                  />

                  <div
                    className="flex-1"
                    style={{
                      backgroundColor:
                        preset.background,
                    }}
                  />

                  <div
                    className="flex-1"
                    style={{
                      backgroundColor:
                        preset.text,
                    }}
                  />

                  <div
                    className="flex-1"
                    style={{
                      backgroundColor:
                        preset.button,
                    }}
                  />
                </div>

                <div className="p-2">
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: preset.primary,
                    }}
                  >
                    {preset.name}
                  </span>
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}