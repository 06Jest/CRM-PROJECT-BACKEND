
import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middleware/error.middleware";

const feedbackTable = "feedback";

export interface CreateFeedbackData {
  name?: string;
  email?: string;
  rating?: number | null;
  message: string;
}

export const createFeedbackToDB = async (
  data: CreateFeedbackData
) => {
  const db = supabaseAdmin;

  const { data: feedback, error } = await db
    .from(feedbackTable)
    .insert({
      name: data.name ?? null,
      email: data.email ?? null,
      rating: data.rating ?? null,
      message: data.message.trim(),
    })
    .select(`
      id,
      name,
      email,
      rating,
      message,
      created_at
    `)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to submit feedback: ${error.message}`
    );
  }

  return feedback;
};