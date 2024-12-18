if(process.env.NODE_ENV!="production"){
  require('dotenv').config();
}

console.log(process.env)
const express = require("express");

const app = express();
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash"); // Import connect-flash
const listingRouter = require("./Routes/listing");
const reviewRouter = require("./Routes/review");
const userRouter = require("./Routes/user.js");
const passport = require("passport");
const localStrategy = require("passport-local");
const user = require("./models/user.js");
const ExpressError = require("./utils/ExpressErrors.js");
const Listing = require("./models/listing.js");  // Ensure this path is correct
const MongoStore = require('connect-mongo');

// Set up view engine, middleware, etc.
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));


let dbUrl = process.env.ATLASDB_URL;
// Database connection
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });

  const store = MongoStore.create({

    mongoUrl : dbUrl,
    crypto:{
      secret:process.env.SECRET,
  
    },
    touchAfter:24*3600
  });

  store.on("error",()=>{
    console.log("Error in mongosession store",err)
  });

// 1. Session middleware: initializes session
app.use(
  session({
    store,
    secret:process.env.SECRET , // Replace with a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);


// 2. Flash middleware: must come after session to store flash messages in the session
app.use(flash()); // Flash messages middleware

// 3. Passport middleware: initializes passport session
app.use(passport.initialize());
app.use(passport.session());

// 4. Custom middleware to set res.locals (make flash messages available in views)
app.use((req, res, next) => {
  console.log("User:", req.user);  // Check if user is logged in and session is set correctly
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;  // Make sure this is set correctly for views
  next();
});

passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get("/demoUser", async (req, res) => {
  let fakeUser = new user({
    email: "student@gmail.com",
    username: "Student",
  });

  let registeredUser = await user.register(fakeUser, "helloworld");
  res.send(registeredUser);
});

// Use listing routes for /listings
app.use("/listings", listingRouter);

// Use review routes for /listings/:id/reviews
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q; // Get the search query from the URL

    if (!query) {
      return res.redirect("/listings"); // If no query, redirect to the listings page
    }

    // Perform a text search on the 'title' and 'description' fields
    const listings = await Listing.find({
      $text: { $search: query }, // Use the full-text search query operator
    });

    // Render the search results page with the listings
    res.render("listings/searchResult", { listings, query });  // Correct path
  } catch (err) {
    next(err); // Pass any error to the error handler
  }
});



app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Handle invalid routes (404)
app.all("*", (req, res, next) => {
  console.log(`No route matched for ${req.method} ${req.originalUrl}`);
  next(new ExpressError(404, "Page not found!"));
});

// Error-handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  console.error("Error:", err.stack || err.message); // Log error for debugging
  res.status(statusCode).render("error.ejs", { message });
});

// Start server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
