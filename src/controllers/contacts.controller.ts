import { Request, Response, NextFunction } from "express";

import {
  updateContactFromDB,
  addContactToDB,
  addContactFromLeadsToDB,
  getContactsFromDB,
  deleteContactFromDB,
  deleteBulkContactsFromDB,
  updateContactSocialsFromDB,
  updateContactCareerFromDB,
  getContactsListsFromDB,
  getContactByIDFromDB,
} from "../services/contacts.service";

import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";

import {
  deleteAllDealsByBulkContactsFromDB,
  deleteAllDealsByContactIDFromDB
} from "../services/deals.service";

import {
  deleteBulkCustomersByBulkContactIDsFromDB,
  deleteCustomerByContactIDFromDB
} from "../services/customer.service";

import { addActivityToDB } from "../services/activities.service";


export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        400,
        "orgId is required"
      );
    }

    const contacts = await getContactsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Contacts fetch successful",
      data: contacts,
    });

  } catch(err) {
    next(err);
  }
};



export const getContactsLists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(
        400,
        "orgId is required"
      );
    }

    const contacts = await getContactsListsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Contacts fetch successful",
      data: contacts,
    });

  } catch(err) {
    next(err);
  }
};



export const addContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;

    const contact = req.body;

    if (!orgId || !userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await addContactToDB(
      orgId,
      userId,
      contact,
      accessToken
    );

    const contactName =
      `${data.first_name} ${data.last_name} ${data.suffix ?? ""}`.trim();


    await addActivityToDB(
      orgId,
      userId,
      {
        contact_id: data.id,
        type: "contact",
        action: "created",
        title: "New contact",
        target_name: contactName,
        description: `Added ${contactName} as contact`,
      },
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Add Contact successful",
      data,
    });

  } catch(err){
    next(err);
  }
};



export const addContactFromLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const userId = req.user?.sub;
    const accessToken = req.cookies.accessToken;

    const contact = req.body;

    if (!orgId || !userId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await addContactFromLeadsToDB(
      orgId,
      userId,
      contact,
      accessToken
    );


    const contactName =
      `${data.first_name} ${data.last_name} ${data.suffix ?? ""}`.trim();


    await addActivityToDB(
      orgId,
      userId,
      {
        contact_id:data.id,
        type:"contact",
        action:"created",
        title:"New contact",
        target_name:contactName,
        description:"Created contact from qualified lead",
      },
      accessToken
    );


    return res.status(201).json({
      success:true,
      message:"Add Contact successful",
      data,
    });

  } catch(err){
    next(err);
  }
};



export const updateContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const contact = req.body;

    const userId = req.user?.sub;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!userId || !orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await updateContactFromDB(
      id,
      orgId,
      userId,
      contact,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Update Contact successful",
      data,
    });

  } catch(err){
    next(err);
  }
};



export const updateContactSocials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const socials = req.body;

    const userId = req.user?.sub;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!userId || !orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await updateContactSocialsFromDB(
      id,
      orgId,
      userId,
      socials,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Update Contact successful",
      data,
    });

  } catch(err){
    next(err);
  }
};



export const updateContactCareer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const career = req.body;

    const userId = req.user?.sub;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!userId || !orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await updateContactCareerFromDB(
      id,
      orgId,
      userId,
      career,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Update Contact successful",
      data,
    });

  } catch(err){
    next(err);
  }
};

export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const userId = req.user?.sub;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!userId || !orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const deleted = await getContactByIDFromDB(
      id,
      orgId,
      accessToken
    );


    const data = await deleteContactFromDB(
      id,
      orgId,
      userId,
      accessToken
    );


    const contactName =
      `${deleted.first_name} ${deleted.last_name} ${deleted.suffix ?? ""}`.trim();


    await addActivityToDB(
      orgId,
      userId,
      {
        contact_id: deleted.id,
        type:"contact",
        action:"deleted",
        title:"Removed contact",
        target_name:contactName,
        description:`Removed ${contactName} as contact`,
      },
      accessToken
    );


    await deleteAllDealsByContactIDFromDB(
      id,
      orgId,
      userId,
      accessToken
    );


    await deleteCustomerByContactIDFromDB(
      id,
      orgId,
      userId,
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Delete Contact successful",
      data,
    });

  } catch(err){
    next(err);
  }
};



export const deleteBulkContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ids = req.body.ids;

    const userId = req.user?.sub;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;


    if (!ids || !Array.isArray(ids)) {
      throw new AppError(
        400,
        "Contacts required"
      );
    }


    if (!userId || !orgId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }


    const data = await deleteBulkContactsFromDB(
      ids,
      orgId,
      userId,
      accessToken
    );


    await Promise.all([
      deleteAllDealsByBulkContactsFromDB(
        ids,
        orgId,
        userId,
        accessToken
      ),

      deleteBulkCustomersByBulkContactIDsFromDB(
        ids,
        orgId,
        userId,
        accessToken
      )
    ]);


    await addActivityToDB(
      orgId,
      userId,
      {
        type:"contact",
        action:"deleted",
        title:"Removed contacts",
        target_name:`${ids.length} contacts`,
        description:`Removed ${ids.length} contacts`,
      },
      accessToken
    );


    return res.status(200).json({
      success:true,
      message:"Delete Contacts successful",
      data,
    });

  } catch(err){
    next(err);
  }
};