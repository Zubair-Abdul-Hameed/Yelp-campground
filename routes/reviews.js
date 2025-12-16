const express = require('express');
const router = express.Router({ mergeParams: true });

const ExpressError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

const Review = require("../models/reviews")
const Campground = require("../models/campgrounds");
const { merge } = require('./campgrouds');
const reviews = require("../controller/reviews")

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware")


router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;