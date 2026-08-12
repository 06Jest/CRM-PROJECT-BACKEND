import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middleware/error.middleware";


export interface CreateFeedbackData {
  name?: string;
  email?: string;
  userType?:
    | "everyday_user"
    | "manager"
    | "technical"
    | "prefer_not_to_say";
  rating?: number | null;
  message: string;
}

export const createFeedbackToDB = async (
  data: CreateFeedbackData
) => {
  const db = supabaseAdmin;

  const { data: feedback, error } = await db
    .from("feedbacks")
    .insert({
      name: data.name ?? null,
      email: data.email ?? null,
      user_type: data.userType ?? "prefer_not_to_say",
      rating: data.rating ?? null,
      message: data.message.trim(),
    })
    .select(`
      id,
      name,
      email,
      user_type,
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