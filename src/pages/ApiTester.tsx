import { useState, useEffect } from 'react';
import { Globe, Play, History, Trash2, AlertTriangle } from 'lucide-react';
import { JsonTreeView } from '../components/JsonTreeView';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestHistory {
  id: string;
  method: HttpMethod;
  url: string;
  timestamp: number;
}

interface Header {
  key: string;
  value: string;
}

export function ApiTester() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [history, setHistory] = useState<RequestHistory[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('apiHistory');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveHistory = (newEntry: Omit<RequestHistory, 'id' | 'timestamp'>) => {
    const entry: RequestHistory = {
      ...newEntry,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    };
    const newHistory = [entry, ...history.slice(0, 19)]; // Keep last 20
    setHistory(newHistory);
    localStorage.setItem('apiHistory', JSON.stringify(newHistory));
  };

  const handleSend = async () => {
    if (!url) return;
    setLoading(true);
    setResponse(null);
    
    saveHistory({ method, url });

    const startTime = performance.now();
    try {
      const fetchHeaders: Record<string, string> = {};
      headers.forEach(h => {
        if (h.key.trim() && h.value.trim()) {
          fetchHeaders[h.key.trim()] = h.value.trim();
        }
      });

      const options: RequestInit = {
        method,
        headers: fetchHeaders,
      };

      if (method !== 'GET' && method !== 'HEAD' && body) {
        options.body = body;
        if (!fetchHeaders['Content-Type']) {
          fetchHeaders['Content-Type'] = 'application/json';
        }
      }

      const res = await fetch(url, options);
      const time = Math.round(performance.now() - startTime);
      
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      let resBody: any;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        resBody = await res.json();
      } else {
        resBody = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time,
        headers: resHeaders,
        body: resBody,
        isError: !res.ok
      });
    } catch (err: any) {
      const time = Math.round(performance.now() - startTime);
      setResponse({
        isNetworkError: true,
        message: err.message || 'Failed to fetch. This may be due to CORS restrictions.',
        time
      });
    } finally {
      setLoading(false);
    }
  };

  const updateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = val;
    if (index === newHeaders.length - 1 && (newHeaders[index].key || newHeaders[index].value)) {
      newHeaders.push({ key: '', value: '' });
    }
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((_, i) => i !== index));
    } else {
      setHeaders([{ key: '', value: '' }]);
    }
  };

  return (
    <div className="flex flex-col h-full h-[calc(100vh-140px)] gap-4">
      <div className="flex-none">
        <h1 className="text-2xl font-bold font-sans flex items-center gap-2">
          <Globe className="text-primary" />
          API Request Tester
        </h1>
        <p className="text-muted-foreground mt-1">
          Send HTTP requests directly from your browser.
        </p>
      </div>

      <div className="flex-none bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>
          <strong>CORS Warning:</strong> Since this runs client-side, the browser enforces Cross-Origin Resource Sharing (CORS). Requests to APIs that don't explicitly allow your origin will fail with a Network Error. 
        </p>
      </div>

      <div className="flex-none flex items-center gap-2">
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
          className="h-10 rounded-md border bg-card px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary w-28"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
        
        <input 
          type="url" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/users"
          className="flex-1 h-10 rounded-md border bg-card px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        
        <button 
          onClick={handleSend}
          disabled={loading || !url}
          className="h-10 px-4 bg-primary text-primary-foreground font-medium rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Play size={16} />
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Left Column: Request Config */}
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
            <div className="h-10 border-b flex items-center px-4 bg-muted/50 font-medium text-sm text-muted-foreground">
              Headers
            </div>
            <div className="p-4 space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Key" 
                    value={h.key}
                    onChange={(e) => updateHeader(i, 'key', e.target.value)}
                    className="flex-1 h-8 rounded border bg-background px-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input 
                    type="text" 
                    placeholder="Value" 
                    value={h.value}
                    onChange={(e) => updateHeader(i, 'value', e.target.value)}
                    className="flex-1 h-8 rounded border bg-background px-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button 
                    onClick={() => removeHeader(i)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[200px]">
            <div className="h-10 border-b flex items-center px-4 bg-muted/50 font-medium text-sm text-muted-foreground">
              Body
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={method === 'GET' || method === 'HEAD'}
              placeholder={method === 'GET' ? 'Body not allowed for GET requests' : '{\n  "key": "value"\n}'}
              className="flex-1 w-full p-4 bg-transparent font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Column: Response */}
        <div className="flex-1 flex flex-col gap-4 overflow-auto">
          {response ? (
            response.isNetworkError ? (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-6 flex flex-col items-center justify-center text-center h-full">
                <AlertTriangle size={32} className="mb-4 opacity-80" />
                <h3 className="font-bold text-lg mb-2">Network Error</h3>
                <p className="text-sm max-w-md">{response.message}</p>
                <div className="mt-4 text-xs font-mono opacity-70">Time: {response.time}ms</div>
              </div>
            ) : (
              <div className="flex-1 bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="h-10 border-b flex items-center px-4 bg-muted/50 justify-between">
                  <div className="flex items-center gap-4 text-sm font-medium">
                    <span className={response.isError ? 'text-destructive' : 'text-green-500 dark:text-green-400'}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-muted-foreground">{response.time}ms</span>
                  </div>
                </div>
                <div className="p-4 border-b bg-background overflow-x-auto">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response Headers</h4>
                  <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 font-mono text-xs">
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k} className="contents">
                        <span className="text-primary">{k}:</span>
                        <span className="text-foreground break-all">{v as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 bg-background relative overflow-hidden">
                  {typeof response.body === 'object' ? (
                    <JsonTreeView data={response.body} />
                  ) : (
                    <textarea
                      readOnly
                      value={response.body}
                      className="w-full h-full p-4 bg-transparent font-mono text-sm resize-none focus:outline-none text-foreground"
                    />
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 border rounded-lg border-dashed flex flex-col items-center justify-center text-muted-foreground">
              <Globe size={48} className="mb-4 opacity-20" />
              <p>Send a request to see the response here.</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-card border rounded-lg shadow-sm max-h-[200px] flex flex-col">
              <div className="h-10 border-b flex items-center px-4 bg-muted/50 font-medium text-sm text-muted-foreground flex-none">
                <History size={16} className="mr-2" /> History
              </div>
              <div className="overflow-auto p-2">
                {history.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMethod(item.method);
                      setUrl(item.url);
                    }}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent flex items-center gap-3"
                  >
                    <span className={`font-mono text-xs font-bold w-12 ${item.method === 'GET' ? 'text-blue-500' : item.method === 'POST' ? 'text-green-500' : item.method === 'DELETE' ? 'text-red-500' : 'text-orange-500'}`}>
                      {item.method}
                    </span>
                    <span className="font-mono text-xs truncate flex-1 text-muted-foreground">{item.url}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
