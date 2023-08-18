const { User, validate } = require("../models/userModel");
const bcrypt = require("bcrypt");
const validateUser = require("../helpers/loginValidater/loginValidate");
const jwt = require("jsonwebtoken");
const sendEmail = require('../helpers/verificationMail/nodeMailer')
const Token = require("../models/tokenToVerifyMailModel")
const crypto = require("crypto");
const Hotel = require("../models/hotelOnlyModel");
const Room = require("../models/roomOnlyModel");
const BookingDetails = require("../models/bookingDetailsModel");
const Razorpay = require('razorpay');
const { start } = require("repl");
const Address = require("../models/addressModel");
const { search } = require("../routes/userRoutes");
// const crypto = require('crypto')




const userLogIn = async (req, res) => {
    // const {email,password} = req.body
    try {

        const { error } = validateUser(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(401).send({ message: "No Account for this email" });

           
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!user.adminApproval) {
            return res.send({ logHimOut: true });
        }
        if (!validPassword)
            return res.status(401).send({ message: "Invalid Email or Password" });

        if (!user.verified) {
            let token = await Token.findOne({ userId: user._id });
            if (!token) {
                token = await new Token({
                    userId: user._id,
                   
                    token: crypto.randomBytes(32).toString("hex"),
                }).save();
                const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;
                await sendEmail(user.email, "Verify Email", url);
            }

            return res
                .status(400)
                .send({ message: "An Email sent to your account please verify" });
        }
        

        const token = user.generateAuthToken();
        res.status(200).send({ userToken: token, message: "logged in successfully", userName: user.name });
    }
    catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }


}

const userRegister = async (req, res) => {


    try {
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(409).send({ message: "User with given email already Exist!" });
        }
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);



        user = await new User({ ...req.body, password: hashPassword }).save();

        const token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
        console.log(process.env.BASE_URL);
        const url = `${process.env.BASE_URL}users/${user.id}/verify/${token.token}`;

         const status = await sendEmail(user.email, "Verify Email", url);
console.log(status);
        res.status(201).send({ message: "An Email sent to your account please verify" });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }

}

const verifyUserEmail = async (req, res) => {
    console.log("reached");
    try {
        const user = await User.findOne({ _id: req.params.id });
        if (!user) return res.status(400).send({ message: "Invalid link" });

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        console.log("dasdas");
        if (!token) return res.status(400).send({ message: "Invalid link" });

        console.log("dsadasd");
        const newVerified = await User.updateOne({ _id: user._id }, { $set: { verified: true } })
        console.log(newVerified);
        await token.remove();

        res.status(200).send({ message: "Email verified successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
}

const getHotels = async (req, res) => {

    try {

        const {searchData} = req.body

        if(searchData ){

            const hotelsAt = await Hotel.find({
                $and: [
                    { adminApproval: true }, { status: true }, {
                        $or: [
                            { city: new RegExp(searchData, "i") },
                            { district: new RegExp(searchData, "i") }
                        ]
                    }
                ]
            })
                console.log(hotelsAt);
            return res.json(hotelsAt)
        }



        const allHotels = await Hotel.find({
            $and: [
                { adminApproval: true }, { status: true }
            ]
        })
        res.json(allHotels)
    } catch (error) {
        console.log(error);
    }
}

const getHotelData = async (req, res) => {  
    try {
        const hotelId = req.params.hotelId;
        console.log(hotelId);

        const hotel = await Hotel.findOne({ _id: hotelId }).populate({ path: "rooms" })

        console.log(hotel);

        // hotel.populate("rooms").then((roomsData)=> console.log(roomsData)).catch(err=>console.log(err))


        res.json(hotel)
    } catch (error) {
        console.log(error);
    }
}

const getRoomData = async (req, res) => {
    try {
        const hotelId = req.params.hotelId;
        const roomId = req.params.roomId;

        console.log(req.params);


        const hotel = await Hotel.findOne({ _id: hotelId })
        const room = await Room.findOne({ _id: roomId })


        const reservedDates = room.reservedDates
        console.log(reservedDates);
        // console.log(new Date(reservedDates[0]));
        res.json({ hotel, room })


    } catch (error) {
        console.log(error);
    }

}


const informOwnerBooking = async (req, res) => {
    // console.log(req.body);
    const { values, roomId, hotelId, Id: userId, startDate, endDate } = req.body
    console.log("here");
    console.log(values);

    const toGetOwnerId = await  Hotel.findOne({_id:hotelId})
    const ownerId = toGetOwnerId.ownerId



    if (values.saveAddress) {

        const addingAddress = new Address({
            userId,
            name: values.name,
            email: values.email,
            address: values.address,
            city: values.city,
            state: values.state,
            zipcode: values.zipcode
        })

        const afterSaving = await addingAddress.save()

        const saveTheAddressInUser = await User.updateOne({ _id: userId }, { $push: { address: afterSaving._id } })
    }


    console.log("dsaddasdasda");

    const bookingData = new BookingDetails({
        ownerId,
        hotelId,
        roomId,
        startDate,
        endDate,
        userId,

        name: values.name,
        email: values.email,
        address: values.address,
        city: values.city,
        state: values.state,
        zipcode: values.zipcode
    })

    bookingData.save().then((data) => {
        console.log(data);
        res.json({ message: "Queued your Booking" })
    })

}

const getBookings = async (req, res) => {
    console.log("yeas");
    // console.log(req.body);
    const { Id: userId } = req.body;

    const bookingData = await BookingDetails.find({ userId }).populate("roomId").populate("hotelId").sort({_id:-1})
    const bookingDataPaymentPending = await BookingDetails.find({ $and: [{ userId }, { paymentStatus: false }, { status: true }] }).populate("roomId").populate("hotelId").sort({_id:-1})
    const bookingDataApprovalPending = await BookingDetails.find({ $and: [{ userId }, { paymentStatus: false }, { status: false }] }).populate("roomId").populate("hotelId").sort({_id:-1})
    // const bookingDataExperienced = await BookingDetails.find({ $and: [{ userId  },{paymentStatus:true},{status:true}]}).populate("roomId")
    // const bookingDataUpcoming = await BookingDetails.find({ $and: [{ userId  },{paymentStatus:false},{status:false}]}).populate("roomId")
    // console.log(bookingData);


    const notDeletedBookingData = bookingData.filter((data) => {
        return (
            data.hotelId.status && data.roomId.status
        )
    })
    const notDeletedBookingDataPaymentPending = bookingDataPaymentPending.filter((data) => {
        return (
            data.hotelId.status && data.roomId.status
        )
    })
    const notDeletedBookingDataApprovalPending = bookingDataApprovalPending.filter((data) => {
        return (
            data.hotelId.status && data.roomId.status
        )
    })

    console.log(notDeletedBookingDataApprovalPending);



    // res.json(bookingDataPaymentPending)
    res.json({ bookingData: notDeletedBookingData, bookingDataApprovalPending: notDeletedBookingDataPaymentPending, bookingDataPaymentPending: notDeletedBookingDataApprovalPending })
}




const getUserData = async (req, res) => {
    console.log(req.body);
    const { Id: userId } = req.body

    const userData = await User.findOne({ _id: userId })
    console.log(userData);

    res.json(userData)
}





// const getRoomData = await (req,res)=>{
//     try {
//         const hotelId = req.params.hotelId;
//         const roomId = req.params.roomId;


//         const hotel=await Hotel.findOne({_id:hotelId})
//         const room=await Room.findOne({_id:hotelId})



//         res.json("yes")



//     } catch (error) {

//     }
// }





const forOrders = (req, res) => {
    try {
        const { price,roomId,orderId } = req.body
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        })
        const options = {
            amount: parseInt(price * 100),
            currency: "INR",
            receipt: crypto.randomBytes(10).toString("hex")
        }
        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: "Something wrong one" })
            }
            res.status(200).json({ data: order, orderId,roomId })
        })
        // console.log("dsadada");

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}



const toVerify = (req, res) => {
    try {
        const razorpay_order_id = req.body.response.razorpay_order_id
        const razorpay_payment_id = req.body.response.razorpay_payment_id
        const razorpay_signature = req.body.response.razorpay_signature

        const sign = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign.toString()).digest("hex")



        if (razorpay_signature === expectedSign) {
            return res.status(200).json({ successMessage: "Payment verified Successfully" })
        } else {
            return res.status(400).json({ message: "Invalid signature" })
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

let testData = 0

const addReservedDate = async (req, res) => {
    try {
        const { orderId, roomId } = req.body
        console.log(orderId,roomId);


        const orderDetails = await BookingDetails.findOne({ _id: orderId })
        // const roomDetails = await Room.findOne({ _id: roomId })

        if (orderDetails) {

            const startDate = orderDetails.startDate
            const endDate = orderDetails.endDate

            function getDatesInRange(startDate, endDate) {
                const date = new Date(startDate.getTime());

                const dates = [];

                while (date <= endDate) {
                    dates.push(new Date(date));
                    date.setDate(date.getDate() + 1);
                }

                return dates;


            }

            const bookedDate = getDatesInRange(startDate, endDate)

            console.log(bookedDate);

            const addDateToRoom = await Room.updateOne({ _id: roomId },{$push:{reservedDates:{$each:[...bookedDate]}}})

            // bookedDate.map((date) => roomDetails.reservedDates.push(date))

            console.log(addDateToRoom);

            testData++

            console.log(testData);

            orderDetails.paymentStatus = true
            orderDetails.save().catch((err) => console.log(err))

            res.json("added date")
        }


        // console.log(startDate,endDate);


        // if (roomDetails?.reservedDates.length > 0) {
        //     bookedDate.forEach((date) => roomDetails.reservedDates.push(date))
        //     console.log("dsds");
        // } else {
        //     roomDetails.reservedDates = bookedDate
        //     console.log("here");
        // }


        // roomDetails.save().then((data) => {
        //     orderDetails.paymentStatus = true
        //     orderDetails.save().catch((err) => console.log(err))
        //     console.log(data);
        // }).catch((err) => {
        //     console.log(err);
        // })


    } catch (error) {
        console.log(error);
    }
}

const placeSearch = async (req, res) => {


    // console.log(req.body);
    const { placeSearch } = req.body

    const startDate = req.body.dates.startDate
    const endDate = req.body.dates.endDate

    console.log(startDate, endDate);
    console.log(placeSearch);

    const cityOrDist = await Hotel.find({
        $or: [{ city: new RegExp(placeSearch, "i") },
        { district: new RegExp(placeSearch, "i") }]

    })

    // res.json(cityOrDist)

}

const hotelByDistrict = async (req, res) => {
    const { district } = req.params
    console.log(district);
    const hotels = await Hotel.find({ $and: [{ district: new RegExp(district, "i") }, { adminApproval: true }, { status: true }] })

    res.json(hotels)
}

const getAddress = async (req, res) => {
    console.log(req.body);
    const { Id } = req.body

    const allAddress = await User.find({ _id: Id }).populate("address")
    console.log(allAddress[0].address);
    res.json(allAddress[0].address)
}

const hotelDistWithCount = async (req, res) => {
    console.log(req.body);


}






module.exports = {
    hotelDistWithCount,
    getAddress,
    hotelByDistrict,
    forOrders,
    userLogIn,
    userRegister,
    verifyUserEmail,
    getHotels,
    getHotelData,
    getBookings,
    getRoomData,
    informOwnerBooking,
    getUserData,
    toVerify,
    addReservedDate,
    placeSearch
}