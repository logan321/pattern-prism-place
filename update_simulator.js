import fs from 'fs';

const filePath = 'src/pages/Simulator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldContent = `            ) : activeTab === 'Escudo' ? (
              <div className=\"col-span-2 space-y-4\">
                <div className=\"p-2 rounded text-[10px] font-medium border bg-blue-50 border-blue-200 text-blue-700\">
                  ℹ️ O escudo será aplicado automaticamente na posição correta da matriz UV.
                </div>`;

const newContent = `            ) : activeTab === 'Escudo' ? (
              <div className=\"col-span-2 space-y-4\">
                <div className=\"space-y-2\">
                  <label className=\"text-[10px] font-bold text-gray-500 uppercase\">Posição do Escudo</label>
                  <div className=\"grid grid-cols-2 gap-2\">
                    <button 
                      onClick={() => handleChestLayoutChange('name-top-shield-center')}
                      className={cn(
                        \"text-[10px] py-2 px-1 rounded border transition-all\",
                        chestLayout === 'name-top-shield-center' ? \"bg-orange-600 text-white border-orange-600\" : \"bg-white text-gray-600 border-gray-200\"
                      )}
                    >
                      Escudo no Centro
                    </button>
                    <button 
                      onClick={() => handleChestLayoutChange('name-center-shield-top')}
                      className={cn(
                        \"text-[10px] py-2 px-1 rounded border transition-all\",
                        chestLayout === 'name-center-shield-top' ? \"bg-orange-600 text-white border-orange-600\" : \"bg-white text-gray-600 border-gray-200\"
                      )}
                    >
                      Escudo no Topo
                    </button>
                  </div>
                </div>`;

content = content.replace(oldContent, newContent);

const oldCostasContent = `            ) : (
              <div className=\"col-span-2 text-center py-8 text-gray-400 text-xs\">
                Em breve disponível
              </div>
            )`;

const newCostasContent = `            ) : activeTab === 'Costas' ? (
              <div className=\"col-span-2 space-y-6\">
                <div className=\"grid grid-cols-1 gap-4\">
                  {[
                    { key: 'back_top_name', label: 'Nome no Topo', icon: Type },
                    { key: 'back_center_number', label: 'Número no Centro', icon: Type },
                    { key: 'back_bottom_name', label: 'Nome no Fundo', icon: Type },
                    { key: 'back_bottom_number', label: 'Número Inferior', icon: Type },
                  ].map((zone) => {
                    const isActive = uvLayers.some(l => l.zoneKey === zone.key);
                    const isName = zone.key.includes('name');
                    const contentValue = isName ? customName : customNumber;
                    
                    return (
                      <button
                        key={zone.key}
                        onClick={() => {
                          if (isActive) {
                            removeUvLayer(zone.key);
                          } else {
                            if (isName) {
                              setUvLayerText(zone.key, customName || 'NOME');
                            } else {
                              setUvLayerText(zone.key, customNumber || '10');
                            }
                          }
                        }}
                        className={cn(
                          \"flex items-center p-3 rounded-lg border-2 transition-all text-left\",
                          isActive 
                            ? \"border-green-500 bg-green-50\" 
                            : \"border-gray-200 bg-white hover:border-gray-300\"
                        )}
                      >
                        <div className={cn(
                          \"w-10 h-10 rounded flex items-center justify-center mr-3\",
                          isActive ? \"bg-green-100 text-green-600\" : \"bg-gray-100 text-gray-400\"
                        )}>
                          <zone.icon className=\"w-6 h-6\" />
                        </div>
                        <div className=\"flex-1\">
                          <p className=\"text-[11px] font-bold text-gray-700 uppercase leading-none mb-1\">{zone.label}</p>
                          <p className=\"text-[10px] text-gray-400 truncate\">{isActive ? contentValue : 'Desativado'}</p>
                        </div>
                        {isActive && (
                          <div className=\"w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white\">
                            <Send className=\"w-3 h-3\" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className=\"col-span-2 text-center py-8 text-gray-400 text-xs\">
                Em breve disponível
              </div>
            )`;

content = content.replace(oldCostasContent, newCostasContent);

fs.writeFileSync(filePath, content);
console.log('File updated successfully');
