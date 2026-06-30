'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { fontOptions, type TemplateConfig } from '@/lib/templates';

interface TypographyPanelProps {
  config: TemplateConfig;
  updateConfig: (updates: Partial<TemplateConfig>) => void;
}

const fontWeights = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
];

export function TypographyPanel({ config, updateConfig }: TypographyPanelProps) {
  const handleChange = (key: keyof typeof config.typography, value: string) => {
    updateConfig({
      typography: {
        ...config.typography,
        [key]: value,
      },
    });
  };

  const fontSize = parseInt(config.typography.fontSize);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Configure the typography settings for your website.
      </p>

      {/* Font Family */}
      <div className="space-y-2">
        <Label htmlFor="fontFamily">Font Family</Label>
        <Select
          value={config.typography.fontFamily}
          onValueChange={(value) => handleChange('fontFamily', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((font) => (
              <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Base Font Size</Label>
          <span className="text-sm text-muted-foreground">{config.typography.fontSize}</span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={([value]) => handleChange('fontSize', `${value}px`)}
          min={12}
          max={24}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>12px</span>
          <span>24px</span>
        </div>
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <Label>Font Weight</Label>
        <Select
          value={config.typography.fontWeight}
          onValueChange={(value) => handleChange('fontWeight', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select weight" />
          </SelectTrigger>
          <SelectContent>
            {fontWeights.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                <span style={{ fontWeight: value }}>{label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview */}
      <div className="space-y-3">
        <Label>Preview</Label>
        <div
          className="p-4 rounded-lg bg-secondary/50 space-y-2"
          style={{
            fontFamily: config.typography.fontFamily,
            fontSize: config.typography.fontSize,
            fontWeight: config.typography.fontWeight,
          }}
        >
          <h3 className="text-lg font-bold">Heading Example</h3>
          <p className="opacity-80">
            This is how your body text will appear on the website.
          </p>
        </div>
      </div>
    </div>
  );
}
