const Listing = require("../models/listing");
const Review = require("../models/review");

// Create a new review for a listing
module.exports.createReview = async (req, res) => {
  const { id } = req.params; // Listing ID
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  req.flash("success", "New review created!");
  res.redirect(`/listings/${id}`);
};

// Delete a specific review
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params; // Listing ID and Review ID
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // Remove reference from the listing
  await Review.findByIdAndDelete(reviewId); // Delete the review itself
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};
