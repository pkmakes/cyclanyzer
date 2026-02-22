/**
 * Export the Recharts SVG chart as a PNG file.
 *
 * Works by cloning the SVG, inlining all computed styles (to resolve
 * CSS variables and class-based styles), rendering to an off-screen
 * canvas at 2x resolution, and triggering a download.
 */
export async function exportChartAsPng(
  containerSelector = '.panel--chart .recharts-wrapper svg',
  filename = 'diagramm.png'
): Promise<void> {
  const svgElement = document.querySelector(containerSelector) as SVGSVGElement | null;
  if (!svgElement) return;

  const { width, height } = svgElement.getBoundingClientRect();
  if (width === 0 || height === 0) return;

  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  inlineComputedStyles(svgElement, clone);

  let svgData = new XMLSerializer().serializeToString(clone);
  svgData = resolveCssVariables(svgData);

  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();

  return new Promise<void>((resolve) => {
    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      resolve();
    };
    img.onerror = () => resolve();
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  });
}

const SVG_STYLE_PROPS = [
  'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
  'font-size', 'font-family', 'font-weight', 'opacity',
] as const;

function inlineComputedStyles(original: Element, clone: Element): void {
  if (original instanceof SVGElement && clone instanceof SVGElement) {
    const computed = getComputedStyle(original);
    for (const prop of SVG_STYLE_PROPS) {
      const val = computed.getPropertyValue(prop);
      if (val) clone.style.setProperty(prop, val);
    }
  }

  const origChildren = original.children;
  const cloneChildren = clone.children;
  for (let i = 0; i < origChildren.length && i < cloneChildren.length; i++) {
    inlineComputedStyles(origChildren[i], cloneChildren[i]);
  }
}

function resolveCssVariables(svgString: string): string {
  const style = getComputedStyle(document.documentElement);
  return svgString.replace(/var\(--([^)]+)\)/g, (original, varName: string) => {
    const resolved = style.getPropertyValue(`--${varName}`).trim();
    return resolved || original;
  });
}
