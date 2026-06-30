import { useState, useEffect, useMemo } from 'react';
import { Download, FileJson } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { JsonTreeView } from '../components/JsonTreeView';

export function JsonFormatter() {
  const [input, setInput] = useState('{\n  "hello": "world",\n  "tools": ["formatter", "regex", "cron"]\n}');
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState<{ message: string, line?: number } | null>(null);
  
  const [indent, setIndent] = useState<number | string>(2);
  const [minify, setMinify] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text');

  // Debounced parsing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setParsed(null);
        setError(null);
        return;
      }
      try {
        const result = JSON.parse(input);
        setParsed(result);
        setError(null);
      } catch (err: any) {
        setParsed(null);
        let message = err.message;
        let line: number | undefined;
        
        // Extract position to calculate line number
        const match = message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1], 10);
          const textUntilError = input.substring(0, pos);
          line = (textUntilError.match(/\n/g) || []).length + 1;
        }
        setError({ message, line });
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [input]);

  const output = useMemo(() => {
    if (!parsed) return '';
    return JSON.stringify(parsed, null, minify ? 0 : indent);
  }, [parsed, minify, indent]);

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full h-[calc(100vh-140px)] gap-4">
      <div className="flex-none">
        <h1 className="text-2xl font-bold font-sans flex items-center gap-2">
          <FileJson className="text-primary" />
          JSON Formatter & Validator
        </h1>
        <p className="text-muted-foreground mt-1">
          Format, minify, and validate JSON data instantly. All processing happens locally in your browser.
        </p>
      </div>

      <div className="flex-none flex flex-wrap items-center gap-4 bg-card border rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-2 border-r pr-4">
          <span className="text-sm font-medium">Indent:</span>
          <select 
            value={indent.toString()} 
            onChange={(e) => setIndent(e.target.value === 'tab' ? '\t' : Number(e.target.value))}
            className="h-8 rounded-md border bg-background px-2 text-sm disabled:opacity-50"
            disabled={minify || viewMode === 'tree'}
          >
            <option value="2">2 Spaces</option>
            <option value="4">4 Spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>
        
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input 
            type="checkbox" 
            checked={minify} 
            onChange={(e) => setMinify(e.target.checked)}
            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            disabled={viewMode === 'tree'}
          />
          Minify
        </label>

        <div className="flex items-center gap-2 border-l pl-4 ml-auto">
          <span className="text-sm font-medium">View:</span>
          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode('text')}
              className={`px-3 py-1 text-sm font-medium rounded-l-md transition-colors ${viewMode === 'text' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
            >
              Text
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 text-sm font-medium rounded-r-md transition-colors ${viewMode === 'tree' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
              disabled={!parsed}
            >
              Tree
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Input Pane */}
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-card shadow-sm min-h-[300px]">
          <div className="h-10 border-b flex items-center px-4 bg-muted/50 font-medium text-sm text-muted-foreground">
            Input JSON
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="flex-1 w-full p-4 bg-transparent font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
            spellCheck={false}
          />
        </div>

        {/* Output Pane */}
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-card shadow-sm min-h-[300px]">
          <div className="h-10 border-b flex items-center px-4 bg-muted/50 justify-between">
            <span className="font-medium text-sm text-muted-foreground">
              {error ? <span className="text-destructive">Invalid JSON</span> : <span className="text-green-500 dark:text-green-400">Valid JSON</span>}
            </span>
            {!error && (
              <div className="flex items-center gap-1">
                <CopyButton text={output} />
                <button
                  onClick={handleDownload}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                  title="Download .json"
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 relative overflow-hidden bg-background">
            {error ? (
              <div className="p-4 text-destructive font-mono text-sm">
                <p className="font-bold mb-2">Parse Error:</p>
                <p>{error.message}</p>
                {error.line && <p className="mt-2 text-muted-foreground">Approximate location: Line {error.line}</p>}
              </div>
            ) : viewMode === 'tree' ? (
              <JsonTreeView data={parsed} />
            ) : (
              <textarea
                readOnly
                value={output}
                className="w-full h-full p-4 bg-transparent font-mono text-sm resize-none focus:outline-none text-foreground"
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
