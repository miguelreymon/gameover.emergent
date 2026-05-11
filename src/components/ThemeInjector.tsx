'use client';

/**
 * Inserts inline CSS that overrides the shadcn/Tailwind color variables
 * based on the user's theme settings stored in content.json.
 *
 * The tailwind tokens (`bg-primary`, `text-accent`, etc.) read from
 * `--primary` / `--accent` HSL triplets, so we just rewrite them.
 */

type ThemeShape = {
  primary?: string;
  accent?: string;
  headerBg?: string;
  announcementBg?: string;
};

// Convert "#RRGGBB" to "H S% L%" string (no hsl() wrapper, that's how shadcn vars are stored).
function hexToHslVar(hex: string | undefined): string | null {
  if (!hex || typeof hex !== 'string') return null;
  const m = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!m) return null;
  const num = parseInt(m[1], 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export default function ThemeInjector({ theme }: { theme?: ThemeShape | null }) {
  if (!theme) return null;
  const primaryHsl = hexToHslVar(theme.primary);
  const accentHsl = hexToHslVar(theme.accent);

  const lines: string[] = [];
  if (primaryHsl) {
    lines.push(`--primary: ${primaryHsl};`);
    lines.push(`--ring: ${primaryHsl};`);
  }
  if (accentHsl) {
    lines.push(`--accent: ${accentHsl};`);
  }
  if (lines.length === 0) return null;

  const css = `:root, .dark { ${lines.join(' ')} }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
