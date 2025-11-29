import axios from 'axios';

// Point 141-145: Intégrations CRM/ERP externes

// Point 141: Sync clients vers CRM (Salesforce, HubSpot, Pipedrive)
export async function syncClientToCRM(client, crmType, apiKey) {
  const endpoints = {
    salesforce: 'https://api.salesforce.com/services/data/v52.0/sobjects/Account',
    hubspot: 'https://api.hubapi.com/crm/v3/objects/companies',
    pipedrive: 'https://api.pipedrive.com/v1/organizations'
  };
  
  const payload = mapClientToCRM(client, crmType);
  
  try {
    const response = await axios.post(endpoints[crmType], payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, crmId: response.data.id, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function mapClientToCRM(client, crmType) {
  // Mapping spécifique selon CRM
  const mappings = {
    salesforce: {
      Name: client.name,
      BillingStreet: client.address,
      Phone: client.phone,
      Email__c: client.email
    },
    hubspot: {
      properties: {
        name: client.name,
        phone: client.phone,
        domain: client.company
      }
    },
    pipedrive: {
      name: client.name,
      address: client.address
    }
  };
  
  return mappings[crmType] || {};
}

// Point 142: Import devis depuis CRM
export async function importDevisFromCRM(crmType, crmId, apiKey) {
  // Récupérer opportunité/deal depuis CRM
  const endpoints = {
    salesforce: `https://api.salesforce.com/services/data/v52.0/sobjects/Opportunity/${crmId}`,
    hubspot: `https://api.hubapi.com/crm/v3/objects/deals/${crmId}`,
    pipedrive: `https://api.pipedrive.com/v1/deals/${crmId}`
  };
  
  try {
    const response = await axios.get(endpoints[crmType], {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    return mapCRMToDevis(response.data, crmType);
  } catch (error) {
    return null;
  }
}

function mapCRMToDevis(crmData, crmType) {
  // TODO: Mapper selon structure CRM
  return {
    title: crmData.Name || crmData.properties?.dealname || crmData.title,
    status: 'draft',
    items: [],
    notes: crmData.Description || crmData.properties?.description || ''
  };
}

// Point 143: Export factures vers ERP (Sage, QuickBooks, Odoo)
export async function exportFactureToERP(facture, erpType, apiConfig) {
  const endpoints = {
    sage: `${apiConfig.baseUrl}/api/v1/invoices`,
    quickbooks: 'https://sandbox-quickbooks.api.intuit.com/v3/company/:companyId/invoice',
    odoo: `${apiConfig.baseUrl}/api/v2/invoices`
  };
  
  const payload = mapFactureToERP(facture, erpType);
  
  try {
    const response = await axios.post(endpoints[erpType], payload, {
      headers: {
        'Authorization': `Bearer ${apiConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, erpId: response.data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function mapFactureToERP(facture, erpType) {
  // Mapping selon ERP
  return {
    customer: facture.client,
    invoiceNumber: facture.number,
    date: facture.createdAt,
    total: facture.totals?.grandTotal,
    status: facture.status,
    items: facture.items || []
  };
}

// Point 144: Webhooks entrants (CRM notifie NXT)
export async function handleWebhook(source, event, data) {
  // Traiter les webhooks CRM/ERP
  const handlers = {
    'salesforce.opportunity.won': async (data) => {
      // Créer devis automatiquement
      return { action: 'create_devis', data };
    },
    'hubspot.deal.closed': async (data) => {
      return { action: 'create_devis', data };
    },
    'stripe.payment.succeeded': async (data) => {
      // Marquer facture comme payée
      return { action: 'mark_paid', invoiceId: data.metadata.invoiceId };
    }
  };
  
  const handler = handlers[`${source}.${event}`];
  return handler ? await handler(data) : { action: 'ignored' };
}

// Point 145: API externe personnalisée (Zapier, Make, n8n)
export async function createWebhookEndpoint(companyId, name, targetUrl, events) {
  // Enregistrer webhook pour événements spécifiques
  return {
    id: `webhook_${Date.now()}`,
    company: companyId,
    name,
    url: targetUrl,
    events, // ['devis.created', 'facture.paid', etc.]
    secret: generateWebhookSecret(),
    active: true
  };
}

function generateWebhookSecret() {
  return `whsec_${Math.random().toString(36).substring(2, 15)}`;
}

// Fonction utilitaire pour déclencher webhooks
export async function triggerWebhook(event, data, webhookUrl, secret) {
  try {
    await axios.post(webhookUrl, {
      event,
      data,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'X-Webhook-Secret': secret,
        'Content-Type': 'application/json'
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
