const express = require("express");
const router = express.Router();
const {
  createApplication,
  createPlan,
  createTask,
  updateTaskState,
  createNotes,
} = require("../controllers/taskController");
const checkState = require("../modules/checkState");

router.post("/create-app", createApplication);

router.post("/create-plan", createPlan);

router.post("/create-task", createTask);

router.post("/update-task-state", updateTaskState);

router.post("/create-notes", createNotes);

module.exports = router;
