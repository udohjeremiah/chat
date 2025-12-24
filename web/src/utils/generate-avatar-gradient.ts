export function generateAvatarGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const numColors = 3 + (Math.abs(hash) % 3); // 3 to 5 colors
  const colors: Array<string> = [];

  for (let i = 0; i < numColors; i++) {
    const hue = (((hash * (i + 1) * 7) % 360) + 360) % 360;
    const saturation = 60 + ((Math.abs(hash) >> (i * 3)) % 21);
    const lightness = 50 + ((Math.abs(hash) >> (i * 5)) % 16);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  // derive a unique angle from the hash: 0-360 degrees
  const angle = (((hash * 3) % 360) + 360) % 360;

  return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
}
