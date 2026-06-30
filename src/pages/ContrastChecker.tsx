import { useState, useEffect } from 'react';
import { Contrast, CheckCircle2, XCircle } from 'lucide-react';

// Color conversion and contrast utilities
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Very basic suggestion logic - just lighten/darken foreground until it passes
function adjustColor(hex: string, amount: number) {
  let usePound = false;
  if (hex[0] == "#") {
      hex = hex.slice(1);
      usePound = true;
  }
  let num = parseInt(hex,16);
  let r = (num >> 16) + amount;
  if (r > 255) r = 255;
  else if  (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) + amount;
  if (b > 255) b = 255;
  else if  (b < 0) b = 0;
  let g = (num & 0x0000FF) + amount;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

function findPassingColor(fg: string, bg: string, targetRatio: number) {
  const bgLum = getLuminance(hexToRgb(bg)!.r, hexToRgb(bg)!.g, hexToRgb(bg)!.b);
  // Determine if we should darken or lighten fg
  const isBgLight = bgLum > 0.5;
  
  let currentFg = fg;
  let ratio = getContrastRatio(currentFg, bg);
  let attempts = 0;
  
  while (ratio < targetRatio && attempts < 50) {
    currentFg = adjustColor(currentFg, isBgLight ? -10 : 10);
    ratio = getContrastRatio(currentFg, bg);
    attempts++;
  }
  
  return ratio >= targetRatio ? currentFg : null;
}

export function ContrastChecker() {
  const [fgColor, setFgColor] = useState('#3b82f6');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    // validate hex
    if (/^#[0-9A-F]{6}$/i.test(fgColor) && /^#[0-9A-F]{6}$/i.test(bgColor)) {
      setRatio(getContrastRatio(fgColor, bgColor));
    }
  }, [fgColor, bgColor]);

  const handleFgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setFgColor(val);
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setBgColor(val);
  };

  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3.0;
  const aaaNormal = ratio >= 7.0;
  const aaaLarge = ratio >= 4.5;

  const suggestPassing = () => {
    const suggested = findPassingColor(fgColor, bgColor, 4.5);
    if (suggested) setFgColor(suggested);
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-4xl mx-auto">
      <div className="flex-none">
        <h1 className="text-2xl font-bold font-sans flex items-center gap-2">
          <Contrast className="text-primary" />
          WCAG Color Contrast Checker
        </h1>
        <p className="text-muted-foreground mt-1">
          Check contrast ratios and ensure your colors are accessible.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Text Color (Foreground)</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={fgColor}
                onChange={handleFgChange}
                className="w-12 h-12 rounded cursor-pointer border bg-background p-1"
              />
              <input 
                type="text" 
                value={fgColor}
                onChange={handleFgChange}
                className="flex-1 h-12 bg-background border rounded-md px-4 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={7}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={bgColor}
                onChange={handleBgChange}
                className="w-12 h-12 rounded cursor-pointer border bg-background p-1"
              />
              <input 
                type="text" 
                value={bgColor}
                onChange={handleBgChange}
                className="flex-1 h-12 bg-background border rounded-md px-4 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 shadow-sm flex flex-col justify-center items-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">Contrast Ratio</div>
          <div className="text-6xl font-bold font-sans tracking-tight mb-2">
            {ratio.toFixed(2)}<span className="text-2xl text-muted-foreground font-normal ml-1">: 1</span>
          </div>
          
          <div className="w-full mt-6 grid grid-cols-2 gap-4">
            <div className="border rounded p-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">WCAG AA</div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-sm font-medium">
                  Normal: {aaNormal ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-destructive" />}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  Large: {aaLarge ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-destructive" />}
                </div>
              </div>
            </div>
            
            <div className="border rounded p-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">WCAG AAA</div>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-sm font-medium">
                  Normal: {aaaNormal ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-destructive" />}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  Large: {aaaLarge ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-destructive" />}
                </div>
              </div>
            </div>
          </div>

          {!aaNormal && (
            <button 
              onClick={suggestPassing}
              className="mt-6 w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              Suggest Passing Text Color
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="h-10 border-b flex items-center px-4 bg-muted/50 font-medium text-sm text-muted-foreground">
          Live Preview
        </div>
        <div 
          className="p-8 md:p-12"
          style={{ backgroundColor: bgColor, color: fgColor }}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold" style={{ color: fgColor }}>Large Text (24pt or 18pt bold)</h2>
            <p className="text-base leading-relaxed" style={{ color: fgColor }}>
              This is normal text (14pt). The Web Content Accessibility Guidelines (WCAG) dictate that normal text should have a contrast ratio of at least 4.5:1 to meet AA standards. Large text requires a slightly lower ratio of 3:1. High contrast makes interfaces easier to read for everyone.
            </p>
            <div className="pt-4 flex gap-4">
              <button className="px-4 py-2 border rounded font-medium" style={{ borderColor: fgColor, color: fgColor }}>
                Outlined Button
              </button>
              <button className="px-4 py-2 rounded font-medium" style={{ backgroundColor: fgColor, color: bgColor }}>
                Filled Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
