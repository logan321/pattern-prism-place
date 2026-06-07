import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Zone3D {
  id: string;
  name: string;
  side: 'front' | 'back';
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  rotation: number;
  position3d?: [number, number, number];
  normal3d?: [number, number, number];
  size3d?: number;
  rotation3d?: number;
  pathData?: { x: number; y: number }[];
  backPathData?: { x: number; y: number }[];
  shared: boolean;
  patchOnly: boolean;
  backXPercent?: number;
  backYPercent?: number;
  backWidthPercent?: number;
  backHeightPercent?: number;
}

interface AppContextType {
  zones: Zone3D[];
  selectedZoneId: string | null;
  activeSide: 'front' | 'back';
  addZone: (name: string, side: 'front' | 'back') => void;
  updateZone: (id: string, partial: Partial<Zone3D>) => void;
  removeZone: (id: string) => void;
  setSelectedZoneId: (id: string | null) => void;
  setActiveSide: (side: 'front' | 'back') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<Zone3D[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');

  const addZone = useCallback((name: string, side: 'front' | 'back') => {
    const newZone: Zone3D = {
      id: crypto.randomUUID(),
      name,
      side,
      xPercent: 50,
      yPercent: 50,
      widthPercent: 20,
      heightPercent: 20,
      rotation: 0,
      shared: false,
      patchOnly: false,
    };
    setZones((prev) => [...prev, newZone]);
  }, []);

  const updateZone = useCallback((id: string, partial: Partial<Zone3D>) => {
    setZones((prev) =>
      prev.map((zone) => (zone.id === id ? { ...zone, ...partial } : zone))
    );
  }, []);

  const removeZone = useCallback((id: string) => {
    setZones((prev) => prev.filter((zone) => zone.id !== id));
    setSelectedZoneId((prev) => (prev === id ? null : prev));
  }, []);

  return (
    <AppContext.Provider
      value={{
        zones,
        selectedZoneId,
        activeSide,
        addZone,
        updateZone,
        removeZone,
        setSelectedZoneId,
        setActiveSide,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}
