import { Request, Response } from "express";
import { 
  sendEmail,
  sendAgentInviteEmail,
  sendWeeklySummaryEmail,
  verifySmtpConnection,
 } from "../services/email.service";

export const sendEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, body, isHtml } = req.body;
    if (!to || !subject || !body) {
      res.status(400).json({
        success: false,
        error: 'to, subject, and body are required'
      });
      return;
    }
    await sendEmail({ to, subject, body, isHtml });
    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (err: any) {
    console.error('[EMAIL] Send failed:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const sendInviteHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { to, agentName, employeeId, tempPassword, adminName, orgName } = req.body;
    if (!to || !agentName || !employeeId || !tempPassword) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    await sendAgentInviteEmail(
      to, agentName, employeeId, tempPassword,
      adminName || 'Admin', orgName || 'uniThread'
    );
    res.json({ success: true, message: 'Invite email sent' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });;
  }
};

export const sendWeeklySummaryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { to, recipientName, stats } = req.body;
    if (!to || !stats) {
      res.status(400).json({ success: false, error: 'to and stats are required' });
      return;
    }
    await sendWeeklySummaryEmail(to, recipientName || 'there', stats);
    res.json({ success: true, message: 'Weekly summary sent' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const verifySmtpHandler = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const ok = await verifySmtpConnection();
  res.json({
    success: ok,
    message: ok ? 'SMTP connected successfully' : 'SMTP connection failed',
  });
};