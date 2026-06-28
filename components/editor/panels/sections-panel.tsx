'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GripVertical } from 'lucide-react';
import type { TemplateConfig } from '@/lib/templates';

interface SectionsPanelProps {
  config: TemplateConfig;
  updateConfig: (updates: Partial<TemplateConfig>) => void;
}

const sectionsList = [
  { key: 'hero', label: 'Hero Section', description: 'Main banner with title and CTA' },
  { key: 'about', label: 'About Section', description: 'Tell your story' },
  { key: 'services', label: 'Services Section', description: 'Showcase your offerings' },
  { key: 'gallery', label: 'Gallery Section', description: 'Visual showcase' },
  { key: 'testimonials', label: 'Testimonials', description: 'Customer reviews' },
  { key: 'contact', label: 'Contact Section', description: 'Contact information' },
] as const;

export function SectionsPanel({ config, updateConfig }: SectionsPanelProps) {
  const handleToggle = (key: keyof typeof config.sections) => {
    updateConfig({
      sections: {
        ...config.sections,
        [key]: !config.sections[key],
      },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Show or hide sections of your website. Drag to reorder.
      </p>

      <div className="space-y-2">
        {sectionsList.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            </div>
            <Switch
              checked={config.sections[key]}
              onCheckedChange={() => handleToggle(key)}
            />
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> You can drag sections to reorder
          them on your website. Disabled sections will be hidden from visitors.
        </p>
      </div>
    </div>
  );
}
