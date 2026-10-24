import { Resvg } from '@resvg/resvg-js';
import { formatDate } from './utils/blog';

function escapeXML(text: string) {
  return text.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[character]!);
}

export function buildOG(title: string, date: Date) {
  const lines = title.match(/.{1,32}(?:\s|$)|\S{1,32}/g)?.map((line) => line.trim()) ?? [];
  const fontSize = Math.min(64, Math.floor(390 / Math.max(lines.length, 1)));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="white" />
    <g fill="#171717" font-family="Helvetica, Arial, sans-serif">
      <text x="64" y="128" font-size="${fontSize}">${lines.map((line, index) =>
        `<tspan x="64" dy="${index === 0 ? 0 : fontSize * 1.2}">${escapeXML(line)}</tspan>`
      ).join('')}</text>
      <text x="64" y="566" font-size="24">${escapeXML(formatDate(date))}</text>
      <text x="1136" y="566" text-anchor="end" font-size="24">hrtowii.nekoweb.org</text>
    </g>
  </svg>`;
  return new Resvg(svg, {
    font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica', sansSerifFamily: 'Helvetica' },
  }).render().asPng();
}
