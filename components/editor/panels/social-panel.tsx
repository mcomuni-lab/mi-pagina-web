'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import type { TemplateConfig } from '@/lib/templates';

interface SocialPanelProps {
  config: TemplateConfig;
  updateConfig: (updates: Partial<TemplateConfig>) => void;
}

const socialFields = [
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourpage' },
  { key: 'tiktok', label: 'TikTok', icon: MessageCircle, placeholder: 'https://tiktok.com/@yourpage' },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: '+1234567890' },
] as const;

export function SocialPanel({ config, updateConfig }: SocialPanelProps) {
  const handleChange = (key: keyof typeof config.social, value: string) => {
    updateConfig({
      social: {
        ...config.social,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Add your social media links. These will appear in the footer and contact sections.
      </p>

      <div className="space-y-4">
        {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {label}
            </Label>
            <Input
              id={key}
              value={config.social[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> Leave fields empty to hide
          specific social links from your website.
        </p>
      </div>
    </div>
  );
}
