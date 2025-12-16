const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const User = require("../models/user")
const { route } = require("./campgrouds")
const passport = require("passport")
const { storeReturnTo } = require('../middleware');
const users = require("../controller/user")
const user = require("../models/user")

router.route("/register")
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register))

router.route("/login")
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), users.login)

router.get("/logout", users.logout)

module.exports = router