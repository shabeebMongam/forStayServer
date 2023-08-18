const { boolean } = require("joi");
const mongoose = require("mongoose");

const bookingDetailsSchema = new mongoose.Schema({
    
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "owner" },

    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "hotel" }
,
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "room" }
,
    paymentStatus:{type:Boolean,default:false},
    status:{type:Boolean, default:false},
    startDate:{type:Date},
    endDate:{type:Date},

    name: { type: String },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipcode: { type: Number }

})


const BookingDetails = mongoose.model( "bookingDetails",bookingDetailsSchema)

module.exports = BookingDetails