const mongoose = require('mongoose')

const roomOnlySchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner" },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },

    roomNumber: { type: String, required: true },
    totalCapacity: { type: String, required: true },
    roomType: { type: String, required: true },
    description: { type: String, required: true },
    images: { type: Array },
    aminities: { type: Array },
    status: { type: Boolean, default: true },
    price:{type:Number,required:true},
    reservedDates:{type:[Date]}
    
},
    {
        timestamps: true
    });

const Room = mongoose.model("room", roomOnlySchema);

module.exports = Room; 