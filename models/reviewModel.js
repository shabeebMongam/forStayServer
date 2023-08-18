const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "room" },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "hotel" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    comment: { type: String, default: "" },
})

const Review = mongoose.model("review",reviewSchema)

module.exports = Review