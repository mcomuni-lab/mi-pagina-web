'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  Eye,
  FileText,
  ArrowUpRight,
  Store,
  Palette,
  Sparkles,
  Clock,
  Star,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { templates } from '@/lib/templates';
import Image from 'next/image';

const stats = [
  {
    title: 'Plantillas Disponibles',
    value: '250+',
    change: '+12%',
    icon: FileText,
    color: 'text-primary',
  },
  {
    title: 'Usuarios Activos',
    value: '15.2K',
    change: '+24%',
    icon: Users,
    color: 'text-accent',
  },
  {
    title: 'Sitios Lanzados',
    value: '8,432',
    change: '+18%',
    icon: Zap,
    color: 'text-green-500',
  },
  {
    title: 'Calificación Promedio',
    value: '4.9',
    change: '+2%',
    icon: Star,
    color: 'text-yellow-500',
  },
];

const recentActivity = [
  { action: 'Plantilla comprada', template: 'FitnessPro', time: 'Hace 2 min' },
  { action: 'Diseño guardado', template: 'TechLaunch', time: 'Hace 15 min' },
  { action: 'Solicitud de desarrollo', template: 'Resto Elegance', time: 'Hace 1 hora' },
  { action: 'Vista previa de plantilla', template: 'ShopModern', time: 'Hace 3 horas' },
];

export default function DashboardPage() {
  const featuredTemplates = templates.filter((t) => t.featured).slice(0, 3);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Welcome Section */}
            <motion.div
              className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-balance">
                  Bienvenido de nuevo a{' '}
                  <span className="text-gradient">Devioz</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-6 text-pretty">
                  Crea sitios web increíbles con nuestras plantillas premium. Personaliza, prevé
                  y lanza tu sitio perfecto hoy mismo.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/marketplace">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      <Store className="w-5 h-5 mr-2" />
                      Explorar Plantillas
                    </Button>
                  </Link>
                  <Link href="/editor">
                    <Button size="lg" variant="outline">
                      <Palette className="w-5 h-5 mr-2" />
                      Abrir Editor
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-2xl translate-y-1/2" />
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="glass glass-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className="flex items-center text-sm text-green-500 font-medium">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {stat.change}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-3xl font-bold">{stat.value}</h3>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Featured Templates */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="glass h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Plantillas Destacadas
                    </CardTitle>
                    <Link href="/marketplace">
                      <Button variant="ghost" size="sm">
                        Ver Todas
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {featuredTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        className="flex gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
                        whileHover={{ x: 4 }}
                      >
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={template.image}
                            alt={template.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold group-hover:text-primary transition-colors">
                            {template.name}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center text-sm">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              {template.rating}
                            </span>
                            <span className="text-sm font-medium text-primary">
                              ${template.price}
                            </span>
                          </div>
                        </div>
                        <Link href={`/editor?template=${template.id}`}>
                          <Button size="sm" className="shrink-0">
                            Usar
                          </Button>
                        </Link>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" />
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.template}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {activity.time}
                        </span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Acciones Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Store, label: 'Explorar Plantillas', href: '/marketplace', color: 'from-primary/20 to-primary/5' },
                      { icon: Palette, label: 'Abrir Editor', href: '/editor', color: 'from-accent/20 to-accent/5' },
                      { icon: Eye, label: 'Previsualizar Diseños', href: '/marketplace', color: 'from-blue-500/20 to-blue-500/5' },
                      { icon: FileText, label: 'Ver Propuestas', href: '/', color: 'from-green-500/20 to-green-500/5' },
                    ].map((action) => (
                      <Link key={action.label} href={action.href}>
                        <motion.div
                          className={`p-4 rounded-xl bg-gradient-to-br ${action.color} border border-border/50 hover:border-primary/50 transition-all cursor-pointer group`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <action.icon className="w-8 h-8 mb-3 text-foreground/80 group-hover:text-primary transition-colors" />
                          <p className="font-medium">{action.label}</p>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}