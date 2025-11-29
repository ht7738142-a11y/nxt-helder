import PDFDocument from 'pdfkit';

export function generateDevisPDF(devis, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=devis-${devis._id}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text('NXT Hélder - Devis', { align: 'center' }).moveDown();
  doc.fontSize(12).text(`Client: ${devis.client?.name || devis.client}`).moveDown();
  doc.text(`Titre: ${devis.title}`);
  doc.text(`Date: ${new Date(devis.createdAt).toLocaleDateString()}`);
  if (devis.signature?.by && devis.signature?.at) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text(`Signé par: ${devis.signature.by} le ${new Date(devis.signature.at).toLocaleString()}`);
    doc.font('Helvetica');
  }
  doc.moveDown();

  // Table header
  doc.font('Helvetica-Bold');
  doc.text('Désignation', 40, doc.y, { continued: true });
  doc.text('Qté', 260, doc.y, { continued: true });
  doc.text('Unité', 300, doc.y, { continued: true });
  doc.text('PU', 360, doc.y, { continued: true });
  doc.text('Total', 420, doc.y);
  doc.moveTo(40, doc.y + 2).lineTo(550, doc.y + 2).stroke();
  doc.moveDown(0.5);
  doc.font('Helvetica');

  devis.items.forEach(it => {
    doc.text(it.description, 40, doc.y, { continued: true });
    doc.text(String(it.quantity), 260, doc.y, { continued: true });
    doc.text(it.unit, 300, doc.y, { continued: true });
    doc.text(it.unitPrice.toFixed(2), 360, doc.y, { continued: true });
    doc.text((it.total).toFixed(2), 420, doc.y);
  });

  doc.moveDown();
  doc.text(`Sous-total: ${devis.totals.subtotal.toFixed(2)} ${devis.currency}`);
  if (typeof devis.totals.marginAmount === 'number') {
    doc.text(`Marge (${((devis.marginRate||0)*100).toFixed(0)}%): ${devis.totals.marginAmount.toFixed(2)} ${devis.currency}`);
    doc.text(`Sous-total avec marge: ${devis.totals.subtotalWithMargin.toFixed(2)} ${devis.currency}`);
  }
  doc.text(`TVA (${(devis.totals.taxRate*100).toFixed(0)}%): ${devis.totals.tax.toFixed(2)} ${devis.currency}`);
  doc.font('Helvetica-Bold').text(`Total: ${devis.totals.grandTotal.toFixed(2)} ${devis.currency}`);

  doc.end();
}

export function generateFacturePDF(facture, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=facture-${facture._id}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text('NXT Hélder - Facture', { align: 'center' }).moveDown();
  doc.fontSize(12).text(`Facture N°: ${facture.number || facture._id}`);
  doc.text(`Client: ${facture.client?.name || facture.client}`);
  doc.text(`Date: ${new Date(facture.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  doc.text(`Sous-total: ${facture.totals.subtotal.toFixed(2)} ${facture.currency}`);
  doc.text(`TVA (${(facture.totals.taxRate*100).toFixed(0)}%): ${facture.totals.tax.toFixed(2)} ${facture.currency}`);
  doc.font('Helvetica-Bold').text(`Total: ${facture.totals.grandTotal.toFixed(2)} ${facture.currency}`);
  const paid = (facture.payments||[]).reduce((a,b)=>a+Number(b.amount||0),0) + Number(facture.advance||0)
  doc.moveDown();
  doc.font('Helvetica').text(`Acomptes + paiements: ${paid.toFixed(2)} ${facture.currency}`);
  doc.text(`Solde dû: ${(facture.totals.grandTotal - paid).toFixed(2)} ${facture.currency}`);

  if (facture.payments?.length) {
    doc.moveDown().font('Helvetica-Bold').text('Paiements:');
    doc.font('Helvetica');
    facture.payments.forEach(p => {
      doc.text(`${new Date(p.date).toLocaleDateString()} - ${p.amount.toFixed(2)} ${facture.currency} (${p.method||'bank'})`)
    })
  }

  doc.end();
}

export function generateChantierPDF(chantier, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=chantier-${chantier._id}.pdf`);
  doc.pipe(res);
  doc.fontSize(18).text('NXT Hélder - Rapport Chantier', { align: 'center' }).moveDown();
  doc.fontSize(12).text(`Titre: ${chantier.title}`).moveDown(0.5);
  doc.text(`Client: ${chantier.client?.name || ''}`);
  doc.text(`Adresse: ${chantier.address || ''}`);
  doc.text(`Manager: ${chantier.manager?.name || ''}`);
  doc.text(`Statut: ${chantier.status} - Phase: ${chantier.phase || 'N/A'}`);
  doc.text(`Avancement: ${chantier.progress}%`);
  doc.text(`Budget estimé: ${chantier.costEstimate} EUR`);
  doc.text(`Coût réel: ${chantier.costActual} EUR`);
  doc.moveDown();
  if (chantier.pointages?.length) {
    doc.font('Helvetica-Bold').text('Pointages').font('Helvetica');
    chantier.pointages.slice(0, 5).forEach(p => {
      doc.text(`- ${p.user?.name || '?'}: ${p.hours}h le ${new Date(p.date).toLocaleDateString()}`);
    });
    doc.moveDown();
  }
  if (chantier.incidents?.length) {
    doc.font('Helvetica-Bold').text('Incidents').font('Helvetica');
    chantier.incidents.slice(0, 3).forEach(i => {
      doc.text(`- [${i.severity}] ${i.type}: ${i.description}`);
    });
  }
  doc.end();
}
