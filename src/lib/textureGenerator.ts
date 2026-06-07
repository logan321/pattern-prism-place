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
  };
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

  // 1. Draw Base Texture
  if (baseTextureUrl) {
    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      baseImg.onload = resolve;
      baseImg.onerror = reject;
      baseImg.src = baseTextureUrl;
    });
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
  } else {
    // Fallback or transparent
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // 2. Draw Zones
  for (const zone of zones) {
    ctx.save();
    
    // Translate to zone center
    ctx.translate(zone.x, zone.y);
    ctx.rotate((zone.rotation * Math.PI) / 180);

    const { name, number, shieldUrl, nameColor, numberColor, nameFont } = customizations;

    if (zone.type === 'logo' && shieldUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = shieldUrl;
        });
        ctx.drawImage(img, -zone.width / 2, -zone.height / 2, zone.width, zone.height);
      } catch (e) {
        console.warn('Failed to load shield image for zone:', zone.name, e);
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
      ctx.fillText(number, 0, 0);
    }

    ctx.restore();
  }

  return canvas;
}
