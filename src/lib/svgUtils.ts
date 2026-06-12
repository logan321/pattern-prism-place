const BLOCKED_SVG_SELECTORS = ["script", "foreignObject", "iframe", "object", "embed"];
const UNSAFE_STYLE_PATTERN = /url\s*\(|@import|expression\s*\(/i;
const UNSAFE_URL_PATTERN = /^\s*(?:javascript:|vbscript:|data:(?!image\/))/i;

function parseSvgDocument(markup: string) {
  const parser = new DOMParser();
  return parser.parseFromString(markup, "image/svg+xml");
}

function isPureBlack(hex: string) {
  if (!hex || typeof hex !== "string") return false;

  const cleanHex = hex.trim();
  if (!cleanHex.startsWith("#")) return false;

  let r = 0;
  let g = 0;
  let b = 0;

  if (cleanHex.length === 4) {
    r = parseInt(cleanHex[1] + cleanHex[1], 16);
    g = parseInt(cleanHex[2] + cleanHex[2], 16);
    b = parseInt(cleanHex[3] + cleanHex[3], 16);
  } else if (cleanHex.length === 7) {
    r = parseInt(cleanHex.substring(1, 3), 16);
    g = parseInt(cleanHex.substring(3, 5), 16);
    b = parseInt(cleanHex.substring(5, 7), 16);
  } else {
    return false;
  }

  return r < 30 && g < 30 && b < 30;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  return new XMLSerializer().serializeToString(root);
}

export function extractEditableSvgColors(markup: string) {
  if (!markup.trim()) return [];

  const doc = parseSvgDocument(markup);
  const elements = Array.from(doc.getElementsByTagName("*"));
  const detectedColors = new Set<string>();

  elements.forEach((element) => {
    const fill = element.getAttribute("fill");
    if (fill && fill.startsWith("#") && !isPureBlack(fill)) {
      detectedColors.add(fill.toUpperCase());
    }

    const style = element.getAttribute("style");
    if (!style) return;

    const fillMatches = style.matchAll(/fill:\s*(#[0-9a-fA-F]{3,6})/gi);
    for (const match of fillMatches) {
      if (match[1] && !isPureBlack(match[1])) {
        detectedColors.add(match[1].toUpperCase());
      }
    }
  });

  return Array.from(detectedColors);
}

export function applySvgColorMapping(markup: string, mapping: Record<string, string>) {
  let updatedMarkup = markup;

  Object.entries(mapping).forEach(([original, current]) => {
    const regex = new RegExp(escapeRegExp(original), "gi");
    updatedMarkup = updatedMarkup.replace(regex, current);
  });

  return updatedMarkup;
}

export function svgMarkupToDataUrl(markup: string) {
  if (!markup.trim()) return "";
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}
