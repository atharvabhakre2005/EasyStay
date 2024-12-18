const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressErrors.js");
const { listingSchema } = require("../schema.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
// Fetch all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// Render new listing form
module.exports.renderNewForm = async (req, res) => {
  res.render("listings/new.ejs");
};

// Show a specific listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// Create a new listing
module.exports.createListing = async (req, res) => {

  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  })
  .send()
    

  console.log(response.body.features[0].geometry);

  let url = req.file.path;
  let filename   = req.file.filename;
  const result = listingSchema.validate(req.body);
  if (result.error) {
    const errorMsg = result.error.details.map((el) => el.message).join(", ");
    req.flash("error", `Validation Error: ${errorMsg}`);
    return res.redirect("/listings/new");
  }
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url,filename};
  newListing.geometry = response.body.features[0].geometry;

  let savedListings = await newListing.save();
  console.log(savedListings);
  
  req.flash("success", "New listing created successfully!");
  res.redirect("/listings");
};

// Render edit form for a listing
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing ,originalImageUrl});
};

// Update a listing
module.exports.updateListing = async (req, res) => {
 
  const { id } = req.params;
  if (!req.body.listing || !req.body.listing.title || !req.body.listing.price) {
    req.flash("error", "Invalid data for updating listing!");
    return res.redirect(`/listings/${id}/edit`);
  }
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file !== "undefined"){
  let url = req.file.path;
  let filename   = req.file.filename;
  listing.image = {url,filename};
  await listing.save();
  }
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

// Delete a listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};
    