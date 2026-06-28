'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Store,
  Palette,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  { href: '/', label: 'Panel de Control', icon: LayoutDashboard },
  { href: '/marketplace', label: 'Mercado de Plantillas', icon: Store },
  { href: '/editor', label: 'Editor Visual', icon: Palette },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

const bottomItems = [
  { href: '/help', label: 'Centro de Ayuda', icon: HelpCircle },
  { href: '/logout', label: 'Cerrar Sesión', icon: LogOut },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 glass border-r transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-border/50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="shrink-0"
        >
          <img
            src="/image/logo-devioz.webp"
            alt="Devioz Logo"
            className={cn(
              'object-contain transition-all duration-300',
              collapsed ? 'w-10 h-10' : 'h-10 w-auto'
            )}
          />
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary glow-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Pro Banner */}
      {!collapsed && (
        <div className="p-3">
          <motion.div
            className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">Mejorar a Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Desbloquea todas las plantillas y funciones premium
            </p>
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
              Actualizar Ahora
            </Button>
          </motion.div>
        </div>
      )}

      {/* Bottom Items */}
      <div className="p-3 border-t border-border/50 space-y-1">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              whileHover={{ x: 4 }}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Collapse Button */}
      <div className="p-3 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span>Contraer menú</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}