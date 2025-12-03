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

    // Créer ou mettre à jour les journaux (fusion des ouvriers)
    for (const journal of journals) {
      // Chercher si un journal existe déjà pour cette entreprise, date et chantier
      const existingJournal = await PresenceJournal.findOne({
        user: userId,
        chantier: chantierId,
        date,
        subcontractorName: journal.subcontractorName
      });

      if (existingJournal) {
        // Journal existe : fusionner les ouvriers (éviter les doublons basés sur NISS)
        const existingWorkers = existingJournal.workers || [];
        const newWorkers = journal.workers || [];
        
        // Créer un Map des ouvriers existants par NISS
        const workersMap = new Map();
        existingWorkers.forEach(worker => {
          if (worker.niss) {
            workersMap.set(worker.niss, worker);
          }
        });
        
        // Ajouter ou mettre à jour avec les nouveaux ouvriers
        newWorkers.forEach(worker => {
          if (worker.niss) {
            workersMap.set(worker.niss, worker);
          }
        });
        
        // Convertir le Map en tableau
        const mergedWorkers = Array.from(workersMap.values());
        
        // Mettre à jour le journal existant
        existingJournal.workers = mergedWorkers;
        existingJournal.mainCompanyName = mainCompanyName;
        if (journal.subcontractorNumber) {
          existingJournal.subcontractorNumber = journal.subcontractorNumber;
        }
        await existingJournal.save();
        
        createdJournals.push(existingJournal);
      } else {
        // Journal n'existe pas : en créer un nouveau
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

    // Créer le document PDF (format A4)
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    // Headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="journal-presence-${journal.date}.pdf"`);

    // Pipe le PDF vers la réponse
    doc.pipe(res);

    const pageWidth = 595.28; // A4 width in points
    const margin = 40;
    const contentWidth = pageWidth - 2 * margin;

    let y = margin;

    // En-tête - Titre centré avec bordure
    doc.rect(margin, y, contentWidth, 25).stroke();
    doc.fontSize(11).font('Helvetica-Bold').fillColor('black');
    doc.text('LISTE JOURNALIÈRE DES PRÉSENCES SOUS-TRAITANT', margin, y + 8, {
      width: contentWidth,
      align: 'center',
      underline: true
    });

    y += 25;

    // Section chantier (fond gris)
    doc.rect(margin, y, contentWidth, 35).fillAndStroke('#f0f0f0', 'black');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('black');
    
    // Chantier à gauche
    doc.text(`CHANTIER :`, margin + 10, y + 8);
    doc.font('Helvetica').fontSize(8);
    doc.text(`${chantierName}`, margin + 80, y + 8);
    doc.text(`Rue du puits communal, 103 6540 Farciennes`, margin + 80, y + 20);
    
    // Date à droite
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text(`DATE :`, pageWidth - margin - 110, y + 8);
    doc.font('Helvetica').fontSize(8);
    doc.text(`${new Date(journal.date).toLocaleDateString('fr-BE')}`, pageWidth - margin - 80, y + 8);

    y += 35;

    // Section chaîne de sous-traitance (sans rectangle fixe)
    doc.fontSize(9).font('Helvetica-Bold').fillColor('black');
    doc.text('CHAÎNE DE SOUS-TRAITANCE :', margin, y);

    y += 15;
    doc.fontSize(8).font('Helvetica');
    doc.text('NIV 1', margin + 10, y);
    doc.font('Helvetica-Bold');
    doc.text('ENTREPRISE ST PRINCIPALE :', margin + 50, y);
    doc.font('Helvetica');
    doc.text(journal.mainCompanyName.toUpperCase(), margin + 200, y);
    doc.text('TVA : BE 0793.708.636', pageWidth - margin - 130, y);

    y += 15;
    doc.text('NIV 2 :', margin + 10, y);
    doc.font('Helvetica-Bold');
    doc.text('ST de L\'ENTREPRISE PRINCIPALE :', margin + 50, y);
    doc.font('Helvetica');
    doc.text(journal.subcontractorName.toUpperCase(), margin + 200, y);
    if (journal.subcontractorNumber) {
      doc.text(`TVA : ${journal.subcontractorNumber}`, pageWidth - margin - 130, y);
    }

    // Petite ligne de séparation juste sous NIV 2
    y += 5;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();

    // Le tableau commence presque directement après NIV 2
    const tableStartY = y + 3;

    // Tableau simplifié : NISS | Prénom | Nom | Présent | Remarques
    const colX = {
      niss: margin,
      prenom: margin + 100,
      nom: margin + 200,
      present: margin + 300,
      remarques: margin + 380
    };

    const headerHeight = 25;
    const rowHeight = 30;
    
    // Calculer la hauteur du tableau en fonction du nombre d'ouvriers (minimum 3 lignes)
    const numWorkers = Math.max(journal.workers.length, 3);
    const tableHeight = headerHeight + (numWorkers * rowHeight);

    // Bordure extérieure du tableau
    doc.rect(margin, tableStartY, contentWidth, tableHeight).stroke();
    
    // Lignes verticales du tableau
    doc.moveTo(colX.prenom, tableStartY).lineTo(colX.prenom, tableStartY + tableHeight).stroke();
    doc.moveTo(colX.nom, tableStartY).lineTo(colX.nom, tableStartY + tableHeight).stroke();
    doc.moveTo(colX.present, tableStartY).lineTo(colX.present, tableStartY + tableHeight).stroke();
    doc.moveTo(colX.remarques, tableStartY).lineTo(colX.remarques, tableStartY + tableHeight).stroke();

    // Ligne horizontale sous en-têtes (simple séparation)
    doc.moveTo(margin, tableStartY + headerHeight).lineTo(pageWidth - margin, tableStartY + headerHeight).stroke();

    // En-têtes du tableau (fond blanc, uniquement le texte)
    doc.fontSize(9).font('Helvetica-Bold').fillColor('black');
    doc.text('NISS', colX.niss + 5, tableStartY + 8, { width: 90 });
    doc.text('Prénom', colX.prenom + 5, tableStartY + 8, { width: 90 });
    doc.text('Nom', colX.nom + 5, tableStartY + 8, { width: 90 });
    doc.text('Présent', colX.present + 5, tableStartY + 8, { width: 70 });
    doc.text('Remarques', colX.remarques + 5, tableStartY + 8, { width: pageWidth - margin - colX.remarques - 10 });

    // Remplir les lignes d'ouvriers (seulement celles qui existent)
    // Trier les ouvriers : présents en premier, absents en bas
    const sortedWorkers = [...journal.workers].sort((a, b) => {
      const aPresent = a.present !== false;
      const bPresent = b.present !== false;
      if (aPresent && !bPresent) return -1;
      if (!aPresent && bPresent) return 1;
      return 0;
    });
    
    const firstRowY = tableStartY + headerHeight;
    
    doc.fontSize(8).font('Helvetica');
    
    sortedWorkers.forEach((worker, index) => {
      const rowY = firstRowY + (index * rowHeight);
      
      // NISS
      doc.fillColor('black');
      doc.text(worker.niss || '', colX.niss + 5, rowY + 10, { width: 90 });
      
      // Prénom (sans espaces inutiles)
      const prenom = (worker.firstName || '').trim();
      doc.text(prenom.toUpperCase(), colX.prenom + 5, rowY + 10, { width: 90 });
      
      // Nom (sans espaces inutiles)
      const nom = (worker.lastName || '').trim();
      doc.text(nom.toUpperCase(), colX.nom + 5, rowY + 10, { width: 90 });
      
      // Présent (Oui en vert, Non en rouge)
      const isPresent = worker.present !== false;
      if (isPresent) {
        doc.fillColor('green').font('Helvetica-Bold');
        doc.text('Oui', colX.present + 5, rowY + 10);
      } else {
        doc.fillColor('red').font('Helvetica-Bold');
        doc.text('Non', colX.present + 5, rowY + 10);
      }
      doc.fillColor('black').font('Helvetica');
      
      // Remarques
      doc.text(worker.remarks || '', colX.remarques + 5, rowY + 10, {
        width: pageWidth - margin - colX.remarques - 10
      });
      
      // Ligne horizontale (sauf la dernière qui est la bordure du tableau)
      if (index < sortedWorkers.length - 1) {
        doc.moveTo(margin, rowY + rowHeight).lineTo(pageWidth - margin, rowY + rowHeight).stroke();
      }
    });

    // Section signature (espace augmenté)
    y = tableStartY + tableHeight + 40;
    doc.fillColor('black').fontSize(8).font('Helvetica-Bold');
    doc.text('SIGNATURE DU CHEF DE CHANTIER OU SOUS-TRAITANT :', margin + 10, y);
    y += 15;
    doc.font('Helvetica-Oblique').fontSize(7);
    doc.text('NOM, Prénom & Fonction', margin + 10, y);

    // Avertissement en bas (rouge)
    y += 40;
    const warningStartY = y;
    doc.fontSize(7).font('Helvetica-Bold').fillColor('red');
    doc.text('IMPORTANT : Ce document doit être complété et signé chaque matin par le responsable du chantier de l\'entreprise avec laquelle nous travaillons. Cela se passe avant l\'heure de pointage. Nous devons toujours savoir qui interviennent de nos sous-traitant sous-traitant sur le chantier.', margin + 10, y, {
      width: contentWidth - 20,
      align: 'center'
    });

    // Calculer la hauteur du texte d'avertissement (environ 3 lignes)
    y += 30;

    // Tracer la bordure extérieure du document (s'adapte au contenu)
    const documentHeight = y - margin + 10;
    doc.rect(margin, margin, contentWidth, documentHeight).stroke();

    // Finaliser le PDF
    doc.end();
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
