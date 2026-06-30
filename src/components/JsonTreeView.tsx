import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface JsonNodeProps {
  label?: string;
  data: any;
  isLast: boolean;
  initiallyExpanded?: boolean;
}

export function JsonNode({ label, data, isLast, initiallyExpanded = true }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  
  const isObject = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);
  const isEmpty = isObject && Object.keys(data).length === 0;

  if (!isObject) {
    let valueColor = "text-blue-500 dark:text-blue-400"; // strings
    if (typeof data === 'number') valueColor = "text-orange-500 dark:text-orange-400";
    if (typeof data === 'boolean') valueColor = "text-purple-500 dark:text-purple-400";
    if (data === null) valueColor = "text-gray-500 dark:text-gray-400";

    const displayValue = typeof data === 'string' ? `"${data}"` : String(data);

    return (
      <div className="pl-4 py-0.5 font-mono text-sm flex">
        {label && <span className="text-blue-700 dark:text-blue-300 mr-2">"{label}":</span>}
        <span className={valueColor}>{displayValue}</span>
        {!isLast && <span className="text-foreground">,</span>}
      </div>
    );
  }

  const toggle = () => setExpanded(!expanded);
  const brackets = isArray ? ['[', ']'] : ['{', '}'];
  const keys = Object.keys(data);

  return (
    <div className="font-mono text-sm">
      <div className="flex items-center py-0.5">
        <button 
          onClick={toggle} 
          className={cn(
            "p-0.5 hover:bg-accent rounded mr-1 text-muted-foreground",
            isEmpty && "opacity-0 pointer-events-none"
          )}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {label && <span className="text-blue-700 dark:text-blue-300 mr-2">"{label}":</span>}
        <span className="text-foreground">{brackets[0]}</span>
        {!expanded && !isEmpty && (
          <span className="text-muted-foreground mx-1 text-xs cursor-pointer" onClick={toggle}>
            {isArray ? `${keys.length} items` : `${keys.length} keys`}
          </span>
        )}
        {!expanded && <span className="text-foreground">{brackets[1]}{!isLast ? ',' : ''}</span>}
      </div>
      
      {expanded && !isEmpty && (
        <div className="pl-6 border-l border-border/50 ml-2">
          {keys.map((key, index) => (
            <JsonNode
              key={key}
              label={isArray ? undefined : key}
              data={data[key as keyof typeof data]}
              isLast={index === keys.length - 1}
              initiallyExpanded={initiallyExpanded}
            />
          ))}
        </div>
      )}
      
      {expanded && (
        <div className="pl-4 flex">
          <span className="text-foreground">{brackets[1]}</span>
          {!isLast && <span className="text-foreground">,</span>}
        </div>
      )}
    </div>
  );
}

export function JsonTreeView({ data }: { data: any }) {
  if (data === undefined) return null;
  return (
    <div className="bg-card text-card-foreground p-4 rounded-md overflow-auto h-full">
      <JsonNode data={data} isLast={true} />
    </div>
  );
}
