import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'data/cctb.xlsx');
console.log('📂 Lecture fichier:', filePath);

try {
  const workbook = XLSX.readFile(filePath);
  console.log('📋 Feuilles:', workbook.SheetNames);
  
  // Lire la première feuille
  const firstSheet = workbook.SheetNames[0];
  console.log(`\n📄 Analyse de la feuille "${firstSheet}":`);
  
  const sheet = workbook.Sheets[firstSheet];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  console.log(`Total lignes: ${data.length}`);
  console.log('\n🔍 Premières 15 lignes:');
  data.slice(0, 15).forEach((row, i) => {
    console.log(`Ligne ${i}:`, row);
  });
  
} catch (err) {
  console.error('❌ Erreur:', err);
}
