const express = require("express");
const {
  createApplication,
  createPlan,
  createTask,
} = require("../controllers/taskController");
const checkState = require("../modules/checkState");
const router = express.Router();

router.post("/create-app", createApplication);

router.post("/create-plan", createPlan);

router.post("/create-task", createTask);

router.post("/", checkState);

module.exports = router;
