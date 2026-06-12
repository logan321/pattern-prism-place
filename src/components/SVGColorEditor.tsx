import React, { useState, useEffect, useMemo } from 'react';
import { X, Palette, Check, Save, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { applySvgColorMapping, extractEditableSvgColors, sanitizeSvgMarkup } from '../lib/svgUtils';

interface ColorMapping {
  [originalHex: string]: string;
}

interface SVGColorEditorProps {
  svgUrl: string;
  patternId: string;
  initialMapping?: ColorMapping;
  initialBaseColor?: string | null;
  onClose: () => void;
  onSave: (mapping: ColorMapping, baseColor: string | null) => void;
}

export const SVGColorEditor: React.FC<SVGColorEditorProps> = ({
  svgUrl,
  patternId,
  initialMapping = {},
  initialBaseColor = null,
  onClose,
  onSave
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [colors, setColors] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColorMapping>(initialMapping);
  const [baseColor, setBaseColor] = useState<string | null>(initialBaseColor);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        setLoading(true);
        const response = await fetch(svgUrl);
        const text = await response.text();
        const sanitizedSvg = sanitizeSvgMarkup(text);
        setSvgContent(sanitizedSvg);

        const foundColors = extractEditableSvgColors(sanitizedSvg);
        setColors(foundColors);
        
        // Initialize mapping if empty
        if (Object.keys(initialMapping).length === 0) {
          const newMapping: ColorMapping = {};
          foundColors.forEach(c => {
            newMapping[c] = c;
          });
          setMapping(newMapping);
        }
      } catch (error) {
        console.error('Error fetching SVG:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSvg();
  }, [svgUrl]);

  const previewSvg = useMemo(() => {
    return applySvgColorMapping(svgContent, mapping);
  }, [svgContent, mapping]);

  const handleColorChange = (original: string, newColor: string) => {
    setMapping(prev => ({
      ...prev,
      [original]: newColor
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('patterns')
        .update({
          color_mapping: mapping,
          base_color_hex: baseColor
        })
        .eq('id', patternId);

      if (error) throw error;
      onSave(mapping, baseColor);
      onClose();
    } catch (error) {
      console.error('Error saving color mapping:', error);
      alert('Erro ao salvar as cores da estampa.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold text-gray-800">Editar Cores da Estampa</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-500">Carregando estampa...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Preview Section */}
            <div className="flex-1 bg-gray-50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 min-h-[300px]">
              <div 
                className="w-full max-w-sm aspect-square bg-white rounded-xl shadow-inner flex items-center justify-center p-4"
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
            </div>

            {/* Sidebar Controls */}
            <div className="w-full md:w-80 overflow-y-auto p-6 flex flex-col">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Cores Detectadas</h3>
              
              <div className="space-y-4 flex-1">
                {colors.map((color, index) => (
                  <div key={color} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Cor {index + 1}</span>
                      <button 
                        onClick={() => setBaseColor(color === baseColor ? null : color)}
                        className={`text-[10px] px-2 py-1 rounded-full border transition-all flex items-center gap-1 ${
                          baseColor === color 
                            ? 'bg-orange-500 border-orange-500 text-white font-bold' 
                            : 'bg-white border-gray-200 text-gray-400 hover:border-orange-200'
                        }`}
                      >
                        {baseColor === color && <Check className="w-3 h-3" />}
                        {baseColor === color ? 'Cor Base' : 'Marcar Base'}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <div 
                          className="w-10 h-10 rounded-lg border-2 border-white shadow-sm"
                          style={{ backgroundColor: mapping[color] || color }}
                        />
                        <input 
                          type="color"
                          value={mapping[color] || color}
                          onChange={(e) => handleColorChange(color, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-mono">{color}</span>
                        <span className="text-xs font-bold text-gray-700 font-mono">{mapping[color] || color}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {colors.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-10">
                    Nenhuma cor editável detectada neste SVG.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};