// Point 110: OCR extraction factures fournisseurs (structure basique)
// En production: intégrer Tesseract.js ou API Google Vision

export async function extractInvoiceData(filePath) {
  // TODO: Intégrer OCR réel (Tesseract, Google Vision, AWS Textract)
  // Pour l'instant: structure mock pour démonstration
  
  return {
    extracted: true,
    confidence: 0.85,
    data: {
      supplier: 'Fournisseur XYZ',
      invoiceNumber: 'INV-2024-001',
      date: new Date().toISOString(),
      totalAmount: 1250.50,
      items: [
        { description: 'Matériel électrique', quantity: 10, unitPrice: 50, total: 500 },
        { description: 'Câbles', quantity: 100, unitPrice: 7.5, total: 750 }
      ],
      taxRate: 0.21,
      notes: 'Paiement Net 30'
    },
    rawText: 'Mock OCR text output...',
    warnings: ['Low confidence on supplier name', 'Date format ambiguous']
  };
}

// Point 111: Validation auto données extraites
export function validateExtractedData(data) {
  const errors = [];
  const warnings = [];
  
  if (!data.supplier || data.supplier.length < 3) errors.push('Supplier name too short or missing');
  if (!data.invoiceNumber) errors.push('Invoice number missing');
  if (!data.totalAmount || data.totalAmount <= 0) errors.push('Invalid total amount');
  if (!data.date) errors.push('Date missing');
  
  // Check totals consistency
  const itemsTotal = (data.items || []).reduce((sum, item) => sum + (item.total || 0), 0);
  const expectedTotal = itemsTotal * (1 + (data.taxRate || 0));
  if (Math.abs(expectedTotal - data.totalAmount) > 1) {
    warnings.push(`Total mismatch: expected ${expectedTotal.toFixed(2)}, got ${data.totalAmount}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    confidence: data.confidence || 0
  };
}

// Point 112: Auto-création facture fournisseur depuis OCR
export async function createSupplierInvoiceFromOCR(extractedData) {
  // Validate first
  const validation = validateExtractedData(extractedData);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }
  
  // TODO: Créer FactureFournisseur model et intégrer ici
  const invoiceData = {
    supplier: extractedData.supplier,
    number: extractedData.invoiceNumber,
    date: new Date(extractedData.date),
    items: extractedData.items,
    totals: {
      subtotal: extractedData.items.reduce((s, i) => s + i.total, 0),
      taxRate: extractedData.taxRate || 0.21,
      tax: extractedData.items.reduce((s, i) => s + i.total, 0) * (extractedData.taxRate || 0.21),
      grandTotal: extractedData.totalAmount
    },
    status: 'unpaid',
    extractedBy: 'OCR',
    confidence: extractedData.confidence
  };
  
  return { success: true, invoice: invoiceData, warnings: validation.warnings };
}
