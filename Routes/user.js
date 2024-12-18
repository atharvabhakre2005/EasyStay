const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.js");
const passport = require("passport"); // Passport used for authentication
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirect } = require("../middleware.js");

// Handle routes for signup
router.route("/signup")
  .get(userController.renderSignup) // Show signup form
  .post(wrapAsync(userController.signup)); // Handle signup POST request

// Handle routes for login
router.route("/login")
  .get(userController.renderLogin) // Show login form
  .post(
    saveRedirect,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true, // Automatically flash error message on failure
    }),
    userController.login
  ); // Handle login POST request

// Handle logout functionality
router.get("/logout", userController.logout);

module.exports = router;
