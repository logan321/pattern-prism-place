const BLOCKED_SVG_SELECTORS = ["script", "foreignObject", "iframe", "object", "embed"];
const UNSAFE_STYLE_PATTERN = /url\s*\(|@import|expression\s*\(/i;
const UNSAFE_URL_PATTERN = /^\s*(?:javascript:|vbscript:|data:(?!image\/))/i;

const COLOR_ATTRS = [
  "fill",
  "stroke",
  "stop-color",
  "flood-color",
  "lighting-color",
  "color",
  "solid-color",
];

const NON_COLOR_VALUES = new Set([
  "none",
  "transparent",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "context-fill",
  "context-stroke",
]);

function parseSvgDocument(markup: string) {
  const parser = new DOMParser();
  return parser.parseFromString(markup, "image/svg+xml");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalize ANY CSS color value (#abc, #aabbcc, rgb(), rgba(), hsl(), named)
 * into uppercase #RRGGBB hex. Returns null for non-color values (none, url(...), etc.)
 * Uses the browser's canvas color parser for full CSS coverage.
 */
function toHex(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (NON_COLOR_VALUES.has(lower)) return null;
  if (lower.startsWith("url(")) return null;

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Set a known sentinel first so invalid values are detected (fillStyle won't change).
    ctx.fillStyle = "#000000";
    const before = ctx.fillStyle;
    ctx.fillStyle = trimmed;
    const computed = ctx.fillStyle;
    if (computed === before && trimmed.toLowerCase() !== "#000000" && trimmed.toLowerCase() !== "black") {
      // Invalid color string the canvas refused to parse.
      return null;
    }
    if (typeof computed === "string" && computed.startsWith("#")) {
      return computed.toUpperCase();
    }
    if (typeof computed === "string") {
      const m = computed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
      if (m) {
        const hex =
          "#" +
          [m[1], m[2], m[3]]
            .map((n) => Number(n).toString(16).padStart(2, "0"))
            .join("");
        return hex.toUpperCase();
      }
    }
  } catch {
    return null;
  }
  return null;
}

function normalizeStyleAttribute(style: string) {
  return style.replace(/([a-zA-Z-]+)\s*:\s*([^;]+)/g, (match, prop: string, val: string) => {
    if (COLOR_ATTRS.includes(prop.toLowerCase())) {
      const hex = toHex(val);
      if (hex) return `${prop}:${hex}`;
    }
    return match;
  });
}

function normalizeStyleBlock(css: string) {
  const propsPattern = COLOR_ATTRS.join("|");
  const re = new RegExp(`(${propsPattern})\\s*:\\s*([^;}\\n]+)`, "gi");
  return css.replace(re, (match, prop: string, val: string) => {
    const hex = toHex(val);
    return hex ? `${prop}:${hex}` : match;
  });
}

function normalizeColorsInDocument(doc: Document) {
  const all = Array.from(doc.getElementsByTagName("*"));
  for (const element of all) {
    for (const attr of COLOR_ATTRS) {
      const v = element.getAttribute(attr);
      if (!v) continue;
      const hex = toHex(v);
      if (hex) element.setAttribute(attr, hex);
    }

    const style = element.getAttribute("style");
    if (style) {
      element.setAttribute("style", normalizeStyleAttribute(style));
    }

    if (element.tagName.toLowerCase() === "style" && element.textContent) {
      element.textContent = normalizeStyleBlock(element.textContent);
    }
  }
}

export function sanitizeSvgMarkup(markup: string) {
  if (!markup.trim()) return "";

  const doc = parseSvgDocument(markup);
  const root = doc.documentElement;

  if (!root || root.nodeName.toLowerCase() !== "svg") {
    return "";
  }

  doc.querySelectorAll(BLOCKED_SVG_SELECTORS.join(",")).forEach((node) => node.remove());

  Array.from(doc.querySelectorAll("*")).forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();

      if (name.startsWith("on")) {
        element.removeAttribute(attribute.name);
        return;
      }

      if (name === "style" && UNSAFE_STYLE_PATTERN.test(value)) {
        element.removeAttribute(attribute.name);
        return;
      }

      if ((name === "href" || name === "xlink:href") && UNSAFE_URL_PATTERN.test(value)) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  // Normalize every color reference to uppercase #RRGGBB so that detection and
  // remapping work uniformly across hex shorthand, rgb()/rgba(), hsl(), and
  // named colors.
  normalizeColorsInDocument(doc);

  return new XMLSerializer().serializeToString(root);
}

export function extractEditableSvgColors(markup: string) {
  if (!markup.trim()) return [];

  const doc = parseSvgDocument(markup);
  const elements = Array.from(doc.getElementsByTagName("*"));
  const detectedColors = new Set<string>();

  const consider = (raw: string | null | undefined) => {
    const hex = toHex(raw ?? null);
    if (hex) detectedColors.add(hex);
  };

  elements.forEach((element) => {
    // Direct color attributes (fill, stroke, stop-color, …)
    for (const attr of COLOR_ATTRS) {
      consider(element.getAttribute(attr));
    }

    // Inline style: pull each color-bearing property
    const style = element.getAttribute("style");
    if (style) {
      const propRe = new RegExp(`(${COLOR_ATTRS.join("|")})\\s*:\\s*([^;]+)`, "gi");
      for (const m of style.matchAll(propRe)) {
        consider(m[2]);
      }
    }

    // <style> blocks inside the SVG
    if (element.tagName.toLowerCase() === "style" && element.textContent) {
      const propRe = new RegExp(`(${COLOR_ATTRS.join("|")})\\s*:\\s*([^;}\\n]+)`, "gi");
      for (const m of element.textContent.matchAll(propRe)) {
        consider(m[2]);
      }
    }
  });

  return Array.from(detectedColors).sort();
}

export function applySvgColorMapping(markup: string, mapping: Record<string, string>) {
  let updatedMarkup = markup;

  Object.entries(mapping).forEach(([original, current]) => {
    if (!original || !original.startsWith("#") || !current) return;
    const regex = new RegExp(escapeRegExp(original), "gi");
    updatedMarkup = updatedMarkup.replace(regex, current);
  });

  return updatedMarkup;
}

export function svgMarkupToDataUrl(markup: string) {
  if (!markup.trim()) return "";
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}
