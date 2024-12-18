const express = require("express");
const router = express.Router();
const { storage } = require("../cloudConfig.js"); 
const multer  = require('multer');
const upload = multer({storage});
const listingController = require("../controllers/listings.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Fetch all listings
router.route("/")
  .get(wrapAsync(listingController.index))  // Fetch all listings
  .post(isLoggedIn,upload.single("listing[image]"), wrapAsync(listingController.createListing));  // Create a new listing


// Render new listing form
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm));

// Routes for a specific listing
router.route("/:id")
  .get(wrapAsync(listingController.showListing))  // Show a specific listing
  .put(isLoggedIn, isOwner,upload.single("listing[image]"),wrapAsync(listingController.updateListing))  // Update a listing
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));  // Delete a listing

// Render edit form for a listing
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEditForm));

module.exports = router;
