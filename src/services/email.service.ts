import nodemailer from 'nodemailer';
import type { SendEmailRequest } from '../types';

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (data: SendEmailRequest): Promise<void> => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.to,
    subject: data.subject,
    [data.isHtml ? 'html' : 'text']: data.body,
  });
}