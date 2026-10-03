import {
  Request,
  Response,
  NextFunction,
} from "express";
import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";

import {
  addTaskService,
  archiveTaskService,
  assignTaskService,
  completeTaskService,
  deleteTaskService,
  getTaskByIDService,
  getTasksService,
  updateTaskDueDateService,
  updateTaskPriorityService,
  updateTaskService,
} from "./tasks.service";

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const tasks = await getTasksService(
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Tasks fetch successful",
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

export const getTaskByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTaskByIDService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Task fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const addTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profileId = req.user?.profile_id;
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    const task = req.body;

    if (!profileId || !orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await addTaskService(
      profileId,
      orgId,
      memberId,
      task,
      accessToken
    );

    return res.status(201).json({
      success: true,
      message: "Add Task successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const task = req.body;

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateTaskService(
      id,
      orgId,
      memberId,
      task,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Update Task successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const assignTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const { assigned_to } = req.body;

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await assignTaskService(
      id,
      orgId,
      memberId,
      assigned_to,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const completeTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const { completed } = req.body;

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await completeTaskService(
      id,
      orgId,
      memberId,
      completed,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTaskPriority = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const { priority } = req.body;

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateTaskPriorityService(
      id,
      orgId,
      memberId,
      priority,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Task priority updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTaskDueDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const { due_date } = req.body;

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await updateTaskDueDateService(
      id,
      orgId,
      memberId,
      due_date,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Task due date updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const archiveTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await archiveTaskService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Archive Task successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await deleteTaskService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Delete Task successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};