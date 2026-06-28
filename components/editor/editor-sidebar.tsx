'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface Panel {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface EditorSidebarProps {
  panels: Panel[];
  activePanel: string;
  setActivePanel: (panel: string) => void;
}

export function EditorSidebar({ panels, activePanel, setActivePanel }: EditorSidebarProps) {
  return (
    <div className="w-16 border-r border-border/50 glass flex flex-col items-center py-4 gap-2 shrink-0">
      {panels.map((panel) => {
        const isActive = activePanel === panel.id;
        return (
          <motion.div key={panel.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'w-10 h-10 relative',
                isActive && 'bg-primary text-primary-foreground'
              )}
              onClick={() => setActivePanel(panel.id)}
              title={panel.label}
            >
              <panel.icon className="w-5 h-5" />
              {isActive && (
                <motion.div
                  className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full"
                  layoutId="activeIndicator"
                />
              )}
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
