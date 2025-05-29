const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  validateTask,
  validateTaskId,
  validate,
} = require("../middleware/taskValidate");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");

// Create a new task
router.post("/", auth, validateTask, validate, createTask);

// Get all tasks with filtering and pagination
router.get("/", auth, getTasks);

// Get task statistics
router.get("/stats", auth, getTaskStats);

// Get task by ID
router.get("/:id", auth, validateTaskId, validate, getTaskById);

// Update task
router.patch("/:id", auth, validateTaskId, validateTask, validate, updateTask);

// Delete task
router.delete("/:id", auth, validateTaskId, validate, deleteTask);

module.exports = router;