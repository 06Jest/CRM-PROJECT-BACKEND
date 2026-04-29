import { Request, Response } from "express";
import { sendEmail } from "../services/email.service";

export const sendEmailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, body, isHtml } = req.body;
    if (!to || !subject || !body) {
      res.status(400).json({
        success: false,
        error: 'to, subject, and body are required'
      })
      return;
    }
    await sendEmail({ to, subject, body, isHtml });
    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};