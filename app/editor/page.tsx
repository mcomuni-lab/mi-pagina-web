'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Palette,
  Type,
  Image as ImageIcon,
  Layers,
  Share2,
  Settings,
  Save,
  Eye,
  Send,
  Download,
  ChevronLeft,
  Undo,
  Redo,
  Monitor,
  Tablet,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import { templates, defaultConfig, type TemplateConfig } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EditorSidebar } from '@/components/editor/editor-sidebar';
import { EditorPreview } from '@/components/editor/editor-preview';
import { ColorPanel } from '@/components/editor/panels/color-panel';
import { TypographyPanel } from '@/components/editor/panels/typography-panel';
import { ContentPanel } from '@/components/editor/panels/content-panel';
import { SectionsPanel } from '@/components/editor/panels/sections-panel';
import { SocialPanel } from '@/components/editor/panels/social-panel';
import { ContactPanel } from '@/components/editor/panels/contact-panel';
import { ImagesPanel } from '@/components/editor/panels/images-panel';

type PanelType = 'colors' | 'typography' | 'images' | 'content' | 'sections' | 'social' | 'contact';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const panels = [
  { id: 'colors' as PanelType, label: 'Colores', icon: Palette },
  { id: 'typography' as PanelType, label: 'Tipografía', icon: Type },
  { id: 'images' as PanelType, label: 'Imágenes', icon: ImageIcon },
  { id: 'content' as PanelType, label: 'Contenido', icon: Layers },
  { id: 'sections' as PanelType, label: 'Secciones', icon: Layers },
  { id: 'social' as PanelType, label: 'Redes Sociales', icon: Share2 },
  { id: 'contact' as PanelType, label: 'Contacto', icon: Settings },
];

export default function EditorPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') || 'tech-startup';
  const template = templates.find((t) => t.id === templateId) || templates[0];

  const [config, setConfig] = useState<TemplateConfig>(defaultConfig);
  const [activePanel, setActivePanel] = useState<PanelType>('colors');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isSaving, setIsSaving] = useState(false);

  const updateConfig = useCallback((updates: Partial<TemplateConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/configuraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantilla_id: template.id,
          usuario_email: 'usuario@email.com',
          usuario_nombre: 'Usuario',
          colores: config.colors,
          tipografia: config.typography,
          contenido: config.content,
        }),
      });
      alert('¡Guardado exitosamente!');
    } catch (error) {
      alert('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToTeam = async () => {
    try {
      await fetch('/api/configuraciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantilla_id: template.id,
          usuario_email: 'usuario@email.com',
          usuario_nombre: 'Usuario',
          colores: config.colors,
          tipografia: config.typography,
          contenido: config.content,
          estado: 'pending',
        }),
      });
      alert('¡Configuración enviada al equipo de desarrollo! Se pondrán en contacto contigo en un plazo de 24 horas.');
    } catch (error) {
      alert('Error al enviar');
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'colors':
        return <ColorPanel config={config} updateConfig={updateConfig} />;
      case 'typography':
        return <TypographyPanel config={config} updateConfig={updateConfig} />;
      case 'images':
        return (
          <ImagesPanel
            config={config.images}
            onChange={(images) => updateConfig({ images })}
          />
        );
      case 'content':
        return <ContentPanel config={config} updateConfig={updateConfig} />;
      case 'sections':
        return <SectionsPanel config={config} updateConfig={updateConfig} />;
      case 'social':
        return <SocialPanel config={config} updateConfig={updateConfig} />;
      case 'contact':
        return <ContactPanel config={config} updateConfig={updateConfig} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="h-14 border-b border-border/50 glass flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Atrás
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-sm font-semibold">{template.name}</h1>
            <p className="text-xs text-muted-foreground">Editor Visual</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
            {[
              { id: 'desktop' as ViewportSize, icon: Monitor },
              { id: 'tablet' as ViewportSize, icon: Tablet },
              { id: 'mobile' as ViewportSize, icon: Smartphone },
            ].map(({ id, icon: Icon }) => (
              <Button
                key={id}
                variant={viewport === id ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewport(id)}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Redo className="w-4 h-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Vista previa
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
          <Button className="bg-primary hover:bg-primary/90" size="sm" onClick={handleSendToTeam}>
            <Send className="w-4 h-4 mr-2" />
            Enviar al Equipo
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar
          panels={panels}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />

        <motion.div
          className="w-80 border-r border-border/50 glass overflow-y-auto shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {panels.find((p) => p.id === activePanel)?.icon && (
                <span className="text-primary">
                  {(() => {
                    const Icon = panels.find((p) => p.id === activePanel)?.icon;
                    return Icon ? <Icon className="w-5 h-5" /> : null;
                  })()}
                </span>
              )}
              {panels.find((p) => p.id === activePanel)?.label}
            </h2>
            {renderPanel()}
          </div>
        </motion.div>

        <div className="flex-1 bg-secondary/30 p-4 overflow-auto flex flex-col">
          <div
            className={cn(
              'mx-auto transition-all duration-300',
              viewport === 'desktop' && 'w-full max-w-[1200px]',
              viewport === 'tablet' && 'w-[768px]',
              viewport === 'mobile' && 'w-[375px]'
            )}
            style={{ minHeight: '900px' }}
          >
            <EditorPreview config={config} template={template} />
          </div>
        </div>
      </div>
    </div>
  );
}