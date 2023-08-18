const jwt =  require('jsonwebtoken')
const jwt_decode =require('jwt-decode');
const { User } = require('../../models/userModel');



const verifyToken = (req,res,next)=>{
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

    req.body.Id = decoded._id;

  
   

    jwt.verify(theToken, process.env.JWTPRIVATEKEY,(err,valid)=>{
        // if(valid){
        //     console.log(valid);
        //         req.body.Id = decoded._id;
        //         next()
        // }
        if(err){
                res.send("Invalid Token")
        }else{
            next()
        }
    })
    // console.log(theToken);
}

module.exports = {verifyToken}

