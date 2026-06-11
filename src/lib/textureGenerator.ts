import * as THREE from 'three';

export interface UVZone {
  id: string;
  name: string;
  type: 'logo' | 'text' | 'number' | 'sponsor';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
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
    numberFont?: string;
    formation?: string;
  };
}

// ─── Tipos do novo sistema UV compositor ───────────────────────────────────

export interface UvZoneRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  label?: string;
}

export type UvLayer =
  | {
      id: string;
      zoneKey: string;
      type: 'text';
      content: string;
      fontFamily?: string;
      fontWeight?: string | number;
      color?: string;
      strokeColor?: string;
      strokeWidth?: number;
      fontSize?: number;
      curvature?: number;
      rotation?: number;
      scale?: number;
      offsetX?: number;
      offsetY?: number;
    }
  | {
      id: string;
      zoneKey: string;
      type: 'image';
      url: string;
      rotation?: number;
      scale?: number;
      offsetX?: number;
      offsetY?: number;
      opacity?: number;
    };

// ─── Cache de imagens ───────────────────────────────────────────────────────

const imgCache = new Map<string, Promise<HTMLImageElement>>();

function loadCachedImage(url: string): Promise<HTMLImageElement> {
  if (!url) return Promise.reject(new Error('empty url'));
  if (imgCache.has(url)) return imgCache.get(url)!;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
  imgCache.set(url, p);
  return p;
}

// ─── Motor UV compositor (novo sistema) ────────────────────────────────────

export async function composeUvTexture(opts: {
  baseUrl: string;
  uvWidth?: number | null;
  uvHeight?: number | null;
  zones: Record<string, UvZoneRect>;
  layers: UvLayer[];
  canvas?: HTMLCanvasElement;
}): Promise<HTMLCanvasElement> {
  const base = await loadCachedImage(opts.baseUrl);
  const w = opts.uvWidth || base.naturalWidth;
  const h = opts.uvHeight || base.naturalHeight;
  const canvas = opts.canvas ?? document.createElement('canvas');
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(base, 0, 0, w, h);

  for (const layer of opts.layers) {
    const zone = opts.zones[layer.zoneKey];
    if (!zone) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(zone.x - zone.width / 2, zone.y - zone.height / 2, zone.width, zone.height);
    ctx.clip();
    const cx = zone.x + (layer.offsetX ?? 0);
    const cy = zone.y + (layer.offsetY ?? 0);
    ctx.translate(cx, cy);
    if (layer.rotation) ctx.rotate(layer.rotation);
    const scale = layer.scale ?? 1;

    if (layer.type === 'text') {
      const family = layer.fontFamily || 'Arial';
      const weight = layer.fontWeight ?? 700;
      const targetW = zone.width * 0.92 * scale;
      const targetH = zone.height * 0.92 * scale;
      let size = Math.max(8, layer.fontSize ?? targetH);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 12; i++) {
        ctx.font = `${weight} ${size}px ${family}`;
        const m = ctx.measureText(layer.content || ' ');
        if (m.width <= targetW) break;
        size *= targetW / Math.max(m.width, 1);
      }
      ctx.font = `${weight} ${size}px ${family}`;

      const drawText = (stroke: boolean) => {
        const curvature = layer.curvature ?? 0;
        if (!curvature) {
          if (stroke) ctx.strokeText(layer.content, 0, 0);
          else ctx.fillText(layer.content, 0, 0);
          return;
        }
        const text = layer.content || '';
        const radius = Math.max(targetW, targetH) * (140 / Math.max(Math.abs(curvature), 1));
        const direction = curvature > 0 ? -1 : 1;
        const totalWidth = ctx.measureText(text).width;
        let cursor = -totalWidth / 2;
        for (const ch of text) {
          const cw = ctx.measureText(ch).width;
          const angle = (cursor + cw / 2) / radius;
          ctx.save();
          ctx.rotate(angle * direction);
          ctx.translate(0, -radius * direction);
          ctx.rotate(-angle * direction);
          if (stroke) ctx.strokeText(ch, 0, radius * direction);
          else ctx.fillText(ch, 0, radius * direction);
          ctx.restore();
          cursor += cw;
        }
      };

      if (layer.strokeWidth && layer.strokeWidth > 0) {
        ctx.lineJoin = 'round';
        ctx.strokeStyle = layer.strokeColor || '#000';
        ctx.lineWidth = layer.strokeWidth;
        drawText(true);
      }
      ctx.fillStyle = layer.color || '#ffffff';
      drawText(false);
    } else {
      try {
        const img = await loadCachedImage(layer.url);
        ctx.globalAlpha = layer.opacity ?? 1;
        const zw = zone.width * scale;
        const zh = zone.height * scale;
        const ratio = Math.min(zw / img.naturalWidth, zh / img.naturalHeight);
        const dw = img.naturalWidth * ratio;
        const dh = img.naturalHeight * ratio;
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      } catch (e) {
        // imagem falhou; ignora
      }
    }
    ctx.restore();
  }
  return canvas;
}

// ─── Sistema legado (mantido para compatibilidade) ──────────────────────────

async function loadImage(url: string): Promise<HTMLImageElement> {
  return loadCachedImage(url);
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (baseTextureUrl) {
    try {
      const baseImg = await loadImage(baseTextureUrl);
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
    } catch (e) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const { name, number, shieldUrl, nameColor, numberColor, nameFont, numberFont } = customizations;

  for (const zone of zones) {
    ctx.save();
    ctx.translate(zone.x, zone.y);
    ctx.rotate((zone.rotation * Math.PI) / 180);
    const font = nameFont || 'Arial';

    if (zone.type === 'logo' && shieldUrl) {
      try {
        const img = await loadImage(shieldUrl);
        ctx.drawImage(img, -zone.width / 2, -zone.height / 2, zone.width, zone.height);
      } catch (e) {}
    } else if (zone.type === 'text' && name) {
      const textToDraw = name.toUpperCase();
      const fontSize = Math.floor(zone.height);
      ctx.font = `bold ${fontSize}px ${font}`;
      ctx.fillStyle = nameColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const metrics = ctx.measureText(textToDraw);
      const scale = Math.min(1, zone.width / metrics.width);
      if (scale < 1) ctx.scale(scale, 1);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = fontSize * 0.05;
      ctx.strokeText(textToDraw, 0, 0);
      ctx.fillText(textToDraw, 0, 0);
    } else if (zone.type === 'number' && number) {
      const fontSize = Math.floor(zone.height);
      const fontNum = numberFont || nameFont || 'Arial';
      ctx.font = `bold ${fontSize}px ${fontNum}`;
      ctx.fillStyle = numberColor || '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const metrics = ctx.measureText(number);
      const scale = Math.min(1, zone.width / metrics.width);
      if (scale < 1) ctx.scale(scale, 1);
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