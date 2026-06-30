import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getNextExecutions, describeCronExpression } from '../lib/cronUtils';

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily at midnight', expr: '0 0 * * *' },
  { label: 'Every Monday', expr: '0 0 * * 1' },
];

export function CronBuilder() {
  const [expression, setExpression] = useState('0 * * * *');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');

  useEffect(() => {
    try {
      const runs = getNextExecutions(expression, 5);
      const formattedRuns = runs.map(d => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      });
      setNextRuns(formattedRuns);
      setError(null);
      setExplanation(describeCronExpression(expression));
    } catch (err: any) {
      setError(err.message);
      setNextRuns([]);
      setExplanation('');
    }
  }, [expression]);

  const parts = expression.trim().split(/\s+/);
  const isSixFields = parts.length === 6;

  return (
    <div className="flex flex-col h-full gap-6 max-w-4xl mx-auto">
      <div className="flex-none">
        <h1 className="text-2xl font-bold font-sans flex items-center gap-2">
          <Clock className="text-primary" />
          Cron Expression Builder
        </h1>
        <p className="text-muted-foreground mt-1">
          Parse and build cron schedules. See the next 5 execution times instantly.
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <label className="block text-sm font-medium mb-2">Cron Expression</label>
        <input 
          type="text" 
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="w-full h-12 bg-background border rounded-md px-4 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        
        {error ? (
          <div className="text-destructive text-sm mt-2 font-mono">
            Error: {error}
          </div>
        ) : (
          <div className="text-green-500 dark:text-green-400 text-sm mt-2 font-medium">
            {explanation}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setExpression(p.expr)}
              className="px-3 py-1.5 text-sm bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Expression Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Minute</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded">{parts[isSixFields ? 1 : 0] || ''}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Hour</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded">{parts[isSixFields ? 2 : 1] || ''}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Day of Month</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded">{parts[isSixFields ? 3 : 2] || ''}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Month</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded">{parts[isSixFields ? 4 : 3] || ''}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-medium text-muted-foreground">Day of Week</span>
              <span className="font-mono bg-muted px-2 py-0.5 rounded">{parts[isSixFields ? 5 : 4] || ''}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Next 5 Executions</h3>
          {nextRuns.length > 0 ? (
            <div className="space-y-2">
              {nextRuns.map((run, i) => (
                <div key={i} className="bg-background border rounded p-3 text-sm font-mono flex items-center">
                  <span className="w-6 text-muted-foreground">{i + 1}.</span>
                  {run}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Fix the expression to see upcoming executions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
