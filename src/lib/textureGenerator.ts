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
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Draw Base Texture (The Print/Pattern)
  if (baseTextureUrl) {
    try {
      const baseImg = await loadImage(baseTextureUrl);
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.warn('Base texture failed to load, using white bg', e);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const { name, number, shieldUrl, nameColor, numberColor, nameFont, formation } = customizations;

  // 2. Draw Zones with "Intelligence"
  for (const zone of zones) {
    ctx.save();
    
    // Translate to zone center
    ctx.translate(zone.x, zone.y);
    ctx.rotate((zone.rotation * Math.PI) / 180);

    // INTELLIGENT MATCHING:
    // If formation is 'escudo-esq-nome-dir', we only draw shield if name contains 'ESQUERDA' or 'ESQ'
    // but better yet, let's use the zone.type and simple rules.
    
    if (zone.type === 'logo' && shieldUrl) {
      try {
        const img = await loadImage(shieldUrl);
        ctx.drawImage(img, -zone.width / 2, -zone.height / 2, zone.width, zone.height);
      } catch (e) {
        console.warn('Shield image failed to load for zone:', zone.name);
      }
    } else if (zone.type === 'text' && name) {
      ctx.font = `bold ${Math.floor(zone.height)}px ${nameFont || 'Arial'}`;
      ctx.fillStyle = nameColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const metrics = ctx.measureText(name.toUpperCase());
      const scale = Math.min(1, zone.width / metrics.width);
      if (scale < 1) {
        ctx.scale(scale, 1);
      }
      ctx.fillText(name.toUpperCase(), 0, 0);
    } else if (zone.type === 'number' && number) {
      ctx.font = `bold ${Math.floor(zone.height)}px ${nameFont || 'Arial'}`;
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
    }

    ctx.restore();
  }

  return canvas;
}
