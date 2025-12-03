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

    // Bordure extérieure du document
    doc.rect(margin, margin, contentWidth, 750).stroke();

    // En-tête - Titre centré
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('LISTE JOURNALIÈRE DES PRÉSENCES SOUS-TRAITANT', margin + 10, margin + 10, {
      width: contentWidth - 20,
      align: 'center'
    });

    // Ligne séparation
    doc.moveTo(margin, margin + 30).lineTo(pageWidth - margin, margin + 30).stroke();

    // Infos chantier et date
    let y = margin + 35;
    doc.fontSize(8).font('Helvetica');
    doc.text(`CHANTIER : ${chantierName}`, margin + 10, y);
    doc.text(`DATE : ${new Date(journal.date).toLocaleDateString('fr-BE')}`, pageWidth - margin - 110, y);

    y += 15;
    doc.text('Rue du puits communal, 103 6540 Farciennes', margin + 10, y);

    // Ligne séparation
    y += 15;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();

    // Chaîne de sous-traitance
    y += 5;
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('CHAÎNE DE SOUS-TRAITANCE :', margin + 10, y);

    y += 15;
    doc.fontSize(8).font('Helvetica');
    doc.text('NIV.1', margin + 10, y);
    doc.text('ENTREPRISE ST PRINCIPALE :', margin + 50, y);
    doc.text(journal.mainCompanyName.toUpperCase(), margin + 200, y);
    doc.text('TVA : BE 0753.708.636', pageWidth - margin - 120, y);

    y += 15;
    doc.text('NIV.2', margin + 10, y);
    doc.text('ST de L\'ENTREPRISE PRINCIPALE :', margin + 50, y);
    doc.text(journal.subcontractorName.toUpperCase(), margin + 200, y);
    if (journal.subcontractorNumber) {
      doc.text(`TVA : ${journal.subcontractorNumber}`, pageWidth - margin - 120, y);
    }

    // Ligne séparation avant tableau
    y += 20;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();

    // Tableau principal
    const tableStartY = y + 5;
    const colX = {
      nom: margin,
      niss: margin + 150,
      j: margin + 280,
      n: margin + 300,
      cns: margin + 320,
      chsctPres: margin + 340,
      chsctAbs: margin + 360,
      intPres: margin + 380,
      intAbs: margin + 400,
      absent: margin + 420,
      present: margin + 440,
      remarques: margin + 460
    };

    // En-têtes verticaux du tableau
    doc.save();
    doc.fontSize(6).font('Helvetica-Bold');
    
    // Rotation pour texte vertical
    const rotateText = (text, x, yStart) => {
      doc.save();
      doc.translate(x, yStart + 80);
      doc.rotate(-90);
      doc.text(text, 0, 0);
      doc.restore();
    };

    // En-têtes horizontaux
    doc.text('NOM, PRÉNOM', colX.nom + 5, tableStartY + 35);
    doc.text('N° REGISTRE NATIONAL', colX.niss + 5, tableStartY + 35);
    
    // En-têtes verticaux (colonnes étroites)
    rotateText('J', colX.j + 5, tableStartY);
    rotateText('N', colX.n + 5, tableStartY);
    rotateText('CNS', colX.cns + 5, tableStartY);
    rotateText('PRÉSENT', colX.chsctPres + 3, tableStartY);
    rotateText('CHSCT', colX.chsctAbs + 3, tableStartY);
    rotateText('PRÉSENT', colX.intPres + 3, tableStartY);
    rotateText('INTÉRIMAIRE', colX.intAbs + 3, tableStartY);
    rotateText('ABSENT', colX.absent + 3, tableStartY);
    doc.restore();

    doc.text('PRÉSENT', colX.present + 5, tableStartY + 35);
    doc.text('REMARQUES', colX.remarques + 5, tableStartY + 35);

    // Lignes verticales du tableau
    Object.values(colX).forEach(x => {
      doc.moveTo(x, tableStartY).lineTo(x, tableStartY + 350).stroke();
    });
    doc.moveTo(pageWidth - margin, tableStartY).lineTo(pageWidth - margin, tableStartY + 350).stroke();

    // Ligne horizontale sous en-têtes
    doc.moveTo(margin, tableStartY + 80).lineTo(pageWidth - margin, tableStartY + 80).stroke();

    // Remplir les lignes d'ouvriers
    y = tableStartY + 85;
    doc.fontSize(7).font('Helvetica');
    
    journal.workers.forEach((worker, index) => {
      if (index < 10) { // Max 10 lignes sur la page
        const rowY = y + (index * 25);
        
        // Nom et prénom
        doc.text(`${worker.lastName || ''} ${worker.firstName || ''}`.toUpperCase(), colX.nom + 5, rowY + 5, {
          width: 140,
          height: 20
        });
        
        // NISS
        doc.text(worker.niss || '', colX.niss + 5, rowY + 5);
        
        // Cases à cocher (simulées avec des carrés)
        const drawCheckbox = (x, y, checked = false) => {
          doc.rect(x + 3, y + 5, 10, 10).stroke();
          if (checked) {
            doc.text('☑', x + 3, y + 4);
          }
        };
        
        drawCheckbox(colX.j, rowY, false);
        drawCheckbox(colX.n, rowY, false);
        drawCheckbox(colX.cns, rowY, false);
        drawCheckbox(colX.chsctPres, rowY, false);
        drawCheckbox(colX.chsctAbs, rowY, false);
        drawCheckbox(colX.intPres, rowY, false);
        drawCheckbox(colX.intAbs, rowY, false);
        drawCheckbox(colX.absent, rowY, false);
        drawCheckbox(colX.present, rowY, worker.present !== false);
        
        // Remarques
        doc.text(worker.remarks || '', colX.remarques + 5, rowY + 5, {
          width: pageWidth - margin - colX.remarques - 10
        });
        
        // Ligne horizontale
        doc.moveTo(margin, rowY + 25).lineTo(pageWidth - margin, rowY + 25).stroke();
      }
    });

    // Section signature
    y = tableStartY + 355;
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('SIGNATURE DU CHEF DE CHANTIER OU SOUS-TRAITANT :', margin + 10, y);
    y += 15;
    doc.font('Helvetica-Oblique').fontSize(7);
    doc.text('NOM, Prénom & Fonction', margin + 10, y);

    // Avertissement en bas (rouge)
    y += 50;
    doc.fontSize(7).font('Helvetica-Bold').fillColor('red');
    doc.text('IMPORTANT : Ce document doit être complété et signé chaque matin par le responsable du chantier de l\'entreprise avec laquelle nous travaillons. Cela ce passe avant l\'heure de pointage. Nous devons toujours savoir qui interviennent de nos sous-traitant-sous traitant sur le chantier.', margin + 10, y, {
      width: contentWidth - 20,
      align: 'center'
    });

    // Finaliser le PDF
    doc.end();
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
