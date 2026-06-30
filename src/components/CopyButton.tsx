import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { useToastStore } from '../store/toastStore';

export function CopyButton({ text, className }: { text: string, className?: string }) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToastStore();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      addToast('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
    </button>
  );
}
