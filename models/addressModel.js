const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    name : {type : String},
    email : {type : String},
    address : {type : String},
    city : {type : String},
    state : {type : String},
    zipcode : {type:Number}
})


const Address = mongoose.model("address",addressSchema)

module.exports = Address