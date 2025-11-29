export function toMeters(value, unit) {
  const n = Number(value) || 0;
  switch ((unit || '').toLowerCase()) {
    case 'm': return n;
    case 'cm': return n / 100;
    case 'mm': return n / 1000;
    default: return n;
  }
}

export function kgToLiters(kg, density = 1) {
  const n = Number(kg) || 0;
  return density ? n / density : n;
}

export function litersToKg(liters, density = 1) {
  const n = Number(liters) || 0;
  return n * (density || 1);
}

export function normalizeItemQuantity(qty, unit) {
  // keep original unit but compute a normalized value in meters for totals if needed
  return { qty: Number(qty) || 0, unit };
}
