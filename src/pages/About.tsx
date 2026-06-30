import { Info } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full gap-6">
      <div className="flex-none">
        <h1 className="text-2xl font-bold font-sans flex items-center gap-2">
          <Info className="text-primary" />
          About Quietbench
        </h1>
      </div>
      <div className="bg-card border rounded-lg p-6 shadow-sm text-muted-foreground leading-relaxed">
        <p>
          Quietbench is a free suite of developer utilities that run entirely in your browser. No sign-up, no data sent to a server, no tracking of your inputs. 
        </p>
        <p className="mt-4">
          Every tool — JSON formatting, regex testing, cron building, contrast checking, and API testing — processes everything client-side using JavaScript already running on your machine.
        </p>
        <p className="mt-4">
          Built for developers who want a fast answer without opening a chat window or creating an account.
        </p>
      </div>
    </div>
  );
}
