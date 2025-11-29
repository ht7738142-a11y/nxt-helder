import * as service from '../services/biService.js';
import * as graphql from '../services/graphqlService.js';

// Points 186-195: BI & Analytics
export async function getMetabaseConfig(_req, res) {
  const config = await service.getMetabaseConfig();
  res.json(config);
}

export async function generateMetabaseToken(req, res) {
  const { dashboardId } = req.params;
  const token = await service.generateMetabaseToken(dashboardId, req.user.id);
  res.json(token);
}

export async function getOLAPCube(req, res) {
  const { dimensions, measures } = req.body;
  const cube = await service.getOLAPCube(dimensions.split(','), measures.split(','), req.query);
  res.json(cube);
}

export async function drillDown(req, res) {
  const { metric, level } = req.query;
  const data = await service.drillDown(metric, level, req.body);
  res.json(data);
}

export async function getCustomKPIs(req, res) {
  const kpis = await service.getCustomKPIs(req.user.id, req.body.kpis || []);
  res.json(kpis);
}

export async function forecastGrowth(req, res) {
  const months = parseInt(req.query.months) || 12;
  const forecast = await service.forecastGrowth(months);
  res.json(forecast);
}

export async function segmentClients(_req, res) {
  const segments = await service.segmentClients();
  res.json(segments);
}

export async function analyzeMarket(_req, res) {
  const analysis = await service.analyzeMarket();
  res.json(analysis);
}

export async function getStrategicRecommendations(_req, res) {
  const recommendations = await service.getStrategicRecommendations();
  res.json(recommendations);
}

// Points 196-200: GraphQL & Export
export async function exportExcel(req, res) {
  const { type } = req.params;
  const buffer = await graphql.exportToExcel(req.body, type);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${type}_${Date.now()}.xlsx"`);
  res.send(buffer);
}

export async function exportCustomPDF(req, res) {
  const buffer = await graphql.exportCustomPDF(req.body.data, req.body.template);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.pdf"`);
  res.send(buffer);
}

export async function exportMultiFormat(req, res) {
  const { type, format } = req.params;
  const data = await graphql.generateCompleteReport(type, req.query, format);
  
  const contentTypes = {
    json: 'application/json',
    xml: 'application/xml',
    csv: 'text/csv',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf'
  };
  
  res.setHeader('Content-Type', contentTypes[format] || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${type}_${Date.now()}.${format}"`);
  
  if (Buffer.isBuffer(data)) {
    res.send(data);
  } else {
    res.send(data);
  }
}
