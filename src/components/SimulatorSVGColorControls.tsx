import React, { useState, useEffect, useMemo } from 'react';
import { Palette, Check, Loader2 } from 'lucide-react';

interface ColorMapping {
  [originalHex: string]: string;
}

interface SimulatorSVGColorControlsProps {
  svgUrl: string;
  initialMapping?: ColorMapping;
  baseColorHex?: string | null;
  onMappingChange: (mapping: ColorMapping) => void;
}

export const SimulatorSVGColorControls: React.FC<SimulatorSVGColorControlsProps> = ({
  svgUrl,
  initialMapping = {},
  baseColorHex = null,
  onMappingChange
}) => {
  const [colors, setColors] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColorMapping>(initialMapping);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        setLoading(true);
        const response = await fetch(svgUrl);
        const text = await response.text();
        
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(text, 'image/svg+xml');
        const elements = Array.from(svgDoc.getElementsByTagName('*'));
        const detectedColors = new Set<string>();

        const isPureBlack = (hex: string) => {
          if (!hex || typeof hex !== 'string') return false;
          let cleanHex = hex.trim();
          if (!cleanHex.startsWith('#')) return false;

          let r = 0, g = 0, b = 0;
          if (cleanHex.length === 4) {
            r = parseInt(cleanHex[1] + cleanHex[1], 16);
            g = parseInt(cleanHex[2] + cleanHex[2], 16);
            b = parseInt(cleanHex[3] + cleanHex[3], 16);
          } else if (cleanHex.length === 7) {
            r = parseInt(cleanHex.substring(1, 3), 16);
            g = parseInt(cleanHex.substring(3, 5), 16);
            b = parseInt(cleanHex.substring(5, 7), 16);
          } else {
            return false;
          }
          return r < 30 && g < 30 && b < 30;
        };

        elements.forEach(el => {
          const fill = el.getAttribute('fill');
          if (fill && fill.startsWith('#') && !isPureBlack(fill)) {
            detectedColors.add(fill.toUpperCase());
          }
          
          const style = el.getAttribute('style');
          if (style) {
            const fillMatches = style.matchAll(/fill:\s*(#[0-9a-fA-F]{3,6})/gi);
            for (const match of fillMatches) {
              if (match[1] && !isPureBlack(match[1])) {
                detectedColors.add(match[1].toUpperCase());
              }
            }
          }
        });

        const foundColors = Array.from(detectedColors);
        setColors(foundColors);
        
        // Use initial mapping or create default
        const newMapping = { ...initialMapping };
        foundColors.forEach(c => {
          if (!newMapping[c]) {
            newMapping[c] = c;
          }
        });
        setMapping(newMapping);
      } catch (error) {
        console.error('Error detecting SVG colors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSvg();
  }, [svgUrl, initialMapping]);

  const handleColorChange = (original: string, newColor: string) => {
    const updatedMapping = {
      ...mapping,
      [original]: newColor
    };
    setMapping(updatedMapping);
    onMappingChange(updatedMapping);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-2" />
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Detectando Cores...</p>
      </div>
    );
  }

  if (colors.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhuma cor editável detectada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 pb-4">
      {colors.map((color, index) => (
        <div key={color} className="flex flex-col gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-100 transition-colors">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate flex-1">
              Cor {index + 1}
            </span>
            {baseColorHex === color && (
              <span className="text-[8px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter flex items-center gap-0.5 shrink-0">
                <Check className="w-2 h-2" />
                Base
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 shrink-0">
              <div 
                className="w-full h-full rounded-lg border-2 border-white shadow-sm"
                style={{ backgroundColor: mapping[color] || color }}
              />
              <input 
                type="color"
                value={mapping[color] || color}
                onChange={(e) => handleColorChange(color, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] text-gray-400 font-mono leading-none mb-0.5 truncate">{color}</span>
              <span className="text-[10px] font-black text-gray-700 font-mono leading-none truncate tracking-tight">{mapping[color] || color}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};