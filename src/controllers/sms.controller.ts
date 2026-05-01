import { Request, Response } from 'express'
import { 
  sendSms,
  getSmsStatus,
  getSmsHistory,
  validatePhoneNumber,
  formatPhoneNumber,
 } from '../services/sms.service';

export const sendSmsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, body, contactName } = req.body;
    const user = (req as any).user;

    if (!to || !body) {
      res.status(400).json({ 
        success: false, 
        error: 'to and body required' 
      });
      return;
    }
    if (body.length > 1600) {
      res.status(400).json({
        success: false,
        error: 'Message too long (max 1600 characters)',
      });
      return;
    }
    if (!validatePhoneNumber(to)) {
      res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
      return;
    }
    const formattedPhone = formatPhoneNumber(to);
    const result = await sendSms({
      to: formattedPhone,
      body,
      userId: user?.id,
      contactName,
    });

    res.json({
      success: true,
      message: 'SMS sent (simulated',
      data: result,
    })

  } catch (err: any) {
    console.error('[SMS] Send failed:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getSmsStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sid = req.params.sid as string;
    const status = await getSmsStatus(sid);
    res.json({ success: true, data: {status, simulated: true} });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
};

export const getSmsHistoryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const contactName = req.params.contactName as string;
    const user = (req as any).user;
    const history = await getSmsHistory(contactName, user.id);
    res.json({ success: true, data: history});
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

