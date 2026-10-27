// entirely vibed the text layout part, font choice and colors and design / svg all mine :peace:

import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// These assets are bundled in the repository, so builds need no installed fonts.
const template = readFileSync(resolve('public/newog.svg'), 'utf8');
const titleFont = resolve('public/fonts/Redaction35-Regular.otf');
const domainFont = resolve('public/fonts/DepartureMonoNerdFont-Regular.otf');
const titleOptions = { font: { loadSystemFonts: false, fontFiles: [titleFont] } };
const renderOptions = { font: { loadSystemFonts: false, fontFiles: [titleFont, domainFont] } };
const titleFamily = 'Redaction 35';
const domainFamily = 'DepartureMono Nerd Font';
const foreground = '#D6FFD6'; // Dark theme's resolved var(--fg).
const titleWidth = 489;
const titleHeight = 432;
const initialFontSize = 72;

function svg(contents: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">${contents}</svg>`;
}

function escapeXML(text: string) {
  return text.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[character]!);
}

export function buildOG(title: string) {
  const widths = new Map<string, number>();
  function measure(text: string) {
    if (!widths.has(text)) {
      const bounds = new Resvg(svg(
        `<text font-family="${titleFamily}" font-size="${initialFontSize}">${escapeXML(text)}</text>`,
      ), titleOptions).getBBox();
      // Include side bearings so every line fits even when glyphs overhang x=0.
      widths.set(text, bounds ? bounds.width + Math.abs(bounds.x) : 0);
    }
    return widths.get(text)!;
  }

  function wrap(fontSize: number) {
    const lines: string[] = [];
    let line = '';
    const fits = (text: string) => measure(text) * fontSize / initialFontSize <= titleWidth;
    for (const word of title.trim().split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (fits(candidate)) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = '';
      // Split long words by Unicode code point rather than clipping them.
      for (const character of word) {
        if (line && !fits(line + character)) {
          lines.push(line);
          line = '';
        }
        line += character;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  let fontSize = initialFontSize;
  let titleText: string;
  let bounds;
  do {
    const lines = wrap(fontSize);
    titleText = `<text font-family="${titleFamily}" font-size="${fontSize}">${lines.map((line, index) =>
      `<tspan x="0" y="${index * fontSize * 1.2}">${escapeXML(line)}</tspan>`,
    ).join('')}</text>`;
    bounds = new Resvg(svg(titleText), titleOptions).getBBox();
    if (!bounds || (bounds.height <= titleHeight && bounds.width <= titleWidth)) break;
    fontSize *= 0.95;
  } while (true);

  const domainText = `<text font-family="${domainFamily}" font-size="24">hrtowii.dev</text>`;
  const domainBounds = new Resvg(svg(domainText), renderOptions).getBBox()!;
  // SVG has no flex layout: reproduce a column with justify-content: space-around.
  const columnTop = 74;
  const columnHeight = 630 - columnTop * 2;
  const renderedTitleHeight = bounds?.height ?? 0;
  const space = (columnHeight - renderedTitleHeight - domainBounds.height) / 4;
  const titleTop = columnTop + space;
  const domainTop = titleTop + renderedTitleHeight + space * 2;
  const titleGroup = `<g transform="translate(${67 - (bounds?.x ?? 0)} ${titleTop - (bounds?.y ?? 0)})">${titleText}</g>`;
  const domainGroup = `<g transform="translate(${67 - domainBounds.x} ${domainTop - domainBounds.y})">${domainText}</g>`;
  const image = template.replace(/<\/svg>\s*$/, `<g fill="${foreground}">${titleGroup}${domainGroup}</g></svg>`);
  return new Resvg(image, renderOptions).render().asPng();
}
