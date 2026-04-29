import twilio from "twilio";
import type { SendSmsRequest } from "../types";

export const sendSms = async (data: SendSmsRequest): Promise<void> => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: data.body, 
    from: process.env.TWILIO_PHONE_NUMBER,
    to: data.to,
  });
};