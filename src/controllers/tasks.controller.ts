import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";

import {
  getTasksFromDB,
  getTaskByIDFromDB,
  addTaskToDB,
  updateTaskFromDB,
  completeTaskFromDB,
  assignTaskFromDB,
  updateTaskDueDateFromDB,
  updateTaskPriorityFromDB,
  getOverdueTasksFromDB,
  getDueTodayTasksFromDB,
  getTasksByAssigneeFromDB,
  getTasksByPriorityFromDB,
  getTasksByStatusFromDB,
  deleteTaskFromDB,
} from "../services/tasks.service";
import { TaskPriority, TaskStatus } from "../types/task";

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const tasks = await getTasksFromDB(orgId, userId);

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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTaskByIDFromDB(id, orgId, userId);

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
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    const task = req.body;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await addTaskToDB(orgId, userId, task);

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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    if (check.author_id !== userId) {
      throw new AppError(403, "Only the task creator can edit this task");
    }

    const data = await updateTaskFromDB(
      id,
      orgId,
      userId,
      task
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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    if (check.author_id !== userId) {
      throw new AppError(
        403,
        "Only the task creator can assign this task"
      );
    }

    const data = await assignTaskFromDB(
      id,
      orgId,
      userId,
      assigned_to
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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    const isAllowed =
      check.author_id === userId ||
      check.assigned_to === userId;

    if (!isAllowed) {
      throw new AppError(
        403,
        "Only the task creator or assignee can complete this task"
      );
    }

    const data = await completeTaskFromDB(
      id,
      orgId,
      userId,
      completed
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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    if (check.author_id !== userId) {
      throw new AppError(
        403,
        "Only the task creator can update the task priority"
      );
    }

    const data = await updateTaskPriorityFromDB(
      id,
      orgId,
      userId,
      priority
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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    if (check.author_id !== userId) {
      throw new AppError(
        403,
        "Only the task creator can update the due date"
      );
    }

    const data = await updateTaskDueDateFromDB(
      id,
      orgId,
      userId,
      due_date
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

export const getTasksByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.params;

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTasksByStatusFromDB(
      orgId,
      userId,
      status as TaskStatus
    );

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksByPriority = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { priority } = req.params;

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTasksByPriorityFromDB(
      orgId,
      userId,
      priority as TaskPriority
    );

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksByAssignee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignedTo = uuidSchema.parse(req.params.assignedTo);

    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTasksByAssigneeFromDB(
      orgId,
      assignedTo
    );

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getDueTodayTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getDueTodayTasksFromDB(
      orgId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Due today tasks fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getOverdueTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getOverdueTasksFromDB(
      orgId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Overdue tasks fetched successfully",
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

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    if (check.author_id !== userId) {
      throw new AppError(
        403,
        "Only the task creator can delete this task"
      );
    }

    const data = await deleteTaskFromDB(
      id,
      orgId,
      userId
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