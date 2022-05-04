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

router.post("/create-app", createApplication);

router.post("/create-plan", createPlan);

router.post("/create-task", createTask);

router.post("/update-permissions", updatePermissions);

router.post("/task-state-progression", taskStateProgression);

router.post("/task-state-regression", taskStateRegression);

router.post("/create-notes", createNotes);

module.exports = router;
