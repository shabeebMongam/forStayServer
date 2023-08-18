const jwt = require('jsonwebtoken')
const jwt_decode = require('jwt-decode');
const { User } = require('../../models/userModel');



const verifyTokenForUser = (req, res, next) => {
    // console.log(req.headers['authorization']);
    const authToken = req.headers['authorization']

    if (!authToken) {
        return res.status(401).send({
            message: "No auth token",
            Status: false,
        });
    }

    // import jwt_decode from "jwt-decode";
    const theToken = authToken.split(" ")[1]
    // console.log(process.env.JWTPRIVATEKEY);
    let decoded = jwt_decode(theToken)
    // console.log(decoded); 

    // req.body.Id = decoded._id;

    const validatingUser = async (id) => {
        const validUser = await User.findOne({ _id: id })
        console.log(validUser);

        if (validUser.adminApproval) {
            return true
        } else {
            return false
        }
    }


    jwt.verify(theToken, process.env.JWTPRIVATEKEY, async (err, valid) => {
        if (valid) {
            console.log(valid);
            const validUser = await User.findOne({ _id: valid._id })

            if (validUser.adminApproval) {
                req.body.Id = decoded._id;
                next()
            }
            else{
                res.send({logHimOut:true})
            }


        }
        if (err) {
            res.send("Invalid Token")
        }
    })
    // console.log(theToken);
}

module.exports = { verifyTokenForUser }

