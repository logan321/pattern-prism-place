import React, { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  applySvgColorMapping,
  extractEditableSvgColors,
  sanitizeSvgMarkup,
  svgMarkupToDataUrl,
} from "../lib/svgUtils";

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
  onMappingChange,
}) => {
  const [colors, setColors] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColorMapping>(initialMapping);
  const [loading, setLoading] = useState(true);
  const [sanitizedSvg, setSanitizedSvg] = useState("");
  const initialMappingRef = React.useRef(initialMapping);
  const onMappingChangeRef = React.useRef(onMappingChange);
  React.useEffect(() => {
    onMappingChangeRef.current = onMappingChange;
  }, [onMappingChange]);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        setLoading(true);
        const response = await fetch(svgUrl);
        const text = await response.text();
        const safeSvg = sanitizeSvgMarkup(text);
        setSanitizedSvg(safeSvg);

        const foundColors = extractEditableSvgColors(safeSvg);
        setColors(foundColors);

        // Use initial mapping or create default
        const newMapping = { ...initialMappingRef.current };
        foundColors.forEach((c) => {
          if (!newMapping[c]) {
            newMapping[c] = c;
          }
        });
        setMapping(newMapping);
      } catch (error) {
        console.error("Error detecting SVG colors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSvg();
  }, [svgUrl]);

  useEffect(() => {
    if (!sanitizedSvg) return;

    const recoloredSvg = applySvgColorMapping(sanitizedSvg, mapping);
    const dataUrl = svgMarkupToDataUrl(recoloredSvg);

    if (dataUrl) onMappingChangeRef.current({ ...mapping, __previewUrl: dataUrl });
  }, [mapping, sanitizedSvg]);

  const handleColorChange = (original: string, newColor: string) => {
    const updatedMapping = {
      ...mapping,
      [original]: newColor,
    };
    setMapping(updatedMapping);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-2" />
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          Detectando Cores...
        </p>
      </div>
    );
  }

  if (colors.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-[10px] text-gray-400 font-bold uppercase">
          Nenhuma cor editável detectada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 pb-4">
      {colors.map((color, index) => (
        <div
          key={color}
          className="flex flex-col gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-100 transition-colors"
        >
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
              <span className="text-[8px] text-gray-400 font-mono leading-none mb-0.5 truncate">
                {color}
              </span>
              <span className="text-[10px] font-black text-gray-700 font-mono leading-none truncate tracking-tight">
                {mapping[color] || color}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
