const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");




const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    address: [{type: mongoose.Schema.Types.ObjectId, ref: "address"}],
    verified: { type: Boolean, default: false },
    adminApproval : {type:Boolean, default:true}
});

userSchema.methods.generateAuthToken = function () {

    const token = jwt.sign({ _id: this._id,adminApproval:this.adminApproval }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
    return token;
};

const User = mongoose.model("user", userSchema);

const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("First Name"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
    });
    return schema.validate(data);
};

module.exports = { User, validate }; 