export function speciesEmoji(species: string): string {
  const s = species.toLowerCase();
  if (s === 'cat' || s === 'chat') return '🐱';
  if (s === 'dog' || s === 'chien') return '🐶';
  if (s === 'rabbit' || s === 'lapin') return '🐰';
  if (s === 'bird' || s === 'oiseau') return '🐦';
  if (s === 'hamster') return '🐹';
  return '🐾';
}
