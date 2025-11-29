import EmailTemplate from '../models/EmailTemplate.js';
import nodemailer from 'nodemailer';

// Point 131-135: Templates emails et envoi

export async function listTemplates(companyId) {
  return EmailTemplate.find({ company: companyId, active: true });
}

export async function getTemplateBySlug(slug, companyId) {
  return EmailTemplate.findOne({ slug, company: companyId });
}

export async function createTemplate(data) {
  return EmailTemplate.create(data);
}

export async function updateTemplate(id, data) {
  return EmailTemplate.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteTemplate(id) {
  return EmailTemplate.findByIdAndUpdate(id, { active: false }, { new: true });
}

// Point 132: Rendu template avec variables
export function renderTemplate(template, variables) {
  let { subject, body } = template;
  
  // Remplacer les variables {{variable}}
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, variables[key] || '');
    body = body.replace(regex, variables[key] || '');
  });
  
  return { subject, body };
}

// Point 133: Envoi email avec template
export async function sendEmailWithTemplate(to, templateSlug, variables, companyId, attachments = []) {
  const template = await getTemplateBySlug(templateSlug, companyId);
  if (!template) throw new Error('Template not found');
  
  const { subject, body } = renderTemplate(template, variables);
  
  // Configuration SMTP (à paramétrer dans env)
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@nxt-helder.com',
    to,
    subject,
    html: body,
    attachments
  };
  
  const result = await transporter.sendMail(mailOptions);
  return result;
}

// Point 134: Templates par défaut système
export async function seedDefaultTemplates(companyId) {
  const defaults = [
    {
      company: companyId,
      name: 'Envoi Devis',
      slug: 'devis_send',
      type: 'devis_send',
      subject: 'Devis {{devis_number}} - {{client_name}}',
      body: `
        <h2>Bonjour {{client_name}},</h2>
        <p>Veuillez trouver ci-joint votre devis <strong>{{devis_number}}</strong>.</p>
        <p>Montant total: {{total}} EUR</p>
        <p>Cordialement,<br>L'équipe NXT Hélder</p>
      `,
      variables: [
        { key: 'client_name', description: 'Nom du client', example: 'Dupont SA' },
        { key: 'devis_number', description: 'Numéro devis', example: 'DEV-2024-001' },
        { key: 'total', description: 'Montant total', example: '12500.00' }
      ],
      isDefault: true
    },
    {
      company: companyId,
      name: 'Relance Paiement',
      slug: 'relance_paiement',
      type: 'relance_paiement',
      subject: 'Relance Facture {{facture_number}}',
      body: `
        <h2>Bonjour {{client_name}},</h2>
        <p>Nous vous rappelons que la facture <strong>{{facture_number}}</strong> d'un montant de <strong>{{montant}} EUR</strong> est en attente de paiement.</p>
        <p>Merci de régulariser votre situation rapidement.</p>
      `,
      isDefault: true
    }
  ];
  
  return Promise.all(defaults.map(t => EmailTemplate.create(t)));
}

// Point 135: Historique envois emails
export async function logEmailSent(to, templateSlug, status, companyId) {
  // TODO: Créer modèle EmailLog pour traçabilité
  return {
    to,
    template: templateSlug,
    status,
    company: companyId,
    sentAt: new Date()
  };
}
