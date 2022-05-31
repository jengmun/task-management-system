const express = require("express");
const router = express.Router();
const {
  createApplication,
  allApplications,
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
  a3AllAppTasksByState,
  allNotes,
  taskDetails,
  updatePlan,
  applicationDetails,
  updateApp,
  isGroup,
  updatePlanStatus,
  hasPermissions,
  getPermissions,
  a3CreateTask,
  a3TaskStateProgression,
  a3CreateNotes,
} = require("../controllers/taskController");
const { checkPM, checkTaskPermissions } = require("../middleware/auth");
const { a3Login, a3CheckTaskPermissions } = require("../middleware/a3Auth");

// ================= APPLICATIONS ================= //

router.post("/create-app", checkPM, createApplication);

router.get("/all-apps", allApplications);

router.get("/uncreated-apps/user", uncreatedApplications);

router.get("/apps/:app", applicationDetails);

router.post("/update-app/:app", checkPM, updateApp);

router.post("/check-permissions", hasPermissions);

router.get("/get-permissions/:app", getPermissions);

router.post("/update-permissions", checkPM, updatePermissions);

// ================= PLANS ================= //

router.post("/create-plan", checkPM, createPlan);

router.get("/all-plans/:app", allPlans);

router.get("/all-open-plans/:app", allOpenPlans);

router.post("/update-plan/:app", checkPM, updatePlan);

router.post("/update-plan-status/:app", checkPM, updatePlanStatus);

// ================= TASKS ================= //

router.post("/create-task", checkTaskPermissions, createTask, createNotes);

router.get("/all-tasks/:app", allAppTasks);

router.get("/task-details/:task", taskDetails);

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

router.post("/create-notes/:task", checkTaskPermissions, createNotes);

router.get("/all-notes/:task", allNotes);

// ================= AUTH ================= //

router.post("/is-group", isGroup);

// ================= ASSIGNMENT 3 ================= //

router.get(
  "/a3/all-tasks/:username/:password/:app/:state",
  a3Login,
  a3AllAppTasksByState
);

router.post(
  "/a3/:username/:password/create-task",
  a3Login,
  a3CheckTaskPermissions,
  a3CreateTask,
  a3CreateNotes
);

router.post(
  "/a3/:username/:password/approve-done-task",
  a3Login,
  a3CheckTaskPermissions,
  a3TaskStateProgression,
  a3CreateNotes
);

module.exports = router;
