import { Request, Response, NextFunction } from "express";
import { updateLeadFromDB, addLeadToDB, getLeadsFromDB, deleteLeadFromDB, updateLeadStatusFromDB, getLeadByIDFromDB, getLeadsListsFromDB } from "../services/leads.service";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";
import { addContactFromLeadsToDB } from "../services/contacts.service";
import { AddContact } from "../types/contact";
import { Source } from "../types/global";

export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const leads = await getLeadsFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Leads fetch successful',
      data: leads, 
      
    });
    
  } catch (err) {
    next(err);
  }
}

export const getLeadsLists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const leads = await getLeadsListsFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Leads fetch successful',
      data: leads, 
      
    });
    
  } catch (err) {
    console.error(err);
    next(err);
  }
}

export const addLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;
    const lead = req.body;

    if (!orgId || !userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await addLeadToDB(orgId, userId, lead);
    return res.status(200).json({
      success: true,
      message: 'Add Lead successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const updateLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const lead = req.body;
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!id) {
      throw new AppError(
        401,
        'Contact required'
      );
    }
    if (!userId || !orgId ) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await updateLeadFromDB(id, orgId, userId, lead);
    return res.status(200).json({
      success: true,
      message: 'Update Lead successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const updateLeadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { status } = req.body;
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!id) {
      throw new AppError(
        401,
        'Contact required'
      );
    }
    if (!userId || !orgId ) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    

    if ( status === 'Qualified') {

      const leadData = await getLeadByIDFromDB(id, orgId);

      if (!leadData) {
        throw new Error("Lead not found");
      }

      const contact: AddContact = {
        lead_id: leadData.id,
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        suffix: leadData.suffix,
        birth_date: leadData.birth_date,
        email: leadData.email,
        phone: leadData.phone,
        company_name: leadData.company_name,
        industry: leadData.industry,
        position: leadData.position,
        department: leadData.department,
        website: leadData.website,
        source: leadData.source as Source,
        priority: leadData.priority,
        notes: leadData.notes,
        preferred_contact_time: leadData.preferred_contact_time,
        facebook: leadData.facebook,
        x: leadData.x,
        whatsapp: leadData.whatsapp,
        linkedin: leadData.linkedin,
        instagram: leadData.instagram,
        telegram: leadData.telegram,
        tiktok: leadData.tiktok,
        viber: leadData.viber,
      };

      await addContactFromLeadsToDB(orgId, userId, contact);
    }

    const data = await updateLeadStatusFromDB(id, orgId, userId, status);
    return res.status(200).json({
      success: true,
      message: 'Update Lead Status successful',
      data, 
    });
  } catch (err) {
    next(err);
  }
}

export const deleteLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!id) {
      throw new AppError(
        401,
        'Lead required'
      );
    }
    if (!userId || !orgId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await deleteLeadFromDB(id, orgId, userId);
    return res.status(200).json({
      success: true,
      message: 'Delete Lead successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

