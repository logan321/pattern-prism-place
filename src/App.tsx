import React, { useState } from 'react';
import { 
  Shirt, 
  Palette, 
  Scissors, 
  Type, 
  Shield, 
  Upload, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  ArrowUp, 
  ArrowDown, 
  Smartphone,
  MessageSquare,
  Save,
  Send
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center py-4 px-2 w-full transition-colors",
      active ? "text-orange-600 bg-white border-l-4 border-orange-600" : "text-gray-500 hover:bg-gray-50"
    )}
  >
    <Icon className="w-6 h-6 mb-1" />
    <span className="text-[10px] font-medium uppercase tracking-tight">{label}</span>
  </button>
);

const ModelCard = ({ id, active }: { id: string, active?: boolean }) => (
  <div className={cn(
    "border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md bg-white flex flex-col items-center",
    active ? "border-orange-500 ring-1 ring-orange-500" : "border-gray-200"
  )}>
    <div className="w-full aspect-square bg-blue-50 rounded mb-2 flex items-center justify-center">
      <Shirt className="w-12 h-12 text-blue-400" />
    </div>
    <span className="text-[10px] text-gray-500">Cod. Modelo: {id}</span>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('Modelo');
  const [subTab, setSubTab] = useState('Camisa');
  const [sync, setSync] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f0] font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-orange-600 h-16 flex items-center justify-between px-4 shrink-0 shadow-md">
        <div className="flex items-center">
          <div className="bg-white p-1 rounded font-bold text-xs leading-none text-center mr-8">
            SUA<br/>LOGO<br/>AQUI
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30">
               <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full" />
               </div>
             </div>
             {/* Simple placeholders for those top circle buttons */}
             {[1,2,3,4].map(i => (
               <div key={i} className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-white/50 text-[10px]">
                 {i}
               </div>
             ))}
             <button className="bg-white text-gray-800 text-xs px-3 py-1 rounded font-medium">ver todos</button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Sidebar */}
        <aside className="w-20 bg-white border-r flex flex-col shadow-sm z-10">
          <SidebarItem icon={Shirt} label="Modelo" active={activeTab === 'Modelo'} onClick={() => setActiveTab('Modelo')} />
          <SidebarItem icon={Palette} label="Cores" active={activeTab === 'Cores'} onClick={() => setActiveTab('Cores')} />
          <SidebarItem icon={Scissors} label="Acabamentos" active={activeTab === 'Acabamentos'} onClick={() => setActiveTab('Acabamentos')} />
          <SidebarItem icon={Type} label="Nome/Número" active={activeTab === 'Nome/Número'} onClick={() => setActiveTab('Nome/Número')} />
          <SidebarItem icon={Shield} label="Escudo" active={activeTab === 'Escudo'} onClick={() => setActiveTab('Escudo')} />
          <SidebarItem icon={Upload} label="Upload" active={activeTab === 'Upload'} onClick={() => setActiveTab('Upload')} />
        </aside>

        {/* Panel Content */}
        <aside className="w-64 bg-white border-r p-4 overflow-y-auto z-10">
          <div className="flex items-center mb-6">
            <Shirt className="w-5 h-5 text-orange-600 mr-2" />
            <h2 className="font-bold text-gray-800">Modelos / Estampas</h2>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-gray-600">Sincronizar Camisa e Calção</span>
            <button 
              onClick={() => setSync(!sync)}
              className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                sync ? "bg-black" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                sync ? "left-6" : "left-1"
              )} />
            </button>
          </div>

          <div className="flex border-b mb-4">
            {['Camisa', 'Calção', 'Meião'].map(tab => (
              <button 
                key={tab}
                onClick={() => setSubTab(tab)}
                className={cn(
                  "px-3 py-1 text-sm font-medium transition-all relative",
                  subTab === tab ? "text-orange-600" : "text-gray-400"
                )}
              >
                {tab}
                {subTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600" />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ModelCard id="250" active />
            <ModelCard id="249" />
            <ModelCard id="248" />
            <ModelCard id="247" />
            <ModelCard id="246" />
            <ModelCard id="245" />
            <ModelCard id="244" />
            <ModelCard id="243" />
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 relative bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Top Actions */}
          <div className="absolute top-6 right-6 flex space-x-3 z-10">
            <button className="bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center hover:bg-orange-700 transition-colors">
              <Send className="w-4 h-4 mr-2" />
              Enviar Orçamento
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Salvar Simulação
            </button>
          </div>

          {/* 3D Mockup Container (Placeholder for Three.js) */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="relative w-full max-w-md pointer-events-none">
                {/* SVG Mockup as a placeholder for the 3D model */}
                <svg viewBox="0 0 200 300" className="w-full drop-shadow-2xl">
                   {/* Shirt */}
                   <path d="M50,40 L150,40 L160,80 L140,90 L140,200 L60,200 L60,90 L40,80 Z" fill="white" stroke="#eee" />
                   <path d="M60,40 L140,40 Q100,60 60,40" fill="#f5f5f5" />
                   <path d="M70,80 L130,160 M130,80 L70,160" stroke="#1e293b" strokeWidth="15" fill="none" opacity="0.8" />
                   
                   {/* Shorts */}
                   <path d="M70,210 L130,210 L140,260 L105,260 L100,240 L95,260 L60,260 Z" fill="white" stroke="#eee" />
                   <path d="M110,215 L110,255" stroke="#be123c" strokeWidth="6" />
                   
                   {/* Socks */}
                   <path d="M75,265 L95,265 L95,295 L75,295 Z" fill="white" />
                   <path d="M105,265 L125,265 L125,295 L105,295 Z" fill="white" />
                </svg>
             </div>
          </div>

          {/* Left Controls */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col space-y-2 z-10">
            <div className="bg-white p-2 rounded-lg shadow-md border flex flex-col items-center">
              <button className="p-1 hover:bg-gray-100 rounded mb-1"><Shirt className="w-5 h-5 text-gray-700" /></button>
              <button className="p-1 hover:bg-gray-100 rounded"><Save className="w-5 h-5 text-gray-700" /></button>
            </div>
          </div>

          {/* Right Controls */}
          <div className="absolute right-6 bottom-32 flex flex-col space-y-2 z-10">
            <div className="bg-white p-2 rounded-lg shadow-md border flex flex-col space-y-3">
              <button className="p-1 hover:bg-gray-100 rounded"><ZoomIn className="w-5 h-5 text-gray-600" /></button>
              <button className="p-1 hover:bg-gray-100 rounded"><ZoomOut className="w-5 h-5 text-gray-600" /></button>
              <button className="p-1 hover:bg-gray-100 rounded"><ArrowUp className="w-5 h-5 text-gray-600" /></button>
              <button className="p-1 hover:bg-gray-100 rounded"><ArrowDown className="w-5 h-5 text-gray-600" /></button>
              <div className="h-px bg-gray-200" />
              <div className="flex items-center justify-between space-x-2">
                <Shirt className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-4 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full" /></div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Scissors className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-4 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full" /></div>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Smartphone className="w-4 h-4 text-gray-600" />
                <div className="w-8 h-4 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full" /></div>
              </div>
            </div>
          </div>

          {/* Whatsapp Floating Button */}
          <div className="absolute right-6 bottom-6 flex items-center bg-green-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors z-10">
            <div className="mr-2">
              <p className="text-[10px] opacity-80 leading-none">Atendimento online</p>
              <p className="leading-tight">WhatsApp</p>
            </div>
            <MessageSquare className="w-6 h-6" />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#333] text-white h-10 flex items-center justify-center text-[10px] shrink-0 border-t border-gray-700">
        <span className="mr-4">2025 Jumptec. Todos os direitos reservados.</span>
        <div className="font-black italic text-lg tracking-tighter flex items-center">
          JUMP<span className="text-orange-500">TEC</span>
        </div>
      </footer>
    </div>
  );
}

export default App;