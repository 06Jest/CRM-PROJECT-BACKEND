import { Request, Response, NextFunction } from "express";
import { updateContactFromDB, addContactToDB, getContactsFromDB, deleteContactFromDB } from "../services/contactsService";
import { AppError } from "../middleware/error.middleware";

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
    const name = req.user?.name;
    const userId = req.user?.id;
    const contact = req.body;

    if (!orgId || !name || !userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await addContactToDB(orgId, userId, name, contact);
    return res.status(200).json({
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
    const id = req.body.id;
    const contact = req.body.contact;

    if (!id) {
      throw new AppError(
        401,
        'Contact required'
      );
    }

    const data = await updateContactFromDB(id, contact);
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
    const { id } = req.body;

    if (!id) {
      throw new AppError(
        401,
        'Contact required'
      );
    }

    const data = await deleteContactFromDB(id);
    return res.status(200).json({
      success: true,
      message: 'Delete Contact successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

