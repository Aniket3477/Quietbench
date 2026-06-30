import { ToolCard } from '../components/ToolCard';
import { Braces, Regex, Clock, Contrast, Globe } from 'lucide-react';

const tools = [
  {
    title: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data instantly. Supports tree view for nested objects.',
    icon: Braces,
    path: '/json-formatter'
  },
  {
    title: 'Regex Tester',
    description: 'Test regular expressions with live highlighting and plain-English explanations.',
    icon: Regex,
    path: '/regex-tester'
  },
  {
    title: 'Cron Builder',
    description: 'Visually build or parse cron schedule expressions. See the next 5 execution times.',
    icon: Clock,
    path: '/cron-builder'
  },
  {
    title: 'Contrast Checker',
    description: 'Check WCAG color contrast ratios with live previews and alternative color suggestions.',
    icon: Contrast,
    path: '/contrast-checker'
  },
  {
    title: 'API Tester',
    description: 'Send HTTP requests directly from your browser to test endpoints and inspect responses.',
    icon: Globe,
    path: '/api-tester'
  }
];

export function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3">Quietbench</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Free developer tools, no signup required. Fast, client-side utilities that run instantly in your browser without sending data to a server.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <ToolCard key={tool.path} {...tool} />
        ))}
      </div>
    </div>
  );
}
