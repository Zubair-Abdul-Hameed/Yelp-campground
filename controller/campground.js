const Campground = require("../models/campgrounds")
const { cloudinary } = require("../cloudinary")
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}

module.exports.renderNewCampgroundForm = (req, res) => {
    res.render("campgrounds/new")
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({path: "reviews", populate: {path: "author"}}).populate("author");
    // flash error partials starts
    if (!campground) {
        req.flash("error", "Can't find that campground!")
        return res.redirect("/campgrounds")
    }
    // flash error partials ends
    res.render("campgrounds/show", { campground })
}

module.exports.createNewCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/campgrounds/new');
    }
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    campground.images = req.files.map(f => ({ url: f.path,filename: f.filename }))
    campground.author = req.user._id //req.user is added automatically by passport. after you're logged in
    await campground.save()
    console.log(campground)
    req.flash("success", "Successfully made a new campground!")//flash success partials
    res.redirect(`/campgrounds/${campground._id}`) 
}

module.exports.renderEditCampForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    // flash error partials starts
    if (!campground) {
        req.flash("error", "Can't find that campground!")
        return res.redirect("/campgrounds")
    }
    // flash error partials ends
    res.render("campgrounds/edit", { campground })
}

module.exports.editFarm = async (req, res) => {
    const { id } = req.params
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/campgrounds/${id}/edit`);
    }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    const imgs = req.files.map(f => ({ url: f.path,filename: f.filename }))
    campground.images.push(...imgs)
    campground.save()
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: {filename: { $in: req.body.deleteImages } } } } )
    }
    req.flash("success", "Successfully updated a campground!")//flash success partials
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteFarm = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted a campground!")//flash success partials
    res.redirect("/campgrounds")
}
