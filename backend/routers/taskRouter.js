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
  userApplications,
} = require("../controllers/taskController");
const {
  checkAdmin,
  checkPM,
  checkApplicationAccess,
  checkTaskPermissions,
} = require("../middleware/auth");

// ================= APPLICATIONS ================= //
router.post("/create-app", checkPM, createApplication);

router.get("/all-apps", checkAdmin, allApplications);

router.get("/all-apps/user", userApplications);

router.get("/apps/:app", checkApplicationAccess, applicationDetails);

router.post("/update-app/:app", checkPM, updateApp);

// ================= PLANS ================= //

router.post("/create-plan", checkPM, createPlan);

router.get("/all-plans/:app", checkApplicationAccess, allPlans);

router.post("/update-plan/:app", checkPM, updatePlan);

// ================= TASKS ================= //

router.post("/create-task", checkTaskPermissions, createTask);

router.get("/all-tasks/:app", checkApplicationAccess, allAppTasks);

router.get("/task-details/:task", checkApplicationAccess, taskDetails);

router.post("/update-task/:task", checkPM, updateTask);

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

router.post("/create-notes/:task", checkApplicationAccess, createNotes);

router.get("/all-notes/:task", checkApplicationAccess, allNotes);

// ================= AUTH ================= //
router.post("/update-task/:task", checkPM);

module.exports = router;
