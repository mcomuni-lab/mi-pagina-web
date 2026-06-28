'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Image,
  BarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const adminItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/compras', label: 'Historial Compras', icon: ShoppingCart },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/plantillas', label: 'Plantillas', icon: Image },
  { href: '/admin/ingresos', label: 'Ingresos', icon: BarChart2 },
];

export function SidebarAdmin() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className={cn(
        'flex flex-col h-screen sticky top-0 bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-border/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            className="text-xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Admin Panel
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {adminItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/15 text-primary'
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

      {/* Logout */}
      <div className="p-3 border-t border-border/50">
        <Link href="/">
          <motion.div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            whileHover={{ x: 4 }}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </motion.div>
        </Link>
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