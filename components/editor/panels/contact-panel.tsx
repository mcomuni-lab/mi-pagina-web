'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { TemplateConfig } from '@/lib/templates';

interface ContactPanelProps {
  config: TemplateConfig;
  updateConfig: (updates: Partial<TemplateConfig>) => void;
}

export function ContactPanel({ config, updateConfig }: ContactPanelProps) {
  const handleChange = (key: keyof typeof config.contact, value: string) => {
    updateConfig({
      contact: {
        ...config.contact,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Configure your business contact information. This will be displayed in the contact
        section and footer.
      </p>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={config.contact.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="contact@yourbusiness.com"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          value={config.contact.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Business Address
        </Label>
        <Textarea
          id="address"
          value={config.contact.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="123 Business Street, City, State 12345"
          rows={2}
        />
      </div>

      {/* Preview Card */}
      <div className="space-y-3">
        <Label>Preview</Label>
        <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{config.contact.email || 'No email set'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{config.contact.phone || 'No phone set'}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{config.contact.address || 'No address set'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
