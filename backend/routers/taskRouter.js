const express = require("express");
const router = express.Router();
const {
  createApplication,
  allApplications,
  userApplications,
  uncreatedApplications,
  createPlan,
  allPlans,
  allOpenPlans,
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
  isGroup,
  isMember,
  updatePlanStatus,
  hasPermissions,
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

router.get("/uncreated-apps/user", uncreatedApplications);

router.get("/apps/:app", checkApplicationAccess, applicationDetails);

router.post("/update-app/:app", checkPM, updateApp);

router.post("/check-permissions", hasPermissions);

router.post("/update-permissions", checkPM, updatePermissions);

// ================= PLANS ================= //

router.post("/create-plan", checkPM, createPlan);

router.get("/all-plans/:app", checkApplicationAccess, allPlans);

router.get("/all-open-plans/:app", checkApplicationAccess, allOpenPlans);

router.post("/update-plan/:app", checkPM, updatePlan);

router.post("/update-plan-status/:app", checkPM, updatePlanStatus);

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
