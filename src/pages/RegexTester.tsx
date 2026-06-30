import { useState, useEffect, useRef } from 'react';
import { Regex, Code } from 'lucide-react';
import { cn } from '../lib/utils';

const PRESETS = [
  { name: 'Email Address', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'g' },
  { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'g' },
  { name: 'Phone Number (US)', pattern: '^\\+?1?\\s*\\(?-*\\.*(\\d{3})\\)?\\.*-*\\s*(\\d{3})\\.*-*\\s*(\\d{4})$', flags: 'g' },
  { name: 'IPv4 Address', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', flags: 'g' },
  { name: 'Hex Color', pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$', flags: 'g' },
];

const FLAGS = [
  { id: 'g', label: 'Global', desc: 'Match all' },
  { id: 'i', label: 'Case Insensitive', desc: 'Ignore case' },
  { id: 'm', label: 'Multiline', desc: '^ and $ match lines' },
  { id: 's', label: 'Dotall', desc: '. matches newlines' },
  { id: 'u', label: 'Unicode', desc: 'Treat pattern as unicode' },
  { id: 'y', label: 'Sticky', desc: 'Match from lastIndex' },
];

// Simple regex explainer
function explainRegex(pattern: string) {
  if (!pattern) return "Enter a regular expression to see its explanation.";
  const explanations = [];
  if (pattern.includes('^')) explanations.push(<li key="start"><code>^</code> Matches the start of the string.</li>);
  if (pattern.includes('$')) explanations.push(<li key="end"><code>$</code> Matches the end of the string.</li>);
  if (pattern.includes('\\d')) explanations.push(<li key="d"><code>\d</code> Matches any digit (0-9).</li>);
  if (pattern.includes('\\w')) explanations.push(<li key="w"><code>\w</code> Matches any word character (a-z, A-Z, 0-9, _).</li>);
  if (pattern.includes('\\s')) explanations.push(<li key="s"><code>\s</code> Matches any whitespace character.</li>);
  if (pattern.includes('+')) explanations.push(<li key="plus"><code>+</code> Matches 1 or more of the preceding token.</li>);
  if (pattern.includes('*')) explanations.push(<li key="star"><code>*</code> Matches 0 or more of the preceding token.</li>);
  if (pattern.includes('?')) explanations.push(<li key="question"><code>?</code> Matches 0 or 1 of the preceding token (optional).</li>);
  if (pattern.match(/\[.*?\]/)) explanations.push(<li key="charset"><code>[...]</code> Character set: matches any character inside the brackets.</li>);
  if (pattern.match(/\(.*?\)/)) explanations.push(<li key="group"><code>(...)</code> Capture group: isolates part of the match.</li>);
  
  if (explanations.length === 0) {
    return "Simple character matching.";
  }
  return <ul className="list-disc pl-4 space-y-1">{explanations}</ul>;
}

export function RegexTester() {
  const [pattern, setPattern] = useState('[A-Z]\\w+');
  const [flags, setFlags] = useState(['g']);
  const [testString, setTestString] = useState('Hello World! This is a Test String with some Capitalized words.');
  
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [regexError, setRegexError] = useState<string | null>(null);

  const handleFlagToggle = (flag: string) => {
    setFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);
  };

  useEffect(() => {
    if (!pattern) {
      setMatches([]);
      setRegexError(null);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags.join(''));
      setRegexError(null);
      
      if (!testString) {
        setMatches([]);
        return;
      }

      const results = [];
      if (flags.includes('g')) {
        let match;
        // reset lastIndex to prevent infinite loops if something goes wrong
        let preventLoop = 0;
        while ((match = regex.exec(testString)) !== null && preventLoop < 1000) {
          results.push(match);
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
          preventLoop++;
        }
      } else {
        const match = regex.exec(testString);
        if (match) results.push(match);
      }
      setMatches(results);
    } catch (e: any) {
      setRegexError(e.message);
      setMatches([]);
    }
  }, [pattern, flags, testString]);

  // Generate highlighted text elements
  const renderHighlightedText = () => {
    if (regexError || !pattern || matches.length === 0) {
      return testString;
    }

    const elements = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      const start = match.index!;
      const end = start + match[0].length;

      if (start > lastIndex) {
        elements.push(<span key={`text-${i}`}>{testString.substring(lastIndex, start)}</span>);
      }

      elements.push(
        <mark key={`mark-${i}`} className="bg-primary/30 text-primary-foreground rounded-sm px-0.5">
          {match[0]}
        </mark>
      );
      lastIndex = end;
    });

    if (lastIndex < testString.length) {
      elements.push(<span key="text-end">{testString.substring(lastIndex)}</span>);
    }

    return elements;
  };

  // Sync scroll between textarea and highlight overlay
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto">
      <div className="flex-none">
        <h1 className="text-2xl font-bold font-sans flex items-center gap-2">
          <Regex className="text-primary" />
          Regex Tester
        </h1>
        <p className="text-muted-foreground mt-1">
          Test regular expressions with live highlighting and plain-English explanations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          {/* Pattern Input */}
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <label className="block text-sm font-medium mb-2">Regular Expression</label>
            <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-2 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              <span className="text-muted-foreground font-mono">/</span>
              <input 
                type="text" 
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none font-mono text-foreground"
                placeholder="pattern"
              />
              <span className="text-muted-foreground font-mono">/</span>
              <span className="text-primary font-mono ml-1">{flags.join('')}</span>
            </div>
            
            {regexError && (
              <div className="text-destructive text-sm mt-2 font-mono">
                Error: {regexError}
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-4">
              {FLAGS.map(f => (
                <label key={f.id} className="flex items-center gap-2 text-sm cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={flags.includes(f.id)}
                    onChange={() => handleFlagToggle(f.id)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-mono text-muted-foreground group-hover:text-foreground transition-colors">{f.id}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">({f.label})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Test String area with overlay */}
          <div className="flex-1 flex flex-col bg-card border rounded-lg shadow-sm overflow-hidden min-h-[250px]">
            <div className="h-10 border-b flex items-center px-4 bg-muted/50 font-medium text-sm text-muted-foreground justify-between">
              Test String
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {matches.length} match{matches.length !== 1 && 'es'}
              </span>
            </div>
            <div className="relative flex-1 bg-background">
              {/* Highlight layer */}
              <div 
                ref={highlightRef}
                className="absolute inset-0 p-4 font-mono text-sm whitespace-pre-wrap break-words overflow-auto pointer-events-none text-transparent"
                aria-hidden="true"
              >
                {renderHighlightedText()}
              </div>
              {/* Actual textarea */}
              <textarea
                ref={textareaRef}
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full p-4 font-mono text-sm bg-transparent text-foreground whitespace-pre-wrap break-words resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          {/* Explanation */}
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
              <Code size={16} className="text-primary" />
              Pattern Explanation
            </h3>
            <div className="text-sm text-muted-foreground">
              {explainRegex(pattern)}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-card border rounded-lg p-4 shadow-sm flex-1 overflow-auto max-h-[400px]">
            <h3 className="font-semibold text-sm mb-3">Match Results</h3>
            {matches.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No matches found.</p>
            ) : (
              <div className="space-y-3">
                {matches.slice(0, 50).map((match, i) => (
                  <div key={i} className="border rounded-md overflow-hidden text-sm">
                    <div className="bg-muted/50 px-3 py-1 border-b flex justify-between font-mono text-xs text-muted-foreground">
                      <span>Match {i + 1}</span>
                      <span>Index: {match.index}</span>
                    </div>
                    <div className="p-2 font-mono break-all bg-background">
                      {match[0]}
                    </div>
                    {match.length > 1 && (
                      <div className="px-2 pb-2 bg-background space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1 mb-1 font-sans font-semibold">Capture Groups</div>
                        {match.slice(1).map((group, j) => (
                          <div key={j} className="flex gap-2 font-mono text-xs">
                            <span className="text-blue-500">Group {j + 1}:</span>
                            <span className="text-foreground">{group || <span className="italic text-muted-foreground">undefined</span>}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {matches.length > 50 && (
                  <div className="text-xs text-center text-muted-foreground py-2">
                    Showing first 50 matches.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-sm mb-3">Cheatsheet / Presets</h3>
            <div className="space-y-2">
              {PRESETS.map((p, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setPattern(p.pattern);
                    setFlags(p.flags.split(''));
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group flex justify-between items-center"
                >
                  <span>{p.name}</span>
                  <span className="font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary">Load</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
