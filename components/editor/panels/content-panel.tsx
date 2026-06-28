'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import type { TemplateConfig } from '@/lib/templates';

interface ContentPanelProps {
  config: TemplateConfig;
  updateConfig: (updates: Partial<TemplateConfig>) => void;
}

export function ContentPanel({ config, updateConfig }: ContentPanelProps) {
  const handleChange = (key: keyof typeof config.content, value: string) => {
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
        Edit the text content and images for your website.
      </p>

      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={config.content.businessName}
          onChange={(e) => handleChange('businessName', e.target.value)}
          placeholder="Your Business Name"
        />
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline / Hero Title</Label>
        <Input
          id="tagline"
          value={config.content.tagline}
          onChange={(e) => handleChange('tagline', e.target.value)}
          placeholder="Your amazing tagline"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={config.content.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your business..."
          rows={3}
        />
      </div>

      {/* CTA Text */}
      <div className="space-y-2">
        <Label htmlFor="ctaText">Call to Action Button</Label>
        <Input
          id="ctaText"
          value={config.content.ctaText}
          onChange={(e) => handleChange('ctaText', e.target.value)}
          placeholder="Get Started"
        />
      </div>

      {/* About Text */}
      <div className="space-y-2">
        <Label htmlFor="aboutText">About Section</Label>
        <Textarea
          id="aboutText"
          value={config.content.aboutText}
          onChange={(e) => handleChange('aboutText', e.target.value)}
          placeholder="Tell your story..."
          rows={4}
        />
      </div>

      {/* Image Uploads */}
      <div className="space-y-3">
        <Label>Images</Label>
        <div className="grid gap-3">
          {['Logo', 'Banner', 'Gallery'].map((type) => (
            <Button
              key={type}
              variant="outline"
              className="w-full justify-start h-auto py-3"
            >
              <Upload className="w-4 h-4 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium">Upload {type}</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
