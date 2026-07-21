'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Grid,
  LayoutGrid,
  Dumbbell,
  UtensilsCrossed,
  Cpu,
  ShoppingBag,
  GraduationCap,
  Heart,
  Briefcase,
} from 'lucide-react';
import { categories } from '@/lib/templates';
import { TemplateCard } from '@/components/template-card';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  Grid: Grid,
  Dumbbell: Dumbbell,
  UtensilsCrossed: UtensilsCrossed,
  Cpu: Cpu,
  ShoppingBag: ShoppingBag,
  GraduationCap: GraduationCap,
  Heart: Heart,
  Briefcase: Briefcase,
};

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');

  // NUEVO: plantillas reales desde la base de datos
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      const res = await fetch('/api/plantillas');
      const data = await res.json();

      // Normalizamos los campos que vienen de MySQL para que
      // coincidan con lo que espera TemplateCard
      const normalizadas = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        price: Number(row.price),
        description: row.description || '',
        image: row.image_url || row.image || '',
        rating: row.rating ?? 5,
        reviews: row.reviews ?? 0,
        featured: row.featured ?? false,
        tags: row.tags ?? [],
        folder: row.folder || null,
      }));

      setTemplates(normalizadas);
    } catch (error) {
      console.error('Error cargando plantillas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates
      .filter((template) => {
        const matchesSearch =
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'all' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price') return a.price - b.price;
        return b.reviews - a.reviews;
      });
  }, [searchQuery, selectedCategory, sortBy, templates]);

  const featuredTemplates = templates.filter((t) => t.featured);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-balance">
                Encuentra tu{' '}
                <span className="text-gradient">Plantilla Perfecta</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Explora nuestra colección de plantillas web premium. Personaliza y lanza
                el sitio web de tus sueños en cuestión de minutos.
              </p>
            </motion.div>

            {/* Search & Filters */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar plantillas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border/50 text-base"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={sortBy === 'rating' ? 'default' : 'outline'}
                  onClick={() => setSortBy('rating')}
                  className="h-12"
                >
                  Mejor Calificadas
                </Button>
                <Button
                  variant={sortBy === 'price' ? 'default' : 'outline'}
                  onClick={() => setSortBy('price')}
                  className="h-12"
                >
                  Precio
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            {/* Categories */}
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {categories.map((category) => {
                const Icon = iconMap[category.icon] || Grid;
                const isActive = selectedCategory === category.id;
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name === 'All Templates' ? 'Todas las Plantillas' : 
                     category.name === 'Gym & Fitness' ? 'Gimnasio y Fitness' :
                     category.name === 'Restaurant' ? 'Restaurantes' :
                     category.name === 'Technology' ? 'Tecnología' :
                     category.name === 'Ecommerce' ? 'Comercio Electrónico' :
                     category.name === 'Education' ? 'Educación' :
                     category.name === 'Healthcare' ? 'Salud y Bienestar' :
                     category.name === 'Business' ? 'Negocios' : category.name}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Loading state */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Cargando plantillas...
              </div>
            ) : (
              <>
                {/* Featured Section */}
                {selectedCategory === 'all' && !searchQuery && featuredTemplates.length > 0 && (
                  <motion.section
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">Plantillas Destacadas</h2>
                      <Badge variant="secondary" className="text-xs">
                        {featuredTemplates.length} {featuredTemplates.length === 1 ? 'plantilla' : 'plantillas'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {featuredTemplates.map((template, index) => (
                        <motion.div
                          key={template.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <TemplateCard template={template} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* All Templates */}
                <motion.section
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">
                      {selectedCategory === 'all' ? 'Todas las Plantillas' : 
                       selectedCategory === 'gym-fitness' ? 'Gimnasio y Fitness' :
                       selectedCategory === 'restaurant' ? 'Restaurantes' :
                       selectedCategory === 'technology' ? 'Tecnología' :
                       selectedCategory === 'ecommerce' ? 'Comercio Electrónico' :
                       selectedCategory === 'education' ? 'Educación' :
                       selectedCategory === 'healthcare' ? 'Salud y Bienestar' :
                       selectedCategory === 'business' ? 'Negocios' :
                       categories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {filteredTemplates.length} {filteredTemplates.length === 1 ? 'plantilla' : 'plantillas'}
                    </Badge>
                  </div>
                  
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-12">
                      <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No se encontraron plantillas</h3>
                      <p className="text-muted-foreground">
                        Prueba a ajustar tu búsqueda o los filtros
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {filteredTemplates.map((template, index) => (
                        <motion.div
                          key={template.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                        >
                          <TemplateCard template={template} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}