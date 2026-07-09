import { Request, Response, NextFunction } from "express";
import { updateContactFromDB, addContactToDB, addContactFromLeadsToDB, getContactsFromDB, deleteContactFromDB } from "../services/contacts.service";
import { AppError } from "../middleware/error.middleware";
import { getProfileByIdFromDB } from "../services/profiles.service";
import { uuidSchema } from "../schema/global.schema";

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const contacts = await getContactsFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Contacts fetch successful',
      data: contacts, 
      
    });
    
  } catch (err) {
    next(err);
  }
}

export const addContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;
    const contact = req.body;
    

    if (!orgId || !userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await addContactToDB(orgId, userId, contact);
    return res.status(200).json({
      success: true,
      message: 'Add Contact successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const addContactFromLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;
    const contact = req.body;

    if (!orgId || !userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await addContactFromLeadsToDB(orgId, userId, contact);
    return res.status(201).json({
      success: true,
      message: 'Add Contact successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const updateContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const contact = req.body.contact;
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!id) {
      throw new AppError(
        401,
        'Contact required'
      );
    }

    if (!userId || !orgId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await updateContactFromDB(id, orgId, userId, contact);
    return res.status(200).json({
      success: true,
      message: 'Update Contact successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const deleteContact = async (
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
        'Contact required'
      );
    }
    if (!userId || !orgId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await deleteContactFromDB(id, orgId, userId);
    return res.status(204).json({
      success: true,
      message: 'Delete Contact successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

