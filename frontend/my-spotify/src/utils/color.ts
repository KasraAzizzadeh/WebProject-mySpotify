export function darken(hex: string, amount = 0.25, alpha = 1) : string {
  const num = parseInt(hex.slice(1), 16);

  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}