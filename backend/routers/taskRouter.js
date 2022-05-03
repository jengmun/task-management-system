const express = require("express");
const router = express.Router();
const {
  createApplication,
  createPlan,
  createTask,
} = require("../controllers/taskController");
const checkState = require("../modules/checkState");

router.post("/create-app", createApplication);

router.post("/create-plan", createPlan);

router.post("/create-task", createTask);

router.post("/", checkState);

module.exports = router;
