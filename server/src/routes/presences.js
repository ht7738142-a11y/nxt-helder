import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import PresenceJournal from '../models/PresenceJournal.js';
import MainCompany from '../models/MainCompany.js';
import Chantier from '../models/Chantier.js';
import multer from 'multer';
import Papa from 'papaparse';
import PDFDocument from 'pdfkit';

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

// POST - Créer les journaux de présence
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { chantierId, date, mainCompanyName, journals } = req.body;
    
    if (!chantierId || !date || !mainCompanyName || !journals) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const createdJournals = [];

    // Sauvegarder l'entreprise principale
    if (mainCompanyName) {
      await MainCompany.findOneAndUpdate(
        { user: userId, name: mainCompanyName },
        { user: userId, name: mainCompanyName, lastUsedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    // Créer les journaux
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

// GET - Export PDF d'un journal
router.get('/:id/pdf', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const journal = await PresenceJournal.findOne({ _id: id, user: userId });

    if (!journal) {
      return res.status(404).json({ error: 'Journal non trouvé' });
    }

    // Récupérer les infos du chantier
    const chantier = await Chantier.findById(journal.chantier);
    const chantierName = chantier ? chantier.title : 'Chantier inconnu';

    // Créer le document PDF
    const doc = new PDFDocument({ margin: 50 });

    // Headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="journal-presence-${journal.date}.pdf"`);

    // Pipe le PDF vers la réponse
    doc.pipe(res);

    // En-tête
    doc.fontSize(20).text('Journal de Présences', { align: 'center' });
    doc.moveDown();

    // Infos générales
    doc.fontSize(12);
    doc.text(`Date: ${new Date(journal.date).toLocaleDateString('fr-BE')}`);
    doc.text(`Chantier: ${chantierName}`);
    doc.text(`Entreprise ST Principale: ${journal.mainCompanyName}`);
    doc.text(`Sous-traitant: ${journal.subcontractorName}`);
    if (journal.subcontractorNumber) {
      doc.text(`N° Entreprise: ${journal.subcontractorNumber}`);
    }
    doc.moveDown();

    // Tableau des ouvriers
    doc.fontSize(14).text('Liste des ouvriers présents:', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10);
    const tableTop = doc.y;
    const colWidths = { niss: 120, firstName: 100, lastName: 100, present: 80, remarks: 120 };
    let y = tableTop;

    // En-têtes du tableau
    doc.font('Helvetica-Bold');
    doc.text('NISS', 50, y, { width: colWidths.niss, continued: false });
    doc.text('Prénom', 50 + colWidths.niss, y, { width: colWidths.firstName, continued: false });
    doc.text('Nom', 50 + colWidths.niss + colWidths.firstName, y, { width: colWidths.lastName, continued: false });
    doc.text('Présent', 50 + colWidths.niss + colWidths.firstName + colWidths.lastName, y, { width: colWidths.present, continued: false });
    doc.text('Remarques', 50 + colWidths.niss + colWidths.firstName + colWidths.lastName + colWidths.present, y, { width: colWidths.remarks, continued: false });
    
    y += 20;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 5;

    // Lignes du tableau
    doc.font('Helvetica');
    journal.workers.forEach((worker, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(worker.niss || '', 50, y, { width: colWidths.niss, continued: false });
      doc.text(worker.firstName || '', 50 + colWidths.niss, y, { width: colWidths.firstName, continued: false });
      doc.text(worker.lastName || '', 50 + colWidths.niss + colWidths.firstName, y, { width: colWidths.lastName, continued: false });
      doc.text(worker.present ? 'Oui' : 'Non', 50 + colWidths.niss + colWidths.firstName + colWidths.lastName, y, { width: colWidths.present, continued: false });
      doc.text(worker.remarks || '', 50 + colWidths.niss + colWidths.firstName + colWidths.lastName + colWidths.present, y, { width: colWidths.remarks, continued: false });

      y += 20;
    });

    // Pied de page
    doc.moveDown(2);
    doc.fontSize(8).text(`Document généré le ${new Date().toLocaleString('fr-BE')}`, { align: 'center' });

    // Finaliser le PDF
    doc.end();
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
