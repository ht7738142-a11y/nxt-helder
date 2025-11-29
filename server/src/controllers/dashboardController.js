import * as service from '../services/dashboardService.js';

export async function getDirection(_req, res) {
  const data = await service.getDirectionDashboard();
  res.json(data);
}

export async function getCommercial(req, res) {
  const data = await service.getCommercialDashboard(req.user.id);
  res.json(data);
}

export async function getChefChantier(req, res) {
  const data = await service.getChefChantierDashboard(req.user.id);
  res.json(data);
}

export async function getGlobalKPIs(_req, res) {
  const data = await service.getGlobalKPIs();
  res.json(data);
}
