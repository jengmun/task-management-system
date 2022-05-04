const express = require("express");
const router = express.Router();
const {
  createApplication,
  createPlan,
  createTask,
  updatePermissions,
  taskStateProgression,
  taskStateRegression,
  createNotes,
} = require("../controllers/taskController");
const { checkPermissions } = require("../middleware/auth");

router.post("/create-app", checkPermissions, createApplication);

router.post("/create-plan", checkPermissions, createPlan);

router.post("/create-task", checkPermissions, createTask);

router.post("/update-permissions", checkPermissions, updatePermissions);

router.post("/task-state-progression", checkPermissions, taskStateProgression);

router.post("/task-state-regression", checkPermissions, taskStateRegression);

router.post("/create-notes", createNotes);

router.post("/permissions");

module.exports = router;
