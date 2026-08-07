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
  deleteTaskFromDB,
} from "../services/tasks.service";

import { addActivityToDB } from "../services/activities.service";
import { ensureResourceLimit } from "../services/plans.service";
import { table } from "../config/tables";


export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const tasks = await getTasksFromDB(
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
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTaskByIDFromDB(
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
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    const task = req.body;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    await ensureResourceLimit(
      orgId,
      table.tasks,
      "tasks",
      "active_limit",
      accessToken
    );

    const data = await addTaskToDB(
      orgId,
      memberId,
      task,
      accessToken
    );


    await addActivityToDB(
      orgId,
      memberId,
      {
        lead_id:
          data.target_type === "lead"
            ? data.target_id
            : undefined,

        contact_id:
          data.target_type === "contact"
            ? data.target_id
            : undefined,

        customer_id:
          data.target_type === "customer"
            ? data.target_id
            : undefined,

        type: "task",
        action: "created",
        title:
          `New task for ${data.assignee.profile.first_name} ${data.assignee.profile.last_name}`,

        target_name:
          `${data.assignee.profile.first_name} ${data.assignee.profile.last_name}`,

        description:
          `Created task "${data.title}"`,
      },accessToken
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
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }


    const check = await getTaskByIDFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );


    if (check.author_id !== memberId) {
      throw new AppError(
        403,
        "Only the task creator can edit this task"
      );
    }


    const data = await updateTaskFromDB(
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
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }


    const check = await getTaskByIDFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );


    if (check.author_id !== memberId) {
      throw new AppError(
        403,
        "Only the task creator can assign this task"
      );
    }


    const data = await assignTaskFromDB(
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
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }


    const check = await getTaskByIDFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );


    const isAllowed =
      check.author_id === memberId ||
      check.assigned_to === memberId;


    if (!isAllowed) {
      throw new AppError(
        403,
        "Only the task creator or assignee can complete this task"
      );
    }


    const data = await completeTaskFromDB(
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
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }


    const check = await getTaskByIDFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );


    if (check.author_id !== memberId) {
      throw new AppError(
        403,
        "Only the task creator can update the task priority"
      );
    }


    const data = await updateTaskPriorityFromDB(
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
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }


    const check = await getTaskByIDFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );


    if (check.author_id !== memberId) {
      throw new AppError(
        403,
        "Only the task creator can update the due date"
      );
    }


    const data = await updateTaskDueDateFromDB(
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


export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;


    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }


    const check = await getTaskByIDFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );


    if (check.author_id !== memberId) {
      throw new AppError(
        403,
        "Only the task creator can delete this task"
      );
    }


    const data = await deleteTaskFromDB(
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