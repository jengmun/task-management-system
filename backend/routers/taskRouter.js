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
const { checkPM, checkTaskPermissions } = require("../middleware/auth");

router.post("/create-app", checkPM, createApplication);

router.post("/create-plan", checkPM, createPlan);

router.post("/create-task", checkTaskPermissions, createTask);

router.post("/update-permissions", checkPM, updatePermissions);

router.post(
  "/task-state-progression",
  checkTaskPermissions,
  taskStateProgression
);

router.post(
  "/task-state-regression",
  checkTaskPermissions,
  taskStateRegression
);

router.post("/create-notes", createNotes);

module.exports = router;
