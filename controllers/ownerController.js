const { Owner, validate } = require("../models/ownerModel");
const bcrypt = require("bcrypt");
const validateOwner = require("../helpers/loginValidater/loginValidate");
const jwt = require("jsonwebtoken");
const Hotel = require("../models/hotelOnlyModel");
const Room = require("../models/roomOnlyModel");
// const Owner = require("../models/ownerModel");
const { User } = require("../models/userModel");
var mongoose = require('mongoose');
const BookingDetails = require("../models/bookingDetailsModel");





const ownerLogIn = async (req, res) => {
    // const {email,password} = req.body
    try {

        const { error } = validateOwner(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const owner = await Owner.findOne({ email: req.body.email });
        if (!owner)
            return res.status(401).send({ message: "No Account for this email" });

        const validPassword = await bcrypt.compare(
            req.body.password,
            owner.password
        );
        if (!owner.verified) {
            return res.send({ logHimOut: true });
        }
        if (!validPassword)
            return res.status(401).send({ message: "Invalid Email or Password" });


        const token = owner.generateAuthToken();
        res.status(200).send({ ownerToken: token, message: "logged in successfully", ownerName: owner.name, ownerId: owner._id });
    }
    catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }


}

const ownerRegister = async (req, res) => {
    // const {name,email,password} = req.body
    // res.status(200).json("Reached Register")
    // console.log(name,email,password);

    console.log("here");
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        let owner = await Owner.findOne({ email: req.body.email });
        if (owner)
            return res
                .status(409)
                .send({ message: "Owner with given email already Exist!" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        owner = await new Owner({ ...req.body, password: hashPassword }).save();

        res
            .status(201)
            .send({ message: "New account created" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }

}


const addHotel = async (req, res) => {

    console.log(req.body);

    const { hotelName, city, contact, pincode, district, description, imageUrls, Id: ownerId } = req.body

    console.log(ownerId);
    // const {}
    // const checkOwnerExist = await Hotel.find({ ownerId })

    const newHotel = new Hotel({
        ownerId: ownerId,

        name: hotelName,
        city: city,
        contact: contact,
        pincode: pincode,
        district: district,
        description: description,
        images: imageUrls

    })

    newHotel.save((err, data) => {
        if (err) {
            console.log(err);
        }
        // console.log(data);
        res.json("Added new hotel")
    })

}

const allHotels = async (req, res) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 5;
    console.log(page);
    console.log(req.body);
    const ownerId = req.body.Id
    const myHotels = await Hotel.find({
        $and: [
            { ownerId }, { status: true }
        ]
    }).skip(page * limit).limit(limit)

    const total = await Hotel.countDocuments({
        $and: [
            { ownerId }, { status: true }
        ]
    })



    res.json({
        total,
        page: page + 1,
        limit,
        myHotels
    })
}

const addRoom = async (req, res) => {

    const { roomNumber, totalCapacity, description, imageUrls, roomType, price } = req.body
    const ownerId = req.body.Id
    const hotelId = req.params.hotelId
    const aminities = req.body.aminities

    const aminityValues = aminities.map((data) => {
        return (
            data.value
        )
    })
    console.log(aminityValues);



    const newRoom = new Room({
        ownerId: ownerId,
        hotelId: hotelId,

        roomNumber: roomNumber,
        totalCapacity: totalCapacity,
        roomType: roomType,
        aminities: aminityValues,
        description: description,
        images: imageUrls,
        price: price

    })

    const theNewRoomId = await newRoom.save(async (err, data) => {
        if (err) {
            console.log(err);
        }
        console.log(data._id);
        console.log(hotelId);

        const addingRoomId = await Hotel.updateOne({ _id: hotelId }, { $push: { "rooms": data._id } })
        console.log(addingRoomId);
        res.json("Added new Room")
    })



}

const getEditHotel = async (req, res) => {

    const ownerId = req.body.Id
    const hotelId = req.params.hotelId

    // console.log(req.body.Id);
    // console.log(req.params);

    const theHotelToEdit = await Hotel.find({
        $and: [
            { _id: hotelId }, { ownerId: ownerId }
        ]
    })

    console.log(theHotelToEdit);



    res.json(theHotelToEdit)
}

const postEditHotel = async (req, res) => {
    console.log(req.body);
    const hotelId = req.params.hotelId

    // const {hotelName,city,contact,pincode,district,description,imageUrls} = req.body

    // const updatedHotel = await Hotel.updateOne({_id:hotelId},{ hotelName, city, contact, pincode, district, description, imageUrls})

    // console.log(updatedHotel);

    const { hotelName, city, contact, pincode, district, description, imageUrls } = req.body


    const updatedHotel = await Hotel.findOne({ _id: hotelId })

    console.log("Before");
    console.log(updatedHotel);

    updatedHotel.hotelName = hotelName
    updatedHotel.city = city
    updatedHotel.contact = contact
    updatedHotel.district = district
    updatedHotel.description = description
    imageUrls.forEach((img) => {
        updatedHotel.images.push(img)
    })

    console.log("After");
    console.log(updatedHotel);





    updatedHotel.save().then((data) => {
        console.log(data);
    }).catch((err) => {
        console.log(err);
    })

    // console.log(updatedHotel);

    res.json("Reached Here")












    // res.json("Reached")
}

const deleteHotel = async (req, res) => {
    const hotelId = req.params.hotelId
    console.log(hotelId);

    const hotelToDelete = await Hotel.findOne({ _id: hotelId })

    console.log("Before");
    console.log(hotelToDelete);

    hotelToDelete.status = false

    hotelToDelete.save().then((data) => {
        console.log(data);
    }).catch((err) => {
        console.log(err);
    })

    console.log("After");
    console.log(hotelToDelete);

    res.json({ message: "Deleted Hotel", hotelId })
}




const allRooms = async (req, res) => {
    const hotelId = req.params.hotelId
    console.log(hotelId);


    const rooms = await Room.find({ $and: [{ hotelId: hotelId }, { status: true }] })
    const hotel = await Hotel.find({ $and: [{ _id: hotelId }, { status: true }] })

    const hotelDetailes = hotel[0]

    res.json({ rooms, hotelDetailes })
}

const getOwnerData = async (req, res) => {
    console.log("reached");

    const ownerId = req.body.Id
    console.log(ownerId);
    const hotel = await Hotel.find({ $and: [{ ownerId }, { status: true }] })
    const hotelCount = hotel.length

    console.log(hotel);


    const ownerData = await Owner.findById({ _id: ownerId })

    res.json({ ownerData, hotelCount })
}

const deleteHotelImg = async (req, res) => {
    const { hotelId, hotelImg } = req.body

    // const hotel = await Hotel.find({$and:[{_id:hotelId},{images:hotelImg}]})
    const hotel = await Hotel.updateOne({ _id: hotelId }, { $pull: { 'images': hotelImg } })

    const hotelImgs = await Hotel.findOne({ _id: hotelId })
    // console.log("One");
    // console.log(hotelImgs.images);

    // console.log(hotelId);

    // update({ _id: ObjectId("5e8ca845ef4dcbee04fbbc11") },
    // ...    { $pull: { 'software.services': "yahoo" } }

    res.json(hotelImgs.images)
}

const bookingPendings = async (req, res) => {

    const { Id: ownerId } = req.body

    const pendingBookings = await BookingDetails.find({
        $and: [
            { ownerId }, { status: false }
        ]
    }).populate('hotelId').populate('roomId')

    console.log(pendingBookings);

    res.json(pendingBookings)
}

const approveRoom = async (req, res) => {
    // console.log(req.body);

    const { dataId, Id: ownerId } = req.body

    const approveThis = await BookingDetails.findOne({ _id: dataId }).populate("hotelId").populate("roomId")
    console.log(approveThis);
    const hotelStatus = approveThis.hotelId.status
    const roomStatus = approveThis.roomId.status

    console.log(hotelStatus, roomStatus);

    if (hotelStatus && roomStatus) {
        approveThis.status = true

        approveThis.save().then((data) => {
            console.log(data);

            res.json({ message: "Room Approved" })
        }).catch((err) => {
            console.log(err);
        })

    } else {
        
                return res.json({ message: "Sorry this Room Or Hotel dont exist" , deletedItem:true})
    }





}

const receivedBookingDetails = async (req, res) => {

    const { bookedId } = req.params

    const bookedDetails = await BookingDetails.find({ _id: bookedId }).populate('hotelId').populate('roomId')
    console.log(bookedDetails);

    const hotelStatus = bookedDetails[0].hotelId.status
    const roomStatus = bookedDetails[0].roomId.status

    if(hotelStatus && roomStatus){

        return res.json(bookedDetails)
    }else{
        return res.json({ message: "Sorry this Room Or Hotel dont exist" , deletedItem:true})
    }

    console.log(bookedDetails);

}

const deleteRoom = async (req, res) => {

    const roomId = req.params.roomId
    console.log(roomId);
    console.log("Ethi");

    const roomToDelete = await Room.findOne({ _id: roomId })

    console.log("Before");
    console.log(roomToDelete);

    roomToDelete.status = false

    roomToDelete.save().then((data) => {
        console.log(data);
    }).catch((err) => {
        console.log(err);
    })

    console.log("After");
    console.log(roomToDelete);

    res.json({ message: "Deleted Room", roomId })
}

const editRoomDetails = async (req, res) => {

    const ownerId = req.body.Id
    const hotelId = req.params.roomId


    const theRoomToEdit = await Room.find({
        $and: [
            { _id: hotelId }, { ownerId: ownerId }
        ]
    })

    console.log(theRoomToEdit);



    res.json(theRoomToEdit)
}


const dashboardData = async (req, res) => {
    // console.log(req.body);
    const { Id } = req.body
    console.log(Id);

    const hotelCount = await Hotel.countDocuments({ $and: [{ ownerId: Id }, { status: true }] })

    console.log(hotelCount);
    res.json(hotelCount)


}

const allBookings = async (req, res) => {
    const { Id } = req.body

    const allBookings = await BookingDetails.find({ ownerId: Id }).populate("hotelId").populate("roomId")

    res.json(allBookings)
}

const bookingByMonths = async(req,res)=>{
    console.log("By months");

    const byMonths = await BookingDetails.aggregate(
        [
          {
            $group: {
              _id: {
                month: { $month: '$startDate' }
              },
              count: { $sum: 1 }
            }
          }
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      );

      let byMonth = [{ name: 'January', bookingCount: 0 }, { name: 'February', bookingCount: 0 }, { name: 'March', bookingCount: 0 }, { name: 'April', bookingCount:0  }, { name: 'May', bookingCount: 0 }, { name: 'June', bookingCount: 0 }, { name: 'July', bookingCount: 0 }, { name: 'August', bookingCount: 0 }, { name: 'September', bookingCount: 0 }, { name: 'October', bookingCount: 0 }, { name: 'November', bookingCount: 0 }, { name: 'December', bookingCount: 0 }]

      byMonths.forEach(data=>{
          let month = data._id.month
          let count = data.count
          let name 

          switch (month) {
            case 1:
                name = 'January'
                break;
            case 2:
                name = 'February'
                break;
            case 3:
                name = 'March'
                break;
            case 4:
                name = 'April'
                break;
            case 5:
                name = 'May'
                break;
            case 6:
                name = 'June'
                break;
            case 7:
                name = 'July'
                break;
            case 8:
                name = 'August'
                break;
            case 9:
                name = 'September'
                break;
            case 10:
                name = 'October'
                break;
            case 11:
                name = 'November'
                break;
            case 12:
                name = 'December'
                break;
          
            default:
                break;
          }

        byMonth.forEach(data=>{
            if(data.name === name){
                data.bookingCount = count
            }
        })
        //   byMonth.push({name:name, bookingCount:count})

        })
        // console.log(byMonth);


    res.json(byMonth)
}









module.exports = {
    bookingByMonths,
    allBookings,
    dashboardData,
    editRoomDetails,
    deleteRoom,
    ownerLogIn,
    receivedBookingDetails,
    deleteHotelImg,
    addHotel,
    ownerRegister,
    allHotels,
    addRoom,
    getOwnerData,
    getEditHotel,
    deleteHotel,
    postEditHotel,
    allRooms,
    bookingPendings,
    approveRoom
}