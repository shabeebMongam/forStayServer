const express = require("express");
const { adminLogIn, pendingApprovals, approveHotel, getAllOwners, allTheHotels, adminDashboardData, unBlockHotel, blockHotel, blockUser, blockOwner, unBlockOwner, unBlockUser, getUsers } = require("../controllers/adminController");
const { verifyToken } = require("../helpers/tokenVerification/verifyToken");
const router = express.Router();


router.post('/login', adminLogIn)
router.get('/approval',verifyToken, pendingApprovals)
router.get('/users', verifyToken, getUsers)
router.get('/allOwners', verifyToken, getAllOwners)
router.get('/allTheHotels', verifyToken, allTheHotels)
router.post('/approveHotel', approveHotel )
router.post('/blockUser', blockUser )
router.post('/unBlockUser', unBlockUser )
router.post('/blockOwner', blockOwner )
router.post('/unBlockOwner', unBlockOwner )
router.post('/unBlockHotel', unBlockHotel )
router.post('/blockHotel', blockHotel )
router.get('/adminDashboardData', adminDashboardData )



module.exports = router

