import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Toaster } from './Toaster';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Quietbench | Developer Utilities',
      '/json-formatter': 'JSON Formatter - Quietbench',
      '/regex-tester': 'Regex Tester - Quietbench',
      '/cron-builder': 'Cron Builder - Quietbench',
      '/contrast-checker': 'Contrast Checker - Quietbench',
      '/api-tester': 'API Tester - Quietbench',
      '/about': 'About - Quietbench',
      '/contact': 'Contact - Quietbench',
    };
    document.title = titles[location.pathname] || 'Quietbench';
  }, [location]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex flex-1 flex-col">
        <TopBar setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
        <footer className="border-t py-6 md:py-8 px-4 md:px-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Quietbench. Runs entirely in your browser.</p>
            <div className="flex gap-4">
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
