const express = require("express");
const { userLogIn, userRegister, toVerify, placeSearch, hotelDistWithCount, getAddress, hotelByDistrict, addReservedDate, forOrders, verifyUserEmail, getUserData, getBookings, getHotels, getHotelData, informOwnerBooking, getRoomData } = require("../controllers/userController");
const { verifyToken} = require("../helpers/tokenVerification/verifyToken");
const { verifyTokenForUser } = require("../helpers/tokenVerification/verifyTokenForUser");
const router = express.Router();


// router.get('/', userLogIn)
router.post('/login', userLogIn)
router.post('/register', userRegister)
router.get('/users/:id/verify/:token', verifyUserEmail)
router.post('/getHotels',  getHotels)
router.get('/myBookings', verifyTokenForUser, getBookings)
router.get('/getHotelData/:hotelId', getHotelData)
router.get('/getRoomData/:hotelId/:roomId', getRoomData)
router.get('/userData', verifyTokenForUser, getUserData)
router.post('/informOwnerBooking', verifyTokenForUser, informOwnerBooking)
router.post('/serachPlace', verifyTokenForUser, placeSearch)
router.get('/hotelByDistrict/:district', verifyTokenForUser, hotelByDistrict)
router.get('/address', verifyTokenForUser, getAddress)
router.get('/hotelDistWithCount', verifyTokenForUser, hotelDistWithCount)

router.post("/orders", verifyTokenForUser,forOrders)
router.post("/verify", verifyTokenForUser,toVerify)
router.post("/addReservedDate", verifyTokenForUser, addReservedDate)



module.exports = router

