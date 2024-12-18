const express = require("express");
const router = express.Router({ mergeParams: true }); // Access `:id` from parent routes
const reviewController = require("../controllers/reviews.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Middleware to validate review data
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    req.flash("error", `Validation Error: ${errMsg}`);
    return res.redirect("back");
  } else {
    next();
  }
};

// Handle routes for reviews
router.route("/")
  .post(
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
  );

router.route("/:reviewId")
  .delete(
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.deleteReview)
  );

module.exports = router;
