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

function describeField(fieldStr: string, fieldType: string, min: number, max: number, names?: string[]): string {
  if (fieldStr === '*') {
    return fieldType === 'minute' ? 'every minute' : fieldType === 'hour' ? 'every hour' : '';
  }
  
  if (fieldStr.includes('/')) {
    const [range, stepStr] = fieldStr.split('/');
    const step = parseInt(stepStr, 10);
    
    let rangeDesc = '';
    if (range === '*') {
      rangeDesc = 'every';
    } else if (range.includes('-')) {
      const [startStr, endStr] = range.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      const startName = names ? (names[start] || start) : start;
      const endName = names ? (names[end] || end) : end;
      rangeDesc = `${startName} through ${endName}`;
    } else {
      const start = parseInt(range, 10);
      const startName = names ? (names[start] || start) : start;
      rangeDesc = `starting from ${startName}`;
    }
    
    if (fieldType === 'minute') {
      return `every ${step} minutes`;
    } else if (fieldType === 'hour') {
      return `every ${step} hours`;
    } else {
      return `every ${step} ${fieldType}s (${rangeDesc})`;
    }
  }
  
  if (fieldStr.includes(',')) {
    const parts = fieldStr.split(',');
    const resolved = parts.map(p => {
      const v = parseInt(p, 10);
      return names ? (names[v] || p) : p;
    });
    if (resolved.length === 1) return resolved[0];
    if (resolved.length === 2) return `${resolved[0]} and ${resolved[1]}`;
    return `${resolved.slice(0, -1).join(', ')}, and ${resolved[resolved.length - 1]}`;
  }
  
  if (fieldStr.includes('-')) {
    const [startStr, endStr] = fieldStr.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    const startName = names ? (names[start] || start) : start;
    const endName = names ? (names[end] || end) : end;
    if (fieldType === 'minute') {
      return `minutes ${startName} through ${endName}`;
    } else if (fieldType === 'hour') {
      return `hours ${startName} through ${endName}`;
    }
    return `${startName} through ${endName}`;
  }
  
  const val = parseInt(fieldStr, 10);
  if (fieldType === 'minute') {
    return `minute ${fieldStr}`;
  } else if (fieldType === 'hour') {
    return `hour ${fieldStr}`;
  }
  return names ? (names[val] || fieldStr) : fieldStr;
}

export function describeCronExpression(expression: string): string {
  try {
    if (expression === '* * * * *') return "Every minute";
    if (expression === '*/5 * * * *') return "Every 5 minutes";
    if (expression === '0 * * * *') return "Hourly";
    if (expression === '0 0 * * *') return "Daily at midnight";
    if (expression === '0 0 * * 1') return "Every Monday";

    const parts = expression.trim().split(/\s+/);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const months = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    let timeDesc = "";
    const minStr = parts[0];
    const hourStr = parts[1];
    
    const isMinNum = !isNaN(parseInt(minStr, 10)) && !minStr.includes('/') && !minStr.includes('-') && !minStr.includes(',');
    const isHourNum = !isNaN(parseInt(hourStr, 10)) && !hourStr.includes('/') && !hourStr.includes('-') && !hourStr.includes(',');

    if (isMinNum && isHourNum) {
      timeDesc = `At ${hourStr.padStart(2, '0')}:${minStr.padStart(2, '0')}`;
    } else if (isMinNum && hourStr === '*') {
      timeDesc = `At minute ${minStr} past every hour`;
    } else if (minStr.startsWith('*/') && hourStr === '*') {
      timeDesc = `Every ${minStr.split('/')[1]} minutes`;
    } else if (minStr.startsWith('*/') && isHourNum) {
      timeDesc = `Every ${minStr.split('/')[1]} minutes of hour ${hourStr}`;
    } else if (minStr === '*' && isHourNum) {
      timeDesc = `Every minute of hour ${hourStr}`;
    } else {
      const minDesc = describeField(minStr, 'minute', 0, 59);
      const hourDesc = describeField(hourStr, 'hour', 0, 23);
      
      if (hourStr === '*') {
        timeDesc = `${minDesc.charAt(0).toUpperCase() + minDesc.slice(1)} past every hour`;
      } else {
        timeDesc = `At ${minDesc} of ${hourDesc}`;
      }
    }

    let dateParts: string[] = [];
    
    if (parts[2] !== '*') {
      const domDesc = describeField(parts[2], 'dayOfMonth', 1, 31);
      if (parts[2].includes('-') || parts[2].includes(',') || parts[2].includes('/')) {
        dateParts.push(`on days ${domDesc}`);
      } else {
        dateParts.push(`on day-of-month ${domDesc}`);
      }
    }
    
    if (parts[4] !== '*') {
      const dowDesc = describeField(parts[4], 'dayOfWeek', 0, 7, days);
      dateParts.push(`on ${dowDesc}`);
    }
    
    if (parts[3] !== '*') {
      const monthDesc = describeField(parts[3], 'month', 1, 12, months);
      dateParts.push(`in ${monthDesc}`);
    }

    let fullDesc = timeDesc;
    if (dateParts.length > 0) {
      fullDesc = `${fullDesc.charAt(0).toUpperCase() + fullDesc.slice(1)}, ${dateParts.join(' and ')}`;
    }
    
    return fullDesc;
  } catch (e) {
    return "Invalid expression";
  }
}
