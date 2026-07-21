'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { TemplateConfig } from '@/lib/templates';

interface ColorPanelProps {
  config: TemplateConfig;
  updateConfig: (updates: Partial<TemplateConfig>) => void;
}

const colorFields = [
  { key: 'primary', label: 'Color principal' },
  { key: 'secondary', label: 'Color secundario' },
  { key: 'background', label: 'Fondo' },
  { key: 'text', label: 'Color del texto' },
  { key: 'button', label: 'Color del botón' },
] as const;

export function ColorPanel({ config, updateConfig }: ColorPanelProps) {
  const handleColorChange = (key: keyof typeof config.colors, value: string) => {
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
        Personaliza la combinación de colores de tu sitio web. Los cambios se reflejan en tiempo real.
      </p>

      <div className="space-y-4">
        {colorFields.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="text-sm">
              {label}
            </Label>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0"
                style={{ backgroundColor: config.colors[key] }}
              >
                <input
                  type="color"
                  value={config.colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <Input
                id={key}
                value={config.colors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Color Presets */}
      <div className="space-y-3">
        <Label className="text-sm">Preajustes rápidos</Label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { primary: '#8b5cf6', secondary: '#1e1b4b', button: '#ef4444' },
            { primary: '#3b82f6', secondary: '#1e3a5f', button: '#22c55e' },
            { primary: '#f59e0b', secondary: '#451a03', button: '#ec4899' },
            { primary: '#10b981', secondary: '#064e3b', button: '#6366f1' },
          ].map((preset, index) => (
            <button
              key={index}
              className="aspect-square rounded-lg border border-border hover:border-primary transition-colors overflow-hidden"
              onClick={() =>
                updateConfig({
                  colors: {
                    ...config.colors,
                    ...preset,
                  },
                })
              }
            >
              <div className="h-1/2 w-full" style={{ backgroundColor: preset.primary }} />
              <div className="h-1/4 w-full" style={{ backgroundColor: preset.secondary }} />
              <div className="h-1/4 w-full" style={{ backgroundColor: preset.button }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
