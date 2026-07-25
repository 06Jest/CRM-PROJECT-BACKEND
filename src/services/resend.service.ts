import { Resend } from "resend";

import { AppError } from "../middleware/error.middleware";
import { config } from "../config/environment";

const resend = new Resend(config.EMAIL.resend.key);

interface SendEmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendEmailWithResend = async ({
  from,
  to,
  subject,
  html,
}: SendEmailOptions) => {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    throw new AppError(500, error.message);
  }

  return data;
};