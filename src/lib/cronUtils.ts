interface CronField {
  type: 'all' | 'list' | 'range' | 'step' | 'value';
  values?: number[];
  step?: number;
}

export interface ParsedCron {
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
}

function parseField(fieldStr: string, min: number, max: number): CronField {
  if (fieldStr === '*') {
    return { type: 'all' };
  }
  if (fieldStr.includes('/')) {
    const [range, stepStr] = fieldStr.split('/');
    const step = parseInt(stepStr, 10);
    if (isNaN(step) || step <= 0) throw new Error(`Invalid step value: ${stepStr}`);
    if (range === '*') {
      return { type: 'step', step };
    }
    if (range.includes('-')) {
      const [startStr, endStr] = range.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
        throw new Error(`Invalid range: ${range}`);
      }
      return { type: 'step', step, values: [start, end] };
    }
    const val = parseInt(range, 10);
    if (!isNaN(val) && val >= min && val <= max) {
        return { type: 'step', step, values: [val, max] };
    }
    throw new Error(`Invalid step range: ${range}`);
  }
  if (fieldStr.includes(',')) {
    const parts = fieldStr.split(',');
    const values = parts.map(p => {
      const v = parseInt(p, 10);
      if (isNaN(v) || v < min || v > max) throw new Error(`Invalid list value: ${p}`);
      return v;
    });
    return { type: 'list', values };
  }
  if (fieldStr.includes('-')) {
    const [startStr, endStr] = fieldStr.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
      throw new Error(`Invalid range: ${fieldStr}`);
    }
    return { type: 'range', values: [start, end] };
  }
  
  const val = parseInt(fieldStr, 10);
  if (isNaN(val) || val < min || val > max) {
    throw new Error(`Invalid value: ${fieldStr}`);
  }
  return { type: 'value', values: [val] };
}

export function parseCronExpression(expression: string): ParsedCron {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Expected exactly 5 fields, got ${parts.length}`);
  }
  return {
    minute: parseField(parts[0], 0, 59),
    hour: parseField(parts[1], 0, 23),
    dayOfMonth: parseField(parts[2], 1, 31),
    month: parseField(parts[3], 1, 12),
    dayOfWeek: parseField(parts[4], 0, 7) // allow 7 for Sunday
  };
}

function matchesField(val: number, field: CronField, startForStep: number = 0): boolean {
  switch (field.type) {
    case 'all': return true;
    case 'value': return field.values![0] === val;
    case 'list': return field.values!.includes(val);
    case 'range': return val >= field.values![0] && val <= field.values![1];
    case 'step': {
        const start = field.values ? field.values[0] : startForStep;
        const end = field.values ? field.values[1] : Infinity;
        return val >= start && val <= end && (val - start) % field.step! === 0;
    }
  }
}

export function getNextExecutions(expression: string, count: number, fromDate: Date = new Date()): Date[] {
  const parsed = parseCronExpression(expression);
  const results: Date[] = [];
  
  let current = new Date(fromDate.getTime());
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  let iterations = 0;
  const maxIterations = 60 * 24 * 365 * 4; // 4 years

  while (results.length < count && iterations < maxIterations) {
    const min = current.getMinutes();
    const hr = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1;
    const dow = current.getDay();

    const domRestricted = parsed.dayOfMonth.type !== 'all';
    const dowRestricted = parsed.dayOfWeek.type !== 'all';
    
    let domDowMatch = true;
    const dowMatches = matchesField(dow, parsed.dayOfWeek, 0) || (dow === 0 && matchesField(7, parsed.dayOfWeek, 0));

    if (domRestricted && dowRestricted) {
        domDowMatch = matchesField(dom, parsed.dayOfMonth, 1) || dowMatches;
    } else {
        domDowMatch = matchesField(dom, parsed.dayOfMonth, 1) && dowMatches;
    }

    if (
      matchesField(min, parsed.minute, 0) &&
      matchesField(hr, parsed.hour, 0) &&
      matchesField(mon, parsed.month, 1) &&
      domDowMatch
    ) {
      results.push(new Date(current.getTime()));
    }

    current.setMinutes(current.getMinutes() + 1);
    iterations++;
  }

  if (iterations >= maxIterations) {
    throw new Error("Could not find enough execution times (expression might be impossible).");
  }

  return results;
}

export function describeCronExpression(expression: string): string {
  try {
    if (expression === '* * * * *') return "Every minute";
    if (expression === '*/5 * * * *') return "Every 5 minutes";
    if (expression === '0 * * * *') return "Hourly";
    if (expression === '0 0 * * *') return "Daily at midnight";
    if (expression === '0 0 * * 1') return "Every Monday";

    const parsed = parseCronExpression(expression);
    const parts = expression.trim().split(/\s+/);
    
    let desc = "";
    
    if (parts[0] === '*' && parts[1] === '*') desc += "Every minute";
    else if (parts[0].startsWith('*/') && parts[1] === '*') desc += `Every ${parts[0].split('/')[1]} minutes`;
    else if (parts[0] === '0' && parts[1] === '*') desc += "Hourly";
    else if (parts[0] !== '*' && parts[1] !== '*') desc += `At ${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`;
    else if (parts[0] !== '*' && parts[1] === '*') desc += `At minute ${parts[0]} past every hour`;
    else desc += `At minute ${parts[0]} past hour ${parts[1]}`;

    if (parts[2] !== '*' || parts[3] !== '*' || parts[4] !== '*') {
       desc += ", ";
       let dateParts = [];
       if (parts[2] !== '*') {
           dateParts.push(`on day-of-month ${parts[2]}`);
       }
       if (parts[4] !== '*') {
           const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
           let dStr = parts[4];
           if (parsed.dayOfWeek.type === 'value') {
               dStr = days[parsed.dayOfWeek.values![0]] || parts[4];
           }
           dateParts.push(`on ${dStr}`);
       }
       if (parts[3] !== '*') {
           dateParts.push(`in month ${parts[3]}`);
       }
       desc += dateParts.join(" and ");
    }
    
    return desc;
  } catch(e) {
    return "Invalid expression";
  }
}
