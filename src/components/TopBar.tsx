import { Menu, Moon, Sun, Search } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tools = [
  { name: 'JSON Formatter', path: '/json-formatter' },
  { name: 'Regex Tester', path: '/regex-tester' },
  { name: 'Cron Builder', path: '/cron-builder' },
  { name: 'Contrast Checker', path: '/contrast-checker' },
  { name: 'API Tester', path: '/api-tester' },
];

export function TopBar({ setMobileOpen }: { setMobileOpen: (open: boolean) => void }) {
  const { isDark, toggleTheme } = useThemeStore();
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const filteredTools = tools.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:h-[60px] md:px-6">
      <button 
        className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-accent rounded-md"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>
      
      <div className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search tools..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
        </div>
        
        {showResults && search && (
          <div className="absolute top-full left-0 mt-1 w-full bg-card border rounded-md shadow-lg py-1 z-50">
            {filteredTools.length > 0 ? (
              filteredTools.map(tool => (
                <button
                  key={tool.path}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    navigate(tool.path);
                    setSearch('');
                    setShowResults(false);
                  }}
                >
                  {tool.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground">No tools found.</div>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
