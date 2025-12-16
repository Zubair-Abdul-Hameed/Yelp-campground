const express = require('express');
const catchAsync = require("../utils/catchAsync")
const Campground = require("../models/campgrounds")
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware")
const campground = require("../controller/campground")
const multer = require("multer")
const { storage } = require("../cloudinary")
const upload = multer({ storage })



const router = express.Router();

// semicolons";" will break the router.route code
router.route("/")
    .get(catchAsync(campground.index))//no ";" allowed
    .post(isLoggedIn, validateCampground, upload.array("image"), catchAsync(campground.createNewCampground))

router.get("/new", isLoggedIn, campground.renderNewCampgroundForm)

router.route("/:id")
    .get(campground.showCampground)
    .put(isLoggedIn, isAuthor, validateCampground, upload.array("image"), campground.editFarm)
    .delete(isLoggedIn, isAuthor, campground.deleteFarm)

router.get("/:id/edit", isLoggedIn, isAuthor, campground.renderEditCampForm)


module.exports = router;