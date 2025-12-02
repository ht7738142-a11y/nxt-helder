import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import PresenceJournal from '../models/PresenceJournal.js';
import MainCompany from '../models/MainCompany.js';
import multer from 'multer';
import Papa from 'papaparse';

const router = Router();
router.use(auth(true));

// Configure multer pour l'upload de fichiers
const upload = multer({ storage: multer.memoryStorage() });

// GET - Liste des entreprises principales de l'utilisateur
router.get('/main-companies', async (req, res) => {
  try {
    const userId = req.user.id;
    const companies = await MainCompany.find({ user: userId })
      .sort({ lastUsedAt: -1 })
      .limit(10);
    
    res.json(companies);
  } catch (error) {
    console.error('Erreur récupération entreprises principales:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Parser le CSV Checkinatwork et retourner les sociétés groupées
router.post('/import-checkin', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const csvContent = req.file.buffer.toString('utf-8');
    
    // Parse CSV avec PapaParse
    const results = Papa.parse(csvContent, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true
    });

    if (results.errors.length > 0) {
      console.error('Erreurs parsing CSV:', results.errors);
    }

    const data = results.data;
    
    // Grouper par entreprise
    const companiesMap = new Map();
    
    data.forEach(row => {
      const companyNumber = row["Numéro d'entreprise"] || row["Numéro d'entreprise"];
      const companyName = row["Nom de l'entreprise"] || row["Nom de l'entreprise"];
      const niss = row['NISS'];
      const lastName = row['Nom'];
      const firstName = row['Prénom'];
      const checkinDate = row['Date de Check-in'];
      
      if (!companyNumber || !companyName || !niss) {
        return; // Skip lignes invalides
      }

      if (!companiesMap.has(companyNumber)) {
        companiesMap.set(companyNumber, {
          companyNumber,
          companyName: companyName.trim(),
          workers: []
        });
      }

      companiesMap.get(companyNumber).workers.push({
        niss: niss.trim(),
        firstName: firstName ? firstName.trim() : '',
        lastName: lastName ? lastName.trim() : '',
        checkinDate: checkinDate || ''
      });
    });

    const companies = Array.from(companiesMap.values());
    
    res.json({ companies });
  } catch (error) {
    console.error('Erreur import Checkinatwork:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un ou plusieurs journaux de présence
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { chantierId, date, mainCompanyName, journals } = req.body;

    if (!chantierId || !date || !mainCompanyName || !journals || !Array.isArray(journals)) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Enregistrer/mettre à jour l'entreprise principale
    await MainCompany.findOneAndUpdate(
      { name: mainCompanyName, user: userId },
      { lastUsedAt: new Date() },
      { upsert: true, new: true }
    );

    // Créer les journaux
    const createdJournals = [];
    for (const journal of journals) {
      const newJournal = await PresenceJournal.create({
        chantier: chantierId,
        date,
        mainCompanyName,
        subcontractorName: journal.subcontractorName,
        subcontractorNumber: journal.subcontractorNumber || '',
        workers: journal.workers || [],
        user: userId
      });
      createdJournals.push(newJournal);
    }

    res.status(201).json(createdJournals);
  } catch (error) {
    console.error('Erreur création journaux:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET - Liste des journaux (filtres: chantierId, date)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { chantierId, date, startDate, endDate } = req.query;

    const query = { user: userId };

    if (chantierId) {
      query.chantier = chantierId;
    }

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const journals = await PresenceJournal.find(query)
      .populate('chantier', 'name address')
      .sort({ date: -1, createdAt: -1 });

    res.json(journals);
  } catch (error) {
    console.error('Erreur récupération journaux:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Détails d'un journal
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const journal = await PresenceJournal.findOne({ _id: id, user: userId })
      .populate('chantier', 'name address');

    if (!journal) {
      return res.status(404).json({ error: 'Journal non trouvé' });
    }

    res.json(journal);
  } catch (error) {
    console.error('Erreur récupération journal:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Modifier un journal
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Protéger certains champs
    delete updates.user;
    delete updates._id;

    const journal = await PresenceJournal.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    ).populate('chantier', 'name address');

    if (!journal) {
      return res.status(404).json({ error: 'Journal non trouvé' });
    }

    res.json(journal);
  } catch (error) {
    console.error('Erreur mise à jour journal:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE - Supprimer un journal
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const journal = await PresenceJournal.findOneAndDelete({ _id: id, user: userId });

    if (!journal) {
      return res.status(404).json({ error: 'Journal non trouvé' });
    }

    res.json({ message: 'Journal supprimé', id });
  } catch (error) {
    console.error('Erreur suppression journal:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
