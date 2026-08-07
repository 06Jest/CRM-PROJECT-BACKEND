import { AppError } from "../middleware/error.middleware";
import { Roles } from "../types/global";

export const requireManagerOrOwner = (
  role: Roles | null | undefined
): void => {
  if (
    role !== "owner" &&
    role !== "manager"
  ) {
    throw new AppError(
      403,
      "Insufficient permissions"
    );
  }
};