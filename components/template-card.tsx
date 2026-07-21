'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Template } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TemplateCardProps {
  template: Template;
}

// Verifica que el nombre de carpeta sea seguro (sin ../ ni caracteres raros)
function esCarpetaSegura(folder: string | null | undefined): boolean {
  if (!folder) return false;
  return /^[a-zA-Z0-9_-]+$/.test(folder);
}

export function TemplateCard({ template }: TemplateCardProps) {
  const folder = (template as any).folder as string | null | undefined;
  const previewDisponible = esCarpetaSegura(folder);
  const previewUrl = previewDisponible ? `/templates/${folder}/index.html` : '';

  return (
    <motion.div
      className="group relative rounded-xl overflow-hidden glass glass-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={template.image}
          alt={template.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        {template.featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}

        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-sm font-semibold">
          ${template.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {template.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium">{template.rating}</span>
            <span className="text-xs text-muted-foreground">({template.reviews})</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
          {template.name}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/editor?template=${template.id}`} className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Use Template
            </Button>
          </Link>

          {previewDisponible ? (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="px-3">
                Preview
              </Button>
            </a>
          ) : (
            <Button variant="outline" className="px-3" disabled title="Vista previa no disponible">
              Preview
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}