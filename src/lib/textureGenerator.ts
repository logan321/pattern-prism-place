import * as THREE from 'three';

export interface UVZone {
  id: string;
  name: string;
  type: 'logo' | 'text' | 'number' | 'sponsor';
  x: number; // Pixels (0-2048)
  y: number; // Pixels (0-2048)
  width: number; // Pixels
  height: number; // Pixels
  rotation: number; // Degrees
}

export interface TextureGenerationParams {
  baseTextureUrl?: string;
  zones: UVZone[];
  customizations: {
    name?: string;
    number?: string;
    shieldUrl?: string | null;
    nameColor?: string;
    numberColor?: string;
    nameFont?: string;
    formation?: string; // e.g. 'escudo-esq-nome-dir'
  };
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export async function generateFinalTexture({
  baseTextureUrl,
  zones,
  customizations
}: TextureGenerationParams): Promise<HTMLCanvasElement> {
  console.log('Generating final texture with:', { 
    baseTextureUrl: baseTextureUrl ? 'Provided' : 'None', 
    zonesCount: zones.length, 
    customizations 
  });
  
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Could not get canvas context');

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Draw Base Texture (The Print/Pattern)
  if (baseTextureUrl) {
    try {
      const baseImg = await loadImage(baseTextureUrl);
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
      console.log('Base texture drawn successfully');
    } catch (e) {
      console.warn('Base texture failed to load, using white bg', e);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    // Se não tiver estampa, usa um fundo cinza claro para destacar as zonas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenha um grid de teste para ajudar a visualizar a UV
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    for(let i=0; i<2048; i+=128) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 2048); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(2048, i); ctx.stroke();
    }
  }

  const { name, number, shieldUrl, nameColor, numberColor, nameFont } = customizations;

  // 2. Draw Zones
  for (const zone of zones) {
    console.log(`Drawing zone: ${zone.name} type: ${zone.type} at ${zone.x}, ${zone.y}`);
    ctx.save();
    
    // Translate to zone center
    ctx.translate(zone.x, zone.y);
    ctx.rotate((zone.rotation * Math.PI) / 180);

    const font = nameFont || 'Arial';

    if (zone.type === 'logo' && shieldUrl) {
      try {
        const img = await loadImage(shieldUrl);
        ctx.drawImage(img, -zone.width / 2, -zone.height / 2, zone.width, zone.height);
      } catch (e) {
        console.warn('Shield image failed to load for zone:', zone.name);
      }
    } else if (zone.type === 'text' && name) {
      const textToDraw = name.toUpperCase();
      const fontSize = Math.floor(zone.height);
      ctx.font = `bold ${fontSize}px ${font}`;
      ctx.fillStyle = nameColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const metrics = ctx.measureText(textToDraw);
      const scale = Math.min(1, zone.width / metrics.width);
      if (scale < 1) {
        ctx.scale(scale, 1);
      }
      
      // Adiciona um stroke leve para melhor legibilidade se necessário
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = fontSize * 0.05;
      ctx.strokeText(textToDraw, 0, 0);
      ctx.fillText(textToDraw, 0, 0);
    } else if (zone.type === 'number' && number) {
      const fontSize = Math.floor(zone.height);
      ctx.font = `bold ${fontSize}px ${font}`;
      ctx.fillStyle = numberColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const metrics = ctx.measureText(number);
      const scale = Math.min(1, zone.width / metrics.width);
      if (scale < 1) {
        ctx.scale(scale, 1);
      }
      
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = fontSize * 0.05;
      ctx.strokeText(number, 0, 0);
      ctx.fillText(number, 0, 0);
    } else if (zone.type === 'sponsor' && name) {
      const fontSize = Math.floor(zone.height);
      ctx.font = `bold ${fontSize}px ${font}`;
      ctx.fillStyle = nameColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name.toUpperCase(), 0, 0);
    }

    ctx.restore();
  }

  return canvas;
}
