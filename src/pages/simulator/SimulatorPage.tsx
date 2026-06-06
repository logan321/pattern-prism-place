import { useSimulatorStore } from '@/store/useSimulatorStore';
import { SimulatorCanvas } from '@/components/simulator/SimulatorCanvas';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Share2, Download, Send, Camera } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const COLORS = [
  { name: 'Laranja', hex: '#F26522' },
  { name: 'Vermelho', hex: '#DC2626' },
  { name: 'Azul', hex: '#2563EB' },
  { name: 'Verde', hex: '#16A34A' },
  { name: 'Preto', hex: '#000000' },
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Amarelo', hex: '#FACC15' },
  { name: 'Roxo', hex: '#7C3AED' },
  { name: 'Cinza', hex: '#4B5563' },
];

export default function SimulatorPage() {
  const { 
    colors, 
    activePieces, 
    syncColors,
    golaType,
    punhoType,
    mangaType,
    hasBolso,
    nameText,
    numberText,
    fontFamily,
    textColor,
    setColor, 
    togglePiece, 
    setSyncColors,
    setGolaType,
    setPunhoType,
    setMangaType,
    setHasBolso,
    setText,
    setFontFamily,
    setTextColor,
  } = useSimulatorStore();

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-4 bg-white z-10">
        <div className="flex items-center gap-4">
          <Link to="/" asChild>
            <Button variant="ghost" size="icon">
              <ChevronLeft />
            </Button>
          </Link>
          <span className="text-xl font-bold text-[#F26522]">JumpTec</span>
          <span className="text-sm text-gray-500 hidden sm:block">Simulador Futebol Masculino 3D</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Share2 size={16} /> Compartilhar
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Download size={16} /> Exportar
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 relative bg-[#F5F5F5]">
          <SimulatorCanvas />
          
          {/* Mobile Buttons Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 md:hidden">
            <Button className="flex-1 bg-[#F26522] text-white">
              <Camera size={18} className="mr-2" /> Screenshot
            </Button>
          </div>
        </div>

        {/* Controls Sidebar */}
        <aside className="w-full md:w-[400px] border-l overflow-y-auto bg-white flex flex-col">
          <div className="p-4 flex-1">
            <Accordion type="single" collapsible className="w-full">
              {/* Seção 1: PEÇAS */}
              <AccordionItem value="pecas">
                <AccordionTrigger className="font-bold">PEÇAS</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sync-colors">Sincronizar Camisa e Calção</Label>
                      <Switch 
                        id="sync-colors" 
                        checked={syncColors} 
                        onCheckedChange={setSyncColors} 
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-orange-50" onClick={() => togglePiece('camisa')}>
                        <div className={`w-4 h-4 rounded border ${activePieces.camisa ? 'bg-[#F26522] border-[#F26522]' : 'bg-white border-gray-300'}`} />
                        <span className="text-xs font-medium">Camisa</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-orange-50" onClick={() => togglePiece('calcao')}>
                        <div className={`w-4 h-4 rounded border ${activePieces.calcao ? 'bg-[#F26522] border-[#F26522]' : 'bg-white border-gray-300'}`} />
                        <span className="text-xs font-medium">Calção</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-orange-50" onClick={() => togglePiece('meiao')}>
                        <div className={`w-4 h-4 rounded border ${activePieces.meiao ? 'bg-[#F26522] border-[#F26522]' : 'bg-white border-gray-300'}`} />
                        <span className="text-xs font-medium">Meião</span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Seção 2: CORES */}
              <AccordionItem value="cores">
                <AccordionTrigger className="font-bold">CORES</AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2">
                    <Tabs defaultValue="camisa">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="camisa">Camisa</TabsTrigger>
                        <TabsTrigger value="calcao">Calção</TabsTrigger>
                        <TabsTrigger value="meiao">Meião</TabsTrigger>
                      </TabsList>
                      {['camisa', 'calcao', 'meiao'].map((piece) => (
                        <TabsContent key={piece} value={piece} className="pt-4">
                          <div className="grid grid-cols-5 gap-2">
                            {COLORS.map((c) => (
                              <button
                                key={c.hex}
                                className={`w-10 h-10 rounded-full border-2 transition-all ${
                                  colors[piece as keyof typeof colors] === c.hex ? 'border-black scale-110 shadow-md' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: c.hex }}
                                onClick={() => setColor(piece, c.hex)}
                                title={c.name}
                              />
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Seção 3: ACABAMENTOS */}
              <AccordionItem value="acabamentos">
                <AccordionTrigger className="font-bold">ACABAMENTOS</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-2">
                    <div className="space-y-3">
                      <Label className="font-semibold">Tipo de Gola</Label>
                      <RadioGroup value={golaType} onValueChange={(val) => setGolaType(val as any)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="v" id="gola-v" />
                          <Label htmlFor="gola-v">Gola V</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="redonda" id="gola-redonda" />
                          <Label htmlFor="gola-redonda">Gola Redonda</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="polo" id="gola-polo" />
                          <Label htmlFor="gola-polo">Gola Polo</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-semibold">Manga</Label>
                      <RadioGroup value={mangaType} onValueChange={(val) => setMangaType(val as any)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tradicional" id="manga-trad" />
                          <Label htmlFor="manga-trad">Tradicional</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="raglan" id="manga-raglan" />
                          <Label htmlFor="manga-raglan">Raglan</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="bolso-trad">Bolso Tradicional</Label>
                      <Switch 
                        id="bolso-trad" 
                        checked={hasBolso} 
                        onCheckedChange={setHasBolso} 
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Seção 4: NOME E NÚMERO */}
              <AccordionItem value="textos">
                <AccordionTrigger className="font-bold">NOME E NÚMERO</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="camisa-nome">Nome na Camisa</Label>
                        <Input 
                          id="camisa-nome" 
                          placeholder="EX: NOME" 
                          value={nameText.camisa}
                          onChange={(e) => setText('camisa', 'name', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="camisa-num">Número</Label>
                        <Input 
                          id="camisa-num" 
                          type="number" 
                          placeholder="00" 
                          value={numberText.camisa}
                          onChange={(e) => setText('camisa', 'number', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="font-semibold">Fonte</Label>
                      <RadioGroup value={fontFamily} onValueChange={setFontFamily}>
                        {['Inter', 'Brosh', 'Athena', 'Cheddar'].map((font) => (
                          <div key={font} className="flex items-center space-x-2">
                            <RadioGroupItem value={font} id={`font-${font}`} />
                            <Label htmlFor={`font-${font}`} className="font-medium">{font} ABC</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-semibold">Cor do Texto</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {COLORS.map((c) => (
                          <button
                            key={c.hex}
                            className={`w-8 h-8 rounded-full border ${
                              textColor === c.hex ? 'ring-2 ring-black ring-offset-1' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: c.hex }}
                            onClick={() => setTextColor(c.hex)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t bg-gray-50 space-y-2">
            <Button className="w-full bg-[#F26522] hover:bg-[#E55A00] text-white py-6 text-lg font-bold uppercase shadow-lg">
              <Send size={18} className="mr-2" /> Solicitar Orçamento
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="border-[#F26522] text-[#F26522]">
                Salvar Draft
              </Button>
              <Button variant="outline" className="border-[#F26522] text-[#F26522]">
                Galeria
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
