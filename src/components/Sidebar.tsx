import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { 
  Braces, 
  Regex, 
  Clock, 
  Contrast, 
  Globe,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const tools = [
  { name: 'JSON Formatter', path: '/json-formatter', icon: Braces },
  { name: 'Regex Tester', path: '/regex-tester', icon: Regex },
  { name: 'Cron Builder', path: '/cron-builder', icon: Clock },
  { name: 'Contrast Checker', path: '/contrast-checker', icon: Contrast },
  { name: 'API Tester', path: '/api-tester', icon: Globe },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 border-r bg-card transition-transform md:translate-x-0 md:sticky md:top-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-14 items-center justify-between border-b px-4 md:h-[60px]">
          <NavLink to="/" className="flex items-center gap-2 font-bold font-sans text-lg tracking-tight hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
            <div className="bg-primary text-primary-foreground p-1 rounded">
               <Braces size={20} />
            </div>
            Quietbench
          </NavLink>
          <button className="md:hidden" onClick={() => setMobileOpen(false)}>
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
        
        <div className="py-4">
          <div className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Tools
          </div>
          <nav className="grid gap-1 px-2">
            {tools.map((tool) => (
              <NavLink
                key={tool.path}
                to={tool.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <tool.icon size={18} />
                {tool.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
