import { Request, Response, NextFunction } from "express";
import { updateDealFromDB, addDealToDB, getDealsFromDB, deleteDealFromDB, updateDealStageFromDB, getDealsByIDFromDB, getDealsListsFromDB, closeDealFromDB } from "../services/deals.service";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";
import { getContactByIDFromDB, updateContactStatusFromDB } from "../services/contacts.service";
import { addCustomerToDB } from "../services/customer.service";

export const getDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const deals = await getDealsFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Deals fetch successful',
      data: deals, 
      
    });
    
  } catch (err) {
    next(err);
  }
}

export const getDealsLists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, 'orgId is required');
    }

    const deals = await getDealsListsFromDB(orgId);
    return res.status(200).json({
      success: true,
      message: 'Deals fetch successful',
      data: deals, 
      
    });
    
  } catch (err) {
    next(err);
  }
}

export const addDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;
    const deal = req.body;

    if (!orgId || !userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const contact = await getContactByIDFromDB(deal.contact_id, orgId);

    if (contact.status === 'Contacted') {
      await updateContactStatusFromDB(contact.id, orgId, userId, "Opportunity");
    }

    const data = await addDealToDB(orgId, userId,  deal);
    return res.status(200).json({
      success: true,
      message: 'Add Deal successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

export const updateDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const deal = req.body;
    const userId = req.user?.sub;
    const orgId = req.user?.orgId

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

    const data = await updateDealFromDB(id, userId, deal, orgId);
    return res.status(200).json({
      success: true,
      message: 'Update Deal successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}
export const updateDealStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const { stage } = req.body;
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
    
    let data;
    if ( stage === 'Closed Won') {
      const deal = await getDealsByIDFromDB(id, orgId);

      const contact = await getContactByIDFromDB(deal.contact_id, orgId);

      if (contact.status !== 'Customer') {
        await addCustomerToDB( orgId, userId,  contact.id, );
        await updateContactStatusFromDB(contact.id, orgId, userId, "Customer" );
      }
      await closeDealFromDB(id, stage, userId, orgId );
    } else if ( stage === 'Closed Lost') {

      await closeDealFromDB(id, stage, userId, orgId );
    } else {
      data = await updateDealStageFromDB(id, orgId, userId, stage);
    }

    
    return res.status(200).json({
      success: true,
      message: 'Update Deal Stage successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

// export const closeDeal = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const id = uuidSchema.parse(req.params.id);
//     const outcome = req.body.deal.stage;
//     const userId = req.user?.sub;
//     const orgId =  req.user?.orgId;

//     if (!id) {
//       throw new AppError(
//         401,
//         'Deal required'
//       );
//     }
//     if (!userId || !orgId) {
//       throw new AppError(
//         401,
//         'Unauthorized user'
//       );
//     }
//     if (outcome !== 'Closed Won' || outcome !== 'Closed Lost') {
//       throw new AppError(
//         401,
//         'Invalid stage'
//       );
//     }

//     const data = await closeDealFromDB(id, outcome, userId, orgId);
//     return res.status(200).json({
//       success: true,
//       message: 'Update Deal successful',
//       data, 
//     });
    
//   } catch (err) {
//     next(err);
//   }
// }


export const deleteDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);
    const userId = req.user?.sub;

    if (!id) {
      throw new AppError(
        401,
        'Deal required'
      );
    }
    if (!userId) {
      throw new AppError(
        401,
        'Unauthorized user'
      );
    }

    const data = await deleteDealFromDB(id, userId);
    return res.status(200).json({
      success: true,
      message: 'Delete Deal successful',
      data, 
    });
    
  } catch (err) {
    next(err);
  }
}

