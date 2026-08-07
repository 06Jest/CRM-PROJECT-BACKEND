import { Request, Response, NextFunction } from "express";
import {
  updateLeadFromDB,
  addLeadToDB,
  getLeadsFromDB,
  deleteLeadFromDB,
  updateLeadStatusFromDB,
  getLeadByIDFromDB,
  getLeadsListsFromDB,
} from "../services/leads.service";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";
import { addContactFromLeadsToDB } from "../services/contacts.service";
import { AddContact } from "../types/contact";
import { Source } from "../types/global";
import { addActivityToDB } from "../services/activities.service";
import { ensureResourceLimit } from "../services/plans.service";
import { table } from "../config/tables";

export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError(401, "Missing access token");
    }

    const leads = await getLeadsFromDB(accessToken);

    return res.status(200).json({
      success: true,
      message: "Leads fetch successful",
      data: leads,
    });
  } catch (err) {
    next(err);
  }
};

export const getLeadsLists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const leads = await getLeadsListsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Leads fetch successful",
      data: leads,
    });
  } catch (err) {
    next(err);
  }
};

export const addLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;
    const lead = req.body;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    await ensureResourceLimit(
      orgId,
      table.leads,
      "leads",
      "active_limit",
      accessToken
    );

    const data = await addLeadToDB(
      orgId,
      memberId,
      lead,
      accessToken
    );

    await addActivityToDB(
      orgId,
      memberId,
      {
        lead_id: data.id,
        type: "lead",
        action: "created",
        title: "New lead",
        target_name: `${lead.first_name} ${lead.last_name} ${data.suffix ?? ""}`,
        description: `Added ${lead.first_name} ${lead.last_name} ${data.suffix ?? ""} as lead`,
      },
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Add Lead successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const lead = req.body;

    const memberId = req.user?.member_id
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateLeadFromDB(
      id,
      orgId,
      memberId,
      lead,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Update Lead successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateLeadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { status } = req.body;

    const memberId = req.user?.member_id
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const leadData = await getLeadByIDFromDB(
      id,
      orgId,
      accessToken
    );

    const data = await updateLeadStatusFromDB(
      id,
      orgId,
      memberId,
      status,
      accessToken
    );

    if (status === "Qualified") {
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

      const contactData = await addContactFromLeadsToDB(
        orgId,
        memberId,
        contact,
        accessToken
      );

      const contactName =
        `${contactData.first_name} ${contactData.last_name} ${contactData.suffix ?? ""}`.trim();

      await addActivityToDB(orgId, memberId, {
        contact_id: contactData.id,
        type: "contact",
        action: "created",
        title: "New contact",
        target_name: contactName,
        description: "Created contact from qualified lead",
      },accessToken);
    }

    return res.status(200).json({
      success: true,
      message: "Update Lead Status successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteLead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const memberId = req.user?.member_id
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!memberId || !orgId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const deleted = await getLeadByIDFromDB(
      id,
      orgId,
      accessToken
    );

    const data = await deleteLeadFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );

    await addActivityToDB(orgId, memberId, {
      lead_id: deleted.id,
      type: "lead",
      action: "deleted",
      title: "Removed contact",
      target_name: `${deleted.first_name} ${deleted.last_name} ${deleted.suffix ?? ""}`,
      description: `Removed ${deleted.first_name} ${deleted.last_name} ${deleted.suffix ?? ""} as contact`,
    },accessToken);

    return res.status(200).json({
      success: true,
      message: "Delete Lead successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};