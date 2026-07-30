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
  getTasksByStatus,
  getTasksByPriority,
  getTasksByAssignee,
  getDueTodayTasks,
  getOverdueTasks,
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

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);


router.get("/show-tasks", getTasks);
router.get("/show-task/:id", getTaskByID);

router.get("/show-tasks/status/:status", getTasksByStatus);
router.get("/show-tasks/priority/:priority", getTasksByPriority);
router.get("/show-tasks/assignee/:assignedTo", getTasksByAssignee);

router.get("/show-due-today-tasks", getDueTodayTasks);
router.get("/show-overdue-tasks", getOverdueTasks);


router.post(
  "/add-task",
  validateBody(addTaskSchema),
  addTask
);


router.patch(
  "/update-task/:id",
  validateBody(updateTaskSchema),
  updateTask
);

router.patch(
  "/assign-task/:id",
  validateBody(assignTaskSchema),
  assignTask
);

router.patch(
  "/complete-task/:id",
  validateBody(completeTaskSchema),
  completeTask
);

router.patch(
  "/update-task-priority/:id",
  validateBody(updateTaskPrioritySchema),
  updateTaskPriority
);

router.patch(
  "/update-task-due-date/:id",
  validateBody(updateTaskDueDateSchema),
  updateTaskDueDate
);

router.delete("/delete-task/:id", deleteTask);

export default router;