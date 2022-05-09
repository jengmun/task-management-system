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
  allNotes,
  taskDetails,
  updateTask,
  updatePlan,
  applicationDetails,
  updateApp,
} = require("../controllers/taskController");
const { checkPM, checkTaskPermissions } = require("../middleware/auth");

// ================= APPLICATIONS ================= //
router.post("/create-app", checkPM, createApplication);

router.get("/all-apps", allApplications);

router.get("/apps/:app", applicationDetails);

router.post("/update-app/:app", updateApp);

// ================= PLANS ================= //

router.post("/create-plan", createPlan);
// checkPM,

router.get("/all-plans/:app", allPlans);

router.post("/update-plan/:app", updatePlan);

// ================= TASKS ================= //

router.post("/create-task", createTask);
// checkTaskPermissions,
router.get("/all-tasks/:app", allAppTasks);

router.get("/task-details/:task", taskDetails);

router.post("/update-task/:task", updateTask);

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

// ================= NOTES ================= //

router.post("/create-notes", createNotes);

router.get("/all-notes/:task", allNotes);

module.exports = router;
