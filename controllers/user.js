const User = require("../models/user");
const passport = require("passport");

module.exports = {
  // Show signup form
  renderSignup: (req, res) => {
    res.render("users/signup.ejs");
  },

  // Handle signup POST request
  signup: async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      req.login(registeredUser, (err) => {
        if (err) {
          req.flash(
            "error",
            "Registration successful, but failed to log in. Please try logging in."
          );
          return next(err);
        }
        req.flash("success", "Successfully registered! Welcome to Wanderlust!");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message); // Display specific error message
      console.log("Error during signup: ", err.message); // Log the error for debugging
      res.redirect("/signup");
    }
  },

  // Show login form
  renderLogin: (req, res) => {
    res.render("users/login.ejs");
  },

  // Handle login POST request
  login: (req, res) => {
    console.log("User logged in:", req.user); // Log user details for debugging
    req.flash("success", "Welcome back to Wanderlust!");
    const redirectUrl = res.locals.redirectUrl || req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl; // Clear the redirectUrl after successful login
    res.redirect(redirectUrl);
  },

  // Handle logout functionality
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) {
        req.flash("error", "Logout failed. Please try again.");
        return next(err);
      }
      req.flash("success", "You have successfully logged out.");
      const redirectUrl = req.session.redirectUrl || "/listings";
      delete req.session.redirectUrl; // Clear the redirectUrl from session
      res.redirect(redirectUrl);
    });
  },
};
