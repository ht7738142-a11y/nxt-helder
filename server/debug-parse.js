import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'data/cctb.xlsx');
console.log('📂 Fichier:', filePath);

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
console.log(`\n📄 Test avec feuille: ${sheetName}`);

const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log(`Total lignes: ${data.length}\n`);

// Test de parsing comme dans le code serveur
const codeIdx = 0;
const libelleIdx = 1;
const uniteIdx = 2;
const chapitreIdx = -1;
const items = [];

for (let i = 0; i < Math.min(10, data.length); i++) {
  const row = data[i];
  console.log(`Ligne ${i}:`, row);
  
  if (!row || row.length === 0) {
    console.log('  -> Ligne vide (row null ou length 0)');
    continue;
  }
  
  const code = row[codeIdx];
  const libelle = row[libelleIdx];
  
  console.log(`  Code: "${code}", Libellé: "${libelle}"`);
  
  if (!code && !libelle) {
    console.log('  -> Ignorée (pas de code ni libellé)');
    continue;
  }
  
  const item = {
    code: code ? String(code).trim() : '',
    libelle: libelle ? String(libelle).trim() : '',
    unite: uniteIdx !== -1 && row[uniteIdx] ? String(row[uniteIdx]).trim() : '',
    chapitre: chapitreIdx !== -1 && row[chapitreIdx] ? String(row[chapitreIdx]).trim() : sheetName,
    sheet: sheetName
  };
  
  console.log('  -> Item créé:', item);
  items.push(item);
}

console.log(`\n✅ Total items créés: ${items.length}`);
