import * as emailRepository from '../repository/email.repository'

import { sendEmailWithResend } from "./resend.service";

import { AppError } from "../middleware/error.middleware";

import type {
  ComposeEmail,
  UpdateDraftEmail,
  Email,
} from "../types/email";

const devEmail = `onboarding@resend.dev`

export const createDraft = async (
  orgId: string,
  userId: string,
  email: ComposeEmail
): Promise<Email> => {

  return await emailRepository.createDraft(
    orgId,
    userId,
    email
  );

};

export const updateDraft = async (
  id: string,
  orgId: string,
  email: UpdateDraftEmail
): Promise<Email> => {

  const existing =
    await emailRepository.getEmailById(
      id,
      orgId
    );


  if(existing.status !== "draft") {
    throw new AppError(
      400,
      "Only draft emails can be edited"
    );
  }


  return await emailRepository.updateDraft(
    id,
    orgId,
    email
  );
};

export const sendEmail = async (
  id: string,
  orgId: string
): Promise<Email> => {


  const email =
    await emailRepository.getEmailById(
      id,
      orgId
    );


  if(email.status !== "draft") {
    throw new AppError(
      400,
      "Only drafts can be sent"
    );
  }


  if(!email.recipient_email){
    throw new AppError(
      400,
      "Recipient email is required"
    );
  }


  if(!email.subject){
    throw new AppError(
      400,
      "Subject is required"
    );
  }


  if(!email.body_html){
    throw new AppError(
      400,
      "Email body is required"
    );
  }



  await emailRepository.markQueued(
    id,
    orgId
  );


  try {

    const result =
      await sendEmailWithResend({

        from:
          `${email.organization.name} <${devEmail}>`,

        to:
          email.recipient_email,

        subject:
          email.subject,

        html:
          email.body_html,

      });



    await emailRepository.markSent(
      id,
      orgId,
      result.id
    );


    return await emailRepository.getEmailById(
      id,
      orgId
    );


  } catch(error:any){


    await emailRepository.markFailed(
      id,
      orgId,
      error.message
    );


    throw error;
  }

};

export const getEmails = async (
  orgId:string
) => {

 return await emailRepository.getEmails(
    orgId
 );

};

export const getLeadEmails = async (
  orgId:string,
  leadId:string
) => {

 return await emailRepository.getEmailsByLead(
    orgId,
    leadId
 );

};



export const getContactEmails = async (
  orgId:string,
  contactId:string
) => {

 return await emailRepository.getEmailsByContact(
    orgId,
    contactId
 );

};

export const getCustomerEmails = async (
  orgId:string,
  customerId:string
) => {

 return await emailRepository.getEmailsByCustomer(
    orgId,
    customerId
 );

};

export const deleteEmail = async (
  id:string,
  orgId:string
) => {

 return await emailRepository.deleteEmail(
    id,
    orgId
 );

};