import nodemailer from 'nodemailer';
import type { SendEmailRequest } from '../types';
import e from 'express';

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const verifySmtpConnection =  async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified');
    return true;
  } catch (err) {
    console.error('[EMAIL] SMTP connection failed:', err);
    return false;
  }
}

export const sendEmail = async (data: SendEmailRequest): Promise<void> => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.to,
    subject: data.subject,
    [data.isHtml ? 'html' : 'text']: data.body,
  });
  console.log(`[EMAIL] Sent to ${data.to}: ${data.subject}`);
}


export const sendAgentInviteEmail = async (
  to: string,
  agentName: string,
  employeeId: string,
  tempPassword: string,
  adminName: string,
  orgName: string
): Promise <void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { background: #1976d2; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
        .cred-box { background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; margin: 20px 0; }
        .cred-row { margin: 8px 0; }
        .cred-label { font-weight: bold; color: #666; display: inline-block; width: 140px; }
        .cred-value { font-family: monospace; font-size: 16px; color: #1976d2; font-weight: bold; }
        .button { display: inline-block; background: #1976d2; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .footer { color: #999; font-size: 12px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;font-size:24px;">Welcome to MiniCRM</h1>
          <p style="margin:8px 0 0 0;opacity:0.9;">${orgName}</p>
        </div>
        <div class="content">
          <p>Hi <strong>${agentName}</strong>,</p>
          <p>${adminName} has invited you to join <strong>${orgName}</strong> on MiniCRM.
          Here are your login credentials:</p>
          <div class="cred-box">
            <div class="cred-row">
              <span class="cred-label">Employee ID:</span>
              <span class="cred-value">${employeeId}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">Temp password:</span>
              <span class="cred-value">${tempPassword}</span>
            </div>
          </div>
          <p><strong>Important:</strong> Use your Employee ID (not your email) to log in.
          You will be asked to change your password on first login.</p>
          <a href="${process.env.FRONTEND_URL}/login" class="button">
            Log in to MiniCRM
          </a>
          <p>If you have any issues, contact your admin: ${adminName}</p>
          <div class="footer">
            <p>This invitation was sent by ${adminName} at ${orgName}.</p>
            <p>If you were not expecting this, please ignore it.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to,
    subject: `You've been invited to ${orgName} on MiniCRM`,
    body: html,
    isHtml: true,
  });
};



export const sendWeeklySummaryEmail = async (
  to: string,
  recipientName: string,
  stats: {
    newContacts: number;
    newLeads: number;
    dealsWon: number;
    revenue: number;
    activitiesLogged: number;
  }
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { background: #1976d2; color: white; padding: 24px; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 32px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
        .stat-card { background: #f5f7ff; border-radius: 8px; padding: 16px; text-align: center; }
        .stat-number { font-size: 32px; font-weight: 900; color: #1976d2; margin: 0; }
        .stat-label { font-size: 12px; color: #666; margin: 4px 0 0 0; }
        .button { display: inline-block; background: #1976d2; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0;font-size:22px;">Your Weekly CRM Summary</h1>
          <p style="margin:6px 0 0 0;opacity:0.85;">
            Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div class="content">
          <p>Hi ${recipientName}, here's how your CRM performed this week:</p>
          <div class="stats-grid">
            <div class="stat-card">
              <p class="stat-number">${stats.newContacts}</p>
              <p class="stat-label">New Contacts</p>
            </div>
            <div class="stat-card">
              <p class="stat-number">${stats.newLeads}</p>
              <p class="stat-label">New Leads</p>
            </div>
            <div class="stat-card">
              <p class="stat-number">${stats.dealsWon}</p>
              <p class="stat-label">Deals Won</p>
            </div>
            <div class="stat-card">
              <p class="stat-number">$${stats.revenue.toLocaleString()}</p>
              <p class="stat-label">Revenue Won</p>
            </div>
          </div>
          <p>You logged <strong>${stats.activitiesLogged} activities</strong> this week. Keep it up!</p>
          <a href="${process.env.FRONTEND_URL}/app/dashboard" class="button">View Dashboard</a>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to,
    subject: 'Your weekly CRM summary',
    body: html,
    isHtml: true,
  });
}