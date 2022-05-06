const express = require("express");
const router = express.Router();
const {
  login,
  getLoginDetails,
  logout,
  updateEmail,
  getAllUsers,
  getAllGroups,
  getUserGroups,
  createAccount,
  updateDetails,
  updateGroups,
  createGroups,
  addGroupMember,
  removeGroupMember,
  adminPasswordReset,
  userPasswordReset,
  userUpdatePassword,
  assignPM,
} = require("../controllers/userController");
const { checkAdmin, checkLoggedIn } = require("../middleware/auth");

// ================= AUTHENTICATION ================= //

router.post("/login", login);

router.get("/login-details", checkLoggedIn, getLoginDetails);

router.get("/logout", checkLoggedIn, logout);

// ================= USER PRIVILEGES (EXCLUDING PW RESET) ================= //

router.post("/update-email", checkLoggedIn, updateEmail);

router.get("/all-groups", getAllGroups);
//  checkLoggedIn,
// ================= ADMIN PRIVILEGES ================= //

router.get("/all-users", getAllUsers);
// checkAdmin,
router.post("/groups-users", checkAdmin, getUserGroups);

router.post("/create-account", checkAdmin, createAccount);

router.post("/update-details", checkAdmin, updateDetails);

router.post("/update-groups", checkAdmin, updateGroups);

router.post("/create-groups", checkAdmin, createGroups);

router.post("/add-group-member", checkAdmin, addGroupMember);

router.post("/remove-group-member", checkAdmin, removeGroupMember);

router.post("/assign-PM", assignPM);
// checkAdmin,
// ================= PASSWORD RESETTING - USER AND ADMIN ================= //

router.post("/admin-password-reset", checkAdmin, adminPasswordReset);

router.post("/user-password-reset/:username", userPasswordReset);

router.post("/user-update-password", checkLoggedIn, userUpdatePassword);

module.exports = router;
