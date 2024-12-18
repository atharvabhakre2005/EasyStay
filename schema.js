const j = require('joi');
const review = require('./models/review');

module.exports.listingSchema = j.object({
    listing  : j.object({
        title:j.string().required(),
        description:j.string().required(),
        location:j.string().required(),
        country:j.string().required(),
        price:j.number().required().min(0),
        image:j.string().allow("",null)
    }).required()
});

module.exports.reviewSchema = j.object({
    review :j.object({
        rating:j.number().required().min(1).max(5),
        comment:j.string().required()
    }).required()
})