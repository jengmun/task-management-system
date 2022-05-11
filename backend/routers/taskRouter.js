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
  isGroup,
  isMember,
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

router.post("/update-permissions", checkPM, updatePermissions);

// ================= PLANS ================= //

router.post("/create-plan", checkPM, createPlan);

router.get("/all-plans/:app", checkApplicationAccess, allPlans);

router.post("/update-plan/:app", checkPM, updatePlan);

// ================= TASKS ================= //

router.post("/create-task", checkTaskPermissions, createTask, createNotes);

router.get("/all-tasks/:app", checkApplicationAccess, allAppTasks);

router.get("/task-details/:task", checkApplicationAccess, taskDetails);

router.post("/update-task", updateTask, createNotes);

router.post(
  "/task-state-progression",
  checkTaskPermissions,
  taskStateProgression,
  createNotes
);

router.post(
  "/task-state-regression",
  checkTaskPermissions,
  taskStateRegression,
  createNotes
);

// ================= NOTES ================= //

router.post("/create-notes/:task", checkApplicationAccess, createNotes);

router.get("/all-notes/:task", checkApplicationAccess, allNotes);

// ================= AUTH ================= //

router.get("/is-member/:app", checkApplicationAccess, isMember);

router.post("/is-group", isGroup);

module.exports = router;
