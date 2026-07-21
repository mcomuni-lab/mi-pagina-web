'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import type { TemplateConfig } from '@/lib/templates';

interface DynamicTextField {
  key: string;
  label: string;
}

interface ContentPanelProps {
  config: TemplateConfig;
  updateConfig: (updates: Partial<TemplateConfig>) => void;
  dynamicTextFields?: DynamicTextField[];
}

export function ContentPanel({ config, updateConfig, dynamicTextFields = [] }: ContentPanelProps) {
  const handleChange = (key: string, value: string) => {
    updateConfig({
      content: {
        ...config.content,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Edita el contenido de texto e imágenes de tu sitio web.
      </p>

      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="businessName">Nombre del negocio</Label>
        <Input
          id="businessName"
          value={config.content.businessName}
          onChange={(e) => handleChange('businessName', e.target.value)}
          placeholder="El nombre de tu negocio"
        />
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <Label htmlFor="tagline">Lema / título principal</Label>
        <Input
          id="tagline"
          value={config.content.tagline}
          onChange={(e) => handleChange('tagline', e.target.value)}
          placeholder="Tu increíble lema"
        />
      </div>

      {/* Hero Title */}
      <div className="space-y-2">
        <Label htmlFor="heroTitle">Título del hero</Label>
        <Input
          id="heroTitle"
          value={config.content.heroTitle}
          onChange={(e) => handleChange('heroTitle', e.target.value)}
          placeholder="Tu título principal"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={config.content.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe tu negocio..."
          rows={3}
        />
      </div>

      {/* CTA Text */}
      <div className="space-y-2">
        <Label htmlFor="ctaText">Botón de llamada a la acción</Label>
        <Input
          id="ctaText"
          value={config.content.ctaText}
          onChange={(e) => handleChange('ctaText', e.target.value)}
          placeholder="Comenzar"
        />
      </div>

      {/* About Text */}
      <div className="space-y-2">
        <Label htmlFor="aboutText">Sección "Sobre nosotros"</Label>
        <Textarea
          id="aboutText"
          value={config.content.aboutText}
          onChange={(e) => handleChange('aboutText', e.target.value)}
          placeholder="Cuenta tu historia..."
          rows={4}
        />
      </div>

      {/* Banner Title */}
      <div className="space-y-2">
        <Label htmlFor="bannerTitle">Título del banner</Label>
        <Input
          id="bannerTitle"
          value={config.content.bannerTitle}
          onChange={(e) => handleChange('bannerTitle', e.target.value)}
          placeholder="Regístrate ahora"
        />
      </div>

      {/* Banner Subtitle */}
      <div className="space-y-2">
        <Label htmlFor="bannerSubtitle">Subtítulo del banner</Label>
        <Input
          id="bannerSubtitle"
          value={config.content.bannerSubtitle}
          onChange={(e) => handleChange('bannerSubtitle', e.target.value)}
          placeholder="Donde la salud y el fitness se unen"
        />
      </div>

      {/* Banner Button Text */}
      <div className="space-y-2">
        <Label htmlFor="bannerButtonText">Texto del botón del banner</Label>
        <Input
          id="bannerButtonText"
          value={config.content.bannerButtonText}
          onChange={(e) => handleChange('bannerButtonText', e.target.value)}
          placeholder="Cita"
        />
      </div>

      {dynamicTextFields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            value={config.content[field.key] ?? ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.label}
          />
        </div>
      ))}

      {/* Image Uploads */}
      <div className="space-y-3">
        <Label>Imágenes</Label>
        <div className="grid gap-3">
          {['Logo', 'Banner', 'Gallery'].map((type) => (
            <Button
              key={type}
              variant="outline"
              className="w-full justify-start h-auto py-3"
            >
              <Upload className="w-4 h-4 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium">Subir {type}</p>
                <p className="text-xs text-muted-foreground">PNG, JPG de hasta 5MB</p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
