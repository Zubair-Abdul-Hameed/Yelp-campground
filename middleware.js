const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError")
const Campground = require("./models/campgrounds")
const Review = require("./models/reviews")



module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first")
        return res.redirect("/login")
    }
    next()
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // error.details is an array of object, where each object contains information about a specific validation error.
        // .map() is used to iterate over each element in the details array and extract the message property from each element.
        // all the extracted messages are then joined together into a single string, separated by commas.
        //although, usually there will be only one error message for this case, but its in an object, so we handle it this way.
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params
    const foundCampground = await Campground.findById(id)
    if (!foundCampground.author.equals(req.user._id)) {
        req.flash("error", "Sorry, you dont have permission to do that!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        // error.details is an array of object, where each object contains information about a specific validation error.
        // .map() is used to iterate over each element in the details array and extract the message property from each element.
        // all the extracted messages are then joined together into a single string, separated by commas.
        //although, usually there will be only one error message for this case, but its in an object, so we handle it this way.
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params
    const foundReview = await Review.findById(reviewId)
    if (!foundReview.author.equals(req.user._id)) {
        req.flash("error", "Sorry, you dont have permission to do that!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}
