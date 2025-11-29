// Points 196-200: GraphQL API + Export Avancés

import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } from 'graphql';
import Devis from '../models/Devis.js';
import Facture from '../models/Facture.js';
import Client from '../models/Client.js';
import Chantier from '../models/Chantier.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Point 196-197: GraphQL Schema
const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    company: { type: GraphQLString }
  })
});

const DevisType = new GraphQLObjectType({
  name: 'Devis',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    status: { type: GraphQLString },
    client: { type: ClientType },
    total: { type: GraphQLInt }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    client: {
      type: ClientType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Client.findById(args.id);
      }
    },
    clients: {
      type: new GraphQLList(ClientType),
      args: {
        limit: { type: GraphQLInt },
        segment: { type: GraphQLString }
      },
      resolve(parent, args) {
        const filter = args.segment ? { segment: args.segment } : {};
        return Client.find(filter).limit(args.limit || 100);
      }
    },
    devis: {
      type: DevisType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Devis.findById(args.id).populate('client');
      }
    },
    devisList: {
      type: new GraphQLList(DevisType),
      args: {
        status: { type: GraphQLString },
        limit: { type: GraphQLInt }
      },
      resolve(parent, args) {
        const filter = args.status ? { status: args.status } : {};
        return Devis.find(filter).populate('client').limit(args.limit || 50);
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createClient: {
      type: ClientType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: GraphQLString },
        phone: { type: GraphQLString }
      },
      resolve(parent, args) {
        return Client.create(args);
      }
    }
  }
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

// Point 198: Export Excel avancé avec graphiques
export async function exportToExcel(data, type, options = {}) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(type);
  
  if (type === 'factures') {
    // En-têtes
    worksheet.columns = [
      { header: 'Numéro', key: 'number', width: 15 },
      { header: 'Client', key: 'client', width: 30 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Montant HT', key: 'subtotal', width: 15 },
      { header: 'TVA', key: 'tax', width: 12 },
      { header: 'Total TTC', key: 'total', width: 15 },
      { header: 'Statut', key: 'status', width: 12 }
    ];
    
    // Données
    const factures = await Facture.find(data.filter).populate('client').lean();
    factures.forEach(f => {
      worksheet.addRow({
        number: f.number || f._id,
        client: f.client?.name || '',
        date: new Date(f.createdAt).toLocaleDateString(),
        subtotal: f.totals?.subtotal || 0,
        tax: f.totals?.tax || 0,
        total: f.totals?.grandTotal || 0,
        status: f.status
      });
    });
    
    // Formatage
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563eb' }
    };
    
    // Totaux
    const lastRow = worksheet.rowCount + 2;
    worksheet.getCell(`E${lastRow}`).value = 'TOTAL:';
    worksheet.getCell(`E${lastRow}`).font = { bold: true };
    worksheet.getCell(`G${lastRow}`).value = { formula: `SUM(G2:G${worksheet.rowCount})` };
    worksheet.getCell(`G${lastRow}`).font = { bold: true };
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

// Point 199: Export PDF multi-pages personnalisé
export async function exportCustomPDF(data, template) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks = [];
  
  doc.on('data', chunk => chunks.push(chunk));
  
  // Page de garde
  doc.fontSize(24).text('NXT Hélder Pro', { align: 'center' });
  doc.moveDown();
  doc.fontSize(18).text(template.title, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(12).text(`Généré le ${new Date().toLocaleDateString()}`);
  doc.moveDown(4);
  
  // Table des matières
  doc.fontSize(16).text('Table des matières');
  doc.moveDown();
  template.sections.forEach((section, index) => {
    doc.fontSize(12).text(`${index + 1}. ${section.title}`);
  });
  
  // Sections
  template.sections.forEach((section, index) => {
    doc.addPage();
    doc.fontSize(18).text(`${index + 1}. ${section.title}`);
    doc.moveDown();
    doc.fontSize(12).text(section.content);
    
    if (section.data) {
      doc.moveDown();
      renderDataTable(doc, section.data);
    }
  });
  
  doc.end();
  
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function renderDataTable(doc, data) {
  if (!data.rows || data.rows.length === 0) return;
  
  const startY = doc.y;
  const headers = data.headers || Object.keys(data.rows[0]);
  
  // En-têtes
  let x = 50;
  doc.font('Helvetica-Bold');
  headers.forEach(header => {
    doc.text(header, x, startY, { width: 100 });
    x += 110;
  });
  
  // Lignes
  doc.font('Helvetica');
  let y = startY + 20;
  data.rows.slice(0, 20).forEach(row => {
    x = 50;
    headers.forEach(header => {
      doc.text(String(row[header] || ''), x, y, { width: 100 });
      x += 110;
    });
    y += 20;
  });
}

// Point 200: Export formats multiples (JSON, XML, CSV, Excel, PDF)
export async function exportData(data, format, type) {
  switch (format.toLowerCase()) {
    case 'json':
      return JSON.stringify(data, null, 2);
      
    case 'xml':
      return convertToXML(data, type);
      
    case 'csv':
      return convertToCSV(data);
      
    case 'excel':
      return await exportToExcel({ filter: {} }, type, { data });
      
    case 'pdf':
      return await exportCustomPDF(data, {
        title: `Export ${type}`,
        sections: [{ title: 'Données', content: '', data }]
      });
      
    default:
      return JSON.stringify(data);
  }
}

function convertToXML(data, rootName = 'data') {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
  
  const items = Array.isArray(data) ? data : [data];
  items.forEach(item => {
    xml += '  <item>\n';
    Object.entries(item).forEach(([key, value]) => {
      if (typeof value !== 'object') {
        xml += `    <${key}>${escapeXML(String(value))}</${key}>\n`;
      }
    });
    xml += '  </item>\n';
  });
  
  xml += `</${rootName}>`;
  return xml;
}

function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = [headers.join(',')];
  
  data.forEach(item => {
    const values = headers.map(header => {
      const value = item[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    });
    rows.push(values.join(','));
  });
  
  return rows.join('\n');
}

// Helper: Générer rapport complet multi-format
export async function generateCompleteReport(reportType, filters, format) {
  let data;
  
  switch (reportType) {
    case 'factures':
      data = await Facture.find(filters).populate('client').lean();
      break;
    case 'devis':
      data = await Devis.find(filters).populate('client').lean();
      break;
    case 'chantiers':
      data = await Chantier.find(filters).populate('client').lean();
      break;
    default:
      data = [];
  }
  
  return exportData(data, format, reportType);
}
