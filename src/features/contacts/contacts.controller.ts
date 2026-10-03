import {
  Request,
  Response,
  NextFunction,
} from 'express';

import { AppError } from '../../middleware/error.middleware';
import { uuidSchema } from '../../schema/global.schema';

import {
  getContactsService,
  getContactsListsService,
  getContactListByIDService,
  addContactService,
  addContactFromLeadsService,
  updateContactPersonalService,
  updateContactSocialsService,
  updateContactCareerService,
  updateContactAvatarService,
  updateContactStatusService,
  updateContactSourceService,
  updateContactPriorityService,
  updateContactNotesService,
  updateContactPreferredTimeService,
  archiveContactService,
  archiveBulkContactsService,
  deleteContactService,
  deleteBulkContactsService,
} from './contacts.service';

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(400, 'orgId is required');
    }

    const contacts = await getContactsService(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Contacts fetch successful',
      data: contacts,
    });
  } catch (err) {
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
      throw new AppError(400, 'orgId is required');
    }

    const contacts = await getContactsListsService(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Contacts fetch successful',
      data: contacts,
    });
  } catch (err) {
    next(err);
  }
};

export const getContactListByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(400, 'orgId is required');
    }

    const contact = await getContactListByIDService(
      id,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Contact fetch successful',
      data: contact,
    });
  } catch (err) {
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    const contact = req.body;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await addContactService(
      orgId,
      memberId,
      contact,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Add Contact successful',
      data,
    });
  } catch (err) {
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    const contact = req.body;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await addContactFromLeadsService(
      orgId,
      memberId,
      contact,
      accessToken
    );

    return res.status(201).json({
      success: true,
      message: 'Add Contact successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactPersonal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const personal = req.body;
    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await updateContactPersonalService(
      id,
      orgId,
      memberId,
      personal,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Update Contact successful',
      data,
    });
  } catch (err) {
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
    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await updateContactSocialsService(
      id,
      orgId,
      memberId,
      socials,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Update Contact successful',
      data,
    });
  } catch (err) {
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
    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await updateContactCareerService(
      id,
      orgId,
      memberId,
      career,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Update Contact successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const {
      avatar_file_id,
      avatar_url,
    } = req.body;

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await updateContactAvatarService(
      id,
      orgId,
      memberId,
      avatar_file_id ?? null,
      avatar_url ?? null,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Update Contact Avatar successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { status } = req.body;

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await updateContactStatusService(
      id,
      orgId,
      memberId,
      status,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Update Contact status successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactSource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { source } = req.body;

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await updateContactSourceService(
      id,
      orgId,
      memberId,
      source,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Update Contact source successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactPriority = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { priority } = req.body;

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await updateContactPriorityService(
      id,
      orgId,
      memberId,
      priority,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Update Contact priority successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { notes } = req.body;

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await updateContactNotesService(
      id,
      orgId,
      memberId,
      notes,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Update Contact Notes successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContactPreferredTime = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { preferredTime } = req.body;

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await updateContactPreferredTimeService(
      id,
      orgId,
      memberId,
      preferredTime,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Update Contact Preferred contact time successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const archiveContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await archiveContactService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Archive Contact successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const archiveBulkContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ids = req.body.ids;

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!ids || !Array.isArray(ids)) {
      throw new AppError(400, 'Contacts required');
    }

    const validIds = ids.map((id) =>
      uuidSchema.parse(id)
    );

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await archiveBulkContactsService(
      validIds,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Archive Contacts successful',
      data,
    });
  } catch (err) {
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

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await deleteContactService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Delete Contact successful',
      data,
    });
  } catch (err) {
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

    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!ids || !Array.isArray(ids)) {
      throw new AppError(400, 'Contacts required');
    }

    const validIds = ids.map((id) =>
      uuidSchema.parse(id)
    );

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, 'Unauthorized user');
    }

    const data = await deleteBulkContactsService(
      validIds,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: 'Delete Contacts successful',
      data,
    });
  } catch (err) {
    next(err);
  }
};