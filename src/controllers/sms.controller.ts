import { Request, Response } from 'express'
import { sendSms } from '../services/sms.service';

export const sendSmsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, body } = req.body;
    if (!to || !body) {
      res.status(400).json({ 
        success: false, 
        error: 'to and body required' 
      });
      return;
    }
    await sendSms({ to, body });
    res.json({
      success: true,
      message: 'SMS sent successfully'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
