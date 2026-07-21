import { Request, Response, NextFunction } from "express";
import { updateContactFromDB, addContactToDB, addContactFromLeadsToDB, getContactsFromDB, deleteContactFromDB, deleteBulkContactsFromDB, updateContactSocialsFromDB, updateContactCareerFromDB, getContactsListsFromDB } from "../services/contacts.service";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";
import { deleteAllDealsByBulkContactsFromDB, deleteAllDealsByContactIDFromDB} from "../services/deals.service";
import { deleteBulkCustomersByBulkContactIDsFromDB, deleteCustomerByContactIDFromDB } from "../services/customer.service";

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

export const getContactsLists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const contacts = await getContactsListsFromDB(orgId);
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
    const contact = req.body;
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
export const updateContactSocials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const socials = req.body;
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

    const data = await updateContactSocialsFromDB(id, orgId, userId, socials);
    return res.status(200).json({
      success: true,
      message: 'Update Contact successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const updateContactCareer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const career = req.body;
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

    const data = await updateContactCareerFromDB(id, orgId, userId, career);
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
    await deleteAllDealsByContactIDFromDB(id, orgId, userId);
    await deleteCustomerByContactIDFromDB(id, orgId, userId)
    return res.status(204).json({
      success: true,
      message: 'Delete Contact successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}
export const deleteBulkContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ids = req.body.ids;
    const userId = req.user?.sub;
    const orgId = req.user?.orgId;

    if (!ids) {
      throw new AppError(
        401,
        'Contacts required'
      );
    }
    if (!userId || !orgId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await deleteBulkContactsFromDB(ids, orgId, userId);

    await Promise.all([
      deleteAllDealsByBulkContactsFromDB(ids, orgId, userId),
      deleteBulkCustomersByBulkContactIDsFromDB(ids, orgId, userId)
    ]);

    res.status(200).json({
      success: true,
      message: 'Delete Contacts successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};
