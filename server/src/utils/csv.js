export function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i]?.trim() || ''; });
    return obj;
  });
}

export function toCSV(data, headers) {
  const rows = [headers.join(',')];
  data.forEach(item => {
    const row = headers.map(h => (item[h] || '').toString().replaceAll(',', ';'));
    rows.push(row.join(','));
  });
  return rows.join('\n');
}
