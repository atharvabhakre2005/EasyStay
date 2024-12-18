const  Listing = require("./models/listing");
const  Review = require("./models/review");
const review = require("./models/review");
// Middleware to check if the user is logged in


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;  // Save the URL where the user tried to go
        req.flash("error", "You must be logged in to create a listing");
        return res.redirect("/login");  // Redirect to login page if not authenticated
    }
    next();  // Proceed to the next middleware if the user is authenticated
};

// Middleware to save the redirect URL to be used after login
module.exports.saveRedirect = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;  // Set redirectUrl in locals to use in views
    }
    next();  // Proceed to the next middleware
};

module.exports.isOwner = async(req,res,next)=>{
    let{id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You dont have the perisssion to edit");
        return res.redirect(`/listings/${id}`);
    }
    next()
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let{id ,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of the review");
        return res.redirect(`/listings/${id}`);
    }
    next()
}