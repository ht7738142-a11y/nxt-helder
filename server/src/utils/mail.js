import nodemailer from 'nodemailer';

export function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

export async function sendDevisEmail({ to, subject, text }) {
  const from = process.env.SMTP_FROM || 'NXT Helder <no-reply@example.com>';
  const transporter = createTransport();
  return transporter.sendMail({ from, to, subject, text });
}
