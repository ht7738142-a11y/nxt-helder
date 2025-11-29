// Parse simple French voice commands like:
// "Client Dupont, 10 m de câble à 8 euros" or "12 mètres de gaine à 3.5€"
// Returns { client, description, quantity, unit, unitPrice }
export function parseVoiceCommand(text) {
  const t = (text || '').toLowerCase().trim()
  const res = { client: null, description: null, quantity: null, unit: null, unitPrice: null }

  // client name after 'client '
  const clientMatch = t.match(/client\s+([a-z0-9\-_'’\s]+)/i)
  if (clientMatch) {
    res.client = clientMatch[1].replace(/[,.;].*$/, '').trim()
  }

  // quantity + unit e.g. 10 m, 12 mètres, 3.5 litre(s)
  const qtyUnit = t.match(/([0-9]+(?:[\.,][0-9]+)?)\s*(m\b|metre|mètre|mètres|metres|cm|mm|l|litre|litres|kg|pi[eè]ce|pi[eè]ces|u|m²|m3|m\^3)/i)
  if (qtyUnit) {
    res.quantity = Number(String(qtyUnit[1]).replace(',', '.'))
    const unit = qtyUnit[2]
    res.unit = unit
      .replace('metre','m').replace('mètre','m').replace('metres','m').replace('mètres','m')
      .replace('litre', 'L').replace('litres','L')
      .replace('pièce','u').replace('pièces','u')
  }

  // unit price e.g. "à 8€", "a 8 euros"
  const priceMatch = t.match(/\b[aà]\s*([0-9]+(?:[\.,][0-9]+)?)\s*(€|eur|euros)?/i)
  if (priceMatch) {
    res.unitPrice = Number(String(priceMatch[1]).replace(',', '.'))
  }

  // description after 'de ' ...
  const descMatch = t.match(/\bde\s+([^,]+?)(?:\s+a\b|\s+à\b|$)/i)
  if (descMatch) {
    res.description = descMatch[1].trim()
  }

  return res
}
