if(process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}
// console.log(process.env.CLOUDINARY_CLOUD_NAME)

const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const express = require("express")
const mongoose = require('mongoose');
const path = require("path")
const methodOverride = require('method-override');
const ExpressError = require("./utils/ExpressError")
const session = require("express-session") //After importing it
const flash = require("connect-flash") // After importing it
const ejsMate = require('ejs-mate');
const passport = require("passport")//sfter installing
const LocalStrategy = require("passport-local")//after installing it, a better name for the varriable may be passportLocal
const User = require("./models/user")
const helmet = require("helmet")
const { MongoStore } = require('connect-mongo');

const campgroundRoutes = require("./routes/campgrouds")
const reviewRoutes = require("./routes/reviews")
const userRoutes = require("./routes/users");
const { name } = require("ejs");

const app = express()
app.set('query parser', 'extended');

const dbURL = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp-maptiler-demo"
mongoose.connect(dbURL)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate);//tells express to use ejs-mate for all ejs files
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

// using mongo to store session
const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret
    },
    touchAfter: 24 * 3600
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

// configuring sessions starts
const sessionConfig = {
    // name: "session",
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
		httpOnly: true,
        // secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7 //needed in hand with the above line to set expiration
	}
}
app.use(session(sessionConfig))
// configuring sessions end

// serving static assets start
app.use(express.static(path.join(__dirname, "public")))
// serving static asserts end
app.use(sanitizeV5({ replaceWith: '_' }));

// setting up flash starts
app.use(flash());
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/do85m5uow/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//configuring passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))//tells passport to use localStrategy, anthenticate which is a static func add be passport local mongoose

passport.serializeUser(User.serializeUser());//specify how to store users in session
passport.deserializeUser(User.deserializeUser())//specify how to remove users in session
    //this two method on the User model as wel as authenticate() was added  as a static methid by passport local mongoose. 

app.use((req, res, next) => {
    res.locals.currentUser = req.user
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
})


app.get("/", (req, res) => {
    res.render("home")
})

// using users/auth routes
app.use("/", userRoutes);

// using campground routes
app.use("/campgrounds", campgroundRoutes);

// using review routes
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    // const { message = "Something went wrong", status = 500 } = err
    const { status = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(status).render("error", { err })
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});

// 74.220.49.0/24
// 74.220.57.0/24

// week 16:
// Still on the yelpcamp app, I refactored the code to campground controller so as clean up campground routes even further, also added reviews controller, and further cleaned it up by grouping routes with same path but different verbs using router.route
// Then worked on the review page so I can display star rating and allow users to submit reviews using by selecting number of stars.