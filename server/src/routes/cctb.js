import express from 'express';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache pour éviter de relire le fichier à chaque requête
let cachedCCTB = null;
let cachedSheets = null;

function loadCCTB() {
  if (cachedCCTB) {
    console.log('♻️ Utilisation du cache:', cachedCCTB.length, 'items');
    return { items: cachedCCTB, sheets: cachedSheets };
  }
  
  try {
    const filePath = path.join(__dirname, '../../data/cctb.xlsx');
    console.log('📂 Chargement CCTB depuis:', filePath);
    const workbook = XLSX.readFile(filePath);
    
    cachedSheets = workbook.SheetNames;
    console.log('📋 Feuilles trouvées:', cachedSheets);
    const items = [];
    
    // Lire toutes les feuilles
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      console.log(`📄 Feuille "${sheetName}": ${data.length} lignes`);
      
      // Ce fichier CCTB n'a pas d'en-tête explicite
      // Format: Colonne 0 = Code, Colonne 1 = Libellé
      const codeIdx = 0;
      const libelleIdx = 1;
      const uniteIdx = 2; // Si présent
      const chapitreIdx = -1; // Pas de colonne chapitre dans ce fichier
      
      // Parser les données (toutes les lignes)
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        const code = row[codeIdx];
        const libelle = row[libelleIdx];
        
        if (!code && !libelle) continue; // Ligne vide
        
        items.push({
          code: code ? String(code).trim() : '',
          libelle: libelle ? String(libelle).trim() : '',
          unite: uniteIdx !== -1 && row[uniteIdx] ? String(row[uniteIdx]).trim() : '',
          chapitre: chapitreIdx !== -1 && row[chapitreIdx] ? String(row[chapitreIdx]).trim() : sheetName,
          sheet: sheetName
        });
      }
    }
    
    cachedCCTB = items;
    console.log(`✅ Total items chargés: ${items.length}`);
    return { items, sheets: cachedSheets };
  } catch (err) {
    console.error('❌ Erreur chargement CCTB:', err);
    return { items: [], sheets: [] };
  }
}

// POST /api/cctb/reload - Vide le cache et recharge le fichier
router.post('/reload', (req, res) => {
  cachedCCTB = null;
  cachedSheets = null;
  const { items, sheets } = loadCCTB();
  res.json({ 
    success: true, 
    message: 'Cache vidé et fichier rechargé',
    itemCount: items.length,
    sheets: sheets
  });
});

// GET /api/cctb - Retourne les items du catalogue
router.get('/', (req, res) => {
  try {
    const { q, sheet } = req.query;
    let { items, sheets } = loadCCTB();
    
    // Filtrer par feuille
    if (sheet && sheet !== 'all') {
      items = items.filter(item => item.sheet === sheet);
    }
    
    // Filtrer par recherche
    if (q) {
      const term = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const digitsOnly = q.replace(/\D+/g, '');
      
      items = items.filter(item => {
        const code = (item.code || '').toLowerCase();
        const libelle = (item.libelle || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const chapitre = (item.chapitre || '').toLowerCase();
        
        // Recherche par code numérique
        if (digitsOnly.length > 0) {
          const codeDigits = (item.code || '').replace(/\D+/g, '');
          if (codeDigits.startsWith(digitsOnly)) return true;
        }
        
        // Recherche texte
        return code.includes(term) || libelle.includes(term) || chapitre.includes(term);
      });
      
      // Tri par pertinence
      items.sort((a, b) => {
        const aCode = (a.code || '').toLowerCase();
        const bCode = (b.code || '').toLowerCase();
        const aLibelle = (a.libelle || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const bLibelle = (b.libelle || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Pour recherche numérique: priorité aux codes qui commencent par le chiffre
        if (digitsOnly) {
          const aStartsWithDigit = /^\d/.test(a.code);
          const bStartsWithDigit = /^\d/.test(b.code);
          const aCodeDigits = (a.code || '').replace(/\D+/g, '');
          const bCodeDigits = (b.code || '').replace(/\D+/g, '');
          
          // Super priorité: code commence par chiffre ET match exact au début
          const aExactStart = aStartsWithDigit && aCodeDigits.startsWith(digitsOnly);
          const bExactStart = bStartsWithDigit && bCodeDigits.startsWith(digitsOnly);
          
          if (aExactStart && !bExactStart) return -1;
          if (!aExactStart && bExactStart) return 1;
          
          // Si les deux matchent, tri numérique naturel
          if (aExactStart && bExactStart) {
            return a.code.localeCompare(b.code, 'fr', { numeric: true, sensitivity: 'base' });
          }
        }
        
        // 1. Priorité MAX: Libellé commence par le terme recherché
        const aLibelleStarts = aLibelle.startsWith(term);
        const bLibelleStarts = bLibelle.startsWith(term);
        
        if (aLibelleStarts && !bLibelleStarts) return -1;
        if (!aLibelleStarts && bLibelleStarts) return 1;
        
        // Si les deux libellés commencent par le terme, tri par code
        if (aLibelleStarts && bLibelleStarts) {
          return a.code.localeCompare(b.code, 'fr', { numeric: true, sensitivity: 'base' });
        }
        
        // 2. Priorité: Code commence par le terme recherché
        const aCodeStarts = aCode.startsWith(term);
        const bCodeStarts = bCode.startsWith(term);
        
        if (aCodeStarts && !bCodeStarts) return -1;
        if (!aCodeStarts && bCodeStarts) return 1;
        
        // 3. Tri alphanumérique naturel par code
        return a.code.localeCompare(b.code, 'fr', { numeric: true, sensitivity: 'base' });
      });
    }
    
    // Limiter résultats
    const limited = items.slice(0, 500);
    
    res.json({
      items: limited,
      count: limited.length,
      rawRows: items.length,
      sheets: sheets
    });
  } catch (err) {
    console.error('Erreur API CCTB:', err);
    res.status(500).json({ error: 'Erreur serveur', items: [], sheets: [] });
  }
});

export default router;
