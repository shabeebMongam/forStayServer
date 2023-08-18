const { Admin, validate } = require("../models/adminModel");
const bcrypt = require("bcrypt");
const validateAdmin = require("../helpers/loginValidater/loginValidate");
const jwt = require("jsonwebtoken");
const Hotel = require("../models/hotelOnlyModel");
const Room = require("../models/roomOnlyModel");
const { User } = require("../models/userModel");
const { Owner } = require("../models/ownerModel");
const ObjectId = require('mongodb').ObjectID;



const adminLogIn = async (req, res) => {
    // const {email,password} = req.body
    try {

        const { error } = validateAdmin(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin)
            return res.status(401).send({ message: "No Account for this email" });

        const validPassword = await bcrypt.compare(
            req.body.password,
            admin.password
        );
        if (!validPassword)
            return res.status(401).send({ message: "Invalid Email or Password" });


        const token = admin.generateAuthToken();
        res.status(200).send({ adminToken: token, message: "logged in successfully", adminName: admin.name });
    }
    catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
}

const pendingApprovals = async (req,res)=>{
    const allHotels = await Hotel.find({ $and: [{ adminApproval: false },{status:true}]}    )
    res.json(allHotels)
}

const approveHotel = async (req,res)=>{
    const {hotelId} = req.body
    try {
        const chekingHotel = await Hotel.findOneAndUpdate({ _id:hotelId },{adminApproval:true})
        console.log(chekingHotel);
        res.json({message:`Approved hotel ${hotelId}`,hotelId})
    } catch (error) {
        console.log(error);
    }


}

const getUsers = async (req,res)=>{
    const allUsers = await User.find({})
    console.log(allUsers);

    res.json(allUsers)
} 

const blockUser = async (req,res)=>{
    const {userId} = req.body 

    const userToBlock = await User.updateOne({ _id: userId }, { $set: { adminApproval: false } })
    console.log(userToBlock);

    res.json({message:"Blocked user"})
}   

const unBlockUser = async (req,res)=>{
    const { userId } = req.body

    const userToUnBllock = await User.updateOne({ _id: userId }, { $set: { adminApproval: true } })
    console.log(userToUnBllock);

    res.json({ message: "Unblocked user" })

}

const getAllOwners = async (req,res)=>{
        const owners = await Owner.find({})
        res.json(owners)
}


const blockOwner = async (req,res)=>{
    const {ownerId} = req.body
    const ownerToBlock = await Owner.updateOne({ _id: ownerId }, { $set: { verified: false } })
    res.json({ message: "Blocked Owner" })


}
const unBlockOwner = async (req,res)=>{
    const {ownerId} = req.body
    const ownerToBlock = await Owner.updateOne({ _id: ownerId }, { $set: { verified: true } })

    res.json({message:"Unblocked Owner"})
    
}
const blockHotel = async (req,res)=>{
    const {hotelId} = req.body
    console.log(hotelId);
    const ownerToBlock = await Hotel.updateOne({ _id: hotelId }, { $set: { adminApproval: false } })
    console.log(ownerToBlock);

    res.json({message:"Blocked Hotel"})
    
}


const unBlockHotel = async (req,res)=>{
    const {hotelId} = req.body
    const ownerToBlock = await Hotel.updateOne({ _id: hotelId }, { $set: { adminApproval: true } })

    res.json({message:"Unblocked Hotel"})
    
}

const allTheHotels = async (req,res)=>{

    const hotels = await Hotel.find({ status: true }).populate({ path: "ownerId" })

    res.json(hotels)
    
}

const adminDashboardData = async (req,res)=>{

    const hotelCount  = await Hotel.countDocuments({$and:[{status:true}]})
    console.log(hotelCount);

    const roomCount =await Room.countDocuments({ $and: [{ status: true }] })
    console.log(roomCount);

    const usersCount =await User.countDocuments({})
    console.log(usersCount);

    const ownersCount =await Owner.countDocuments({})
    console.log(ownersCount);

    res.json({hotelCount,roomCount,usersCount,ownersCount})
}







module.exports = {
    adminDashboardData,
    unBlockHotel,
    blockHotel,
    allTheHotels,
    unBlockOwner,
    blockOwner,
    getAllOwners,
    blockUser,
    getUsers,
    adminLogIn,
    pendingApprovals,
    approveHotel,
    unBlockUser
}