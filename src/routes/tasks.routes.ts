import { Router } from "express";

import {
  authenticateUser,
  verifyToken,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  getTasks,
  getTaskByID,
  addTask,
  updateTask,
  assignTask,
  completeTask,
  updateTaskPriority,
  updateTaskDueDate,
  deleteTask,
} from "../controllers/tasks.controller";

import {
  addTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  completeTaskSchema,
  updateTaskPrioritySchema,
  updateTaskDueDateSchema,
} from "../schema/tasks.schema";
import { createLimiter, deleteLimiter, readLimiter, updateLimiter, } from '../middleware/rate.limit.middleware';

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);


router.get("/show-tasks",readLimiter, getTasks);
router.get("/show-task/:id",readLimiter, getTaskByID);


router.post(
  "/add-task",
  createLimiter,
  validateBody(addTaskSchema),
  addTask
);


router.patch(
  "/update-task/:id",
  updateLimiter,
  validateBody(updateTaskSchema),
  updateTask
);

router.patch(
  "/assign-task/:id",
  updateLimiter,
  validateBody(assignTaskSchema),
  assignTask
);

router.patch(
  "/complete-task/:id",
  updateLimiter,
  validateBody(completeTaskSchema),
  completeTask
);

router.patch(
  "/update-task-priority/:id",
  updateLimiter,
  validateBody(updateTaskPrioritySchema),
  updateTaskPriority
);

router.patch(
  "/update-task-due-date/:id",
  updateLimiter,
  validateBody(updateTaskDueDateSchema),
  updateTaskDueDate
);

router.delete("/delete-task/:id",deleteLimiter, deleteTask);

export default router;