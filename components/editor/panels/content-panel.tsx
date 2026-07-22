'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { TemplateConfig } from '@/lib/templates';

interface DynamicTextField {
  key: string;
  label: string;
  originalValue?: string;
  multiline?: boolean;
}

interface ContentPanelProps {
  config: TemplateConfig;
  updateConfig: (updates: Partial<TemplateConfig>) => void;
  dynamicTextFields?: DynamicTextField[];
}

export function ContentPanel({
  config,
  updateConfig,
  dynamicTextFields = [],
}: ContentPanelProps) {
  const handleChange = (key: string, value: string) => {
    updateConfig({
      content: {
        ...config.content,
        [key]: value,
      },
    });
  };

  if (dynamicTextFields.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          No se encontraron textos editables en esta plantilla.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Edita los textos de la plantilla. Los campos aparecen según el orden de
        la página.
      </p>

      {dynamicTextFields.map((field) => {
        const value =
          config.content[field.key] ?? field.originalValue ?? '';

        const shouldUseTextarea =
          field.multiline ||
          value.length > 80 ||
          /description|descripcion|about|texto|text|paragraph|contenido/i.test(
            field.key
          );

        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>

            {shouldUseTextarea ? (
              <Textarea
                id={field.key}
                value={value}
                onChange={(event) =>
                  handleChange(field.key, event.target.value)
                }
                placeholder={field.label}
                rows={4}
              />
            ) : (
              <Input
                id={field.key}
                value={value}
                onChange={(event) =>
                  handleChange(field.key, event.target.value)
                }
                placeholder={field.label}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}