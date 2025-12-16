const mongoose = require('mongoose');
const cities = require("./cities")
const { descriptors, places } = require("./seedHelpers")
const Campground = require("../models/campgrounds")

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp-maptiler-demo")

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            author: "693c25ea98fbd5203905db4c",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
                        geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.",
            price: Math.floor(Math.random() * 20) + 10,
            images: [
                {
                url: 'https://res.cloudinary.com/do85m5uow/image/upload/v1765127524/YelpCamp/crdux8wsuv0xfld07gfd.jpg',
                filename: 'YelpCamp/crdux8wsuv0xfld07gfd',
                },
                {
                url: 'https://res.cloudinary.com/do85m5uow/image/upload/v1765127525/YelpCamp/kytf9cidepoxd0zecj7c.jpg',
                filename: 'YelpCamp/kytf9cidepoxd0zecj7c',
                }
            ]
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})
