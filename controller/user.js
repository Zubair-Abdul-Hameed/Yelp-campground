const User = require("../models/user")

module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register")
}

module.exports.register = async(req, res, next) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => {
            if (err) return next(err)
                req.flash("success", "Welcome to yelpCamp")
                res.redirect("/campgrounds")
             })
    } catch(e) {
        req.flash("error", e.message)
        res.redirect("/register")
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login")
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!")
    let redirectUrl = res.locals.returnTo || "/campgrounds"
     // If the user was trying to DELETE a review (no GET route exists)
        if (redirectUrl.includes('/reviews/') && redirectUrl.includes('_method=DELETE')) {
            // Extract the campground id only
            const campgroundId = redirectUrl.split('/')[2];
            redirectUrl = `/campgrounds/${campgroundId}`;
        }
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}
