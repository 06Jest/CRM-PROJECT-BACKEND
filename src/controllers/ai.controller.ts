import { Request, Response }  from 'express';
import {
  generateDashboardSummary,
  generateContactIntelligence,
  generateDealPrediction,
  generateMessageDraft,
  generateChatResponse,
} from '../services/ai.service';

export const dashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await generateDashboardSummary(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const contactIntel = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await generateContactIntelligence(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const dealPredict = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await generateDealPrediction(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const composeMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await generateMessageDraft(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const chatWithAssistant = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await generateChatResponse(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};