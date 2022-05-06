const express = require("express");
const router = express.Router();
const {
  createApplication,
  allApplications,
  createPlan,
  allPlans,
  createTask,
  updatePermissions,
  taskStateProgression,
  taskStateRegression,
  createNotes,
  allAppTasks,
} = require("../controllers/taskController");
const { checkPM, checkTaskPermissions } = require("../middleware/auth");

router.post("/create-app", checkPM, createApplication);

router.get("/all-apps", allApplications);
// to update to indiv apps

router.post("/create-plan", createPlan);
// checkPM,

router.post("/all-plans", allPlans);

router.post("/create-task", createTask);
// checkTaskPermissions,
router.get("/:app/all-tasks", allAppTasks);

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
