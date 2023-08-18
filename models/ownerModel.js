const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");




const ownerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    hotels: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }
},{
    timestamps:true
});

ownerSchema.methods.generateAuthToken = function () {

    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
    return token;
};

const Owner = mongoose.model("owner", ownerSchema);

const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("First Name"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
    });
    return schema.validate(data);
};

module.exports = { Owner, validate }; 