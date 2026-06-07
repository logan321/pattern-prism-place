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
  console.log('Generating final texture with:', { baseTextureUrl, zonesCount: zones.length, customizations });
  
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
      console.log('Loading base texture:', baseTextureUrl);
      const baseImg = await loadImage(baseTextureUrl);
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
      console.log('Base texture drawn successfully');
    } catch (e) {
      console.warn('Base texture failed to load, using white bg', e);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    console.log('No base texture provided, using white bg');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const { name, number, shieldUrl, nameColor, numberColor, nameFont } = customizations;

  // 2. Draw Zones with "Intelligence"
  for (const zone of zones) {
    console.log(`Processing zone: ${zone.name} (${zone.type}) at x:${zone.x}, y:${zone.y}`);
    ctx.save();
    
    // Translate to zone center
    ctx.translate(zone.x, zone.y);
    ctx.rotate((zone.rotation * Math.PI) / 180);

    if (zone.type === 'logo' && shieldUrl) {
      try {
        const img = await loadImage(shieldUrl);
        ctx.drawImage(img, -zone.width / 2, -zone.height / 2, zone.width, zone.height);
        console.log(`Drew shield in zone: ${zone.name}`);
      } catch (e) {
        console.warn('Shield image failed to load for zone:', zone.name);
      }
    } else if (zone.type === 'text' && name) {
      const fontSize = Math.floor(zone.height);
      ctx.font = `bold ${fontSize}px ${nameFont || 'Arial'}`;
      ctx.fillStyle = nameColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textToDraw = name.toUpperCase();
      const metrics = ctx.measureText(textToDraw);
      const scale = Math.min(1, zone.width / metrics.width);
      if (scale < 1) {
        ctx.scale(scale, 1);
      }
      ctx.fillText(textToDraw, 0, 0);
      console.log(`Drew text "${textToDraw}" in zone: ${zone.name}`);
    } else if (zone.type === 'number' && number) {
      const fontSize = Math.floor(zone.height);
      ctx.font = `bold ${fontSize}px ${nameFont || 'Arial'}`;
      ctx.fillStyle = numberColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Scale if number is too wide
      const metrics = ctx.measureText(number);
      const scale = Math.min(1, zone.width / metrics.width);
      if (scale < 1) {
        ctx.scale(scale, 1);
      }
      ctx.fillText(number, 0, 0);
      console.log(`Drew number "${number}" in zone: ${zone.name}`);
    } else if (zone.type === 'sponsor' && name) {
      // Basic support for sponsor text
      ctx.font = `bold ${Math.floor(zone.height)}px ${nameFont || 'Arial'}`;
      ctx.fillStyle = nameColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name.toUpperCase(), 0, 0);
      console.log(`Drew sponsor "${name}" in zone: ${zone.name}`);
    }

    ctx.restore();
  }

  return canvas;
}
