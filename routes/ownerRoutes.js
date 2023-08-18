const express = require("express");
const { ownerLogIn, ownerRegister, allRooms, dashboardData, allBookings,bookingByMonths, receivedBookingDetails, editRoomDetails, deleteRoom, approveRoom, deleteHotel, bookingPendings, allHotels, addHotel, addRoom, getOwnerData, getEditHotel, deleteHotelImg, postEditHotel } = require("../controllers/ownerController");
const { verifyToken } = require("../helpers/tokenVerification/verifyToken");
const { verifyTokenForOwner } = require("../helpers/tokenVerification/verifyTokenForOwner");
const router = express.Router();


// router.get('/', userLogIn)
router.post('/login', ownerLogIn)
router.post('/register', ownerRegister)
router.post('/addHotel', verifyTokenForOwner , addHotel)
router.get('/getOwnerData', verifyTokenForOwner, getOwnerData)
router.get('/bookingByMonths', verifyTokenForOwner, bookingByMonths)
router.get('/getMyHotels', verifyTokenForOwner, allHotels)
router.get('/getRoomData/:hotelId', verifyTokenForOwner, allRooms)
router.post('/addRoom/:hotelId', verifyTokenForOwner, addRoom)
router.get('/editHotel/:hotelId', verifyTokenForOwner,getEditHotel )
router.get('/editRoomDetails/:roomId', verifyTokenForOwner, editRoomDetails )
router.get('/bookingPendings', verifyTokenForOwner, bookingPendings )
router.post('/editHotel/:hotelId', verifyTokenForOwner,postEditHotel )
router.post('/deleteHotel/:hotelId', verifyTokenForOwner,deleteHotel )
router.post('/deleteHotelImg', verifyTokenForOwner,deleteHotelImg )
router.post('/approveRoom', verifyTokenForOwner,approveRoom )
router.post('/deleteRoom/:roomId', verifyTokenForOwner, deleteRoom )
router.get('/receivedBookingDetails/:bookedId', verifyTokenForOwner,receivedBookingDetails )
router.get('/dashboardData', verifyTokenForOwner, dashboardData )
router.get('/allBookings', verifyTokenForOwner , allBookings )



module.exports = router

