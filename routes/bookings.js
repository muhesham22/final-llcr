const express = require('express');
const router = express.Router();

const bookingcontroller = require('../controllers/bookings');
const authing = require('../middlewares/authing');
const { isAdmin } = require('../middlewares/isadmin');
const bookingvalidation = require('../validation/booking');

router.get('/booking/:bookingId', bookingcontroller.getBookingById);

router.get('/viewall', authing, bookingcontroller.getAllBookings);

router.post('/:carId' , authing , bookingvalidation.isBooking(), bookingvalidation.requires() ,bookingcontroller.createBooking)

router.patch('/confirm/:bookingId', authing, isAdmin, bookingcontroller.confirmation);

// router.patch('/status/:bookingId', authing, isAdmin, bookingcontroller.updateBookingStatus);

router.delete('/:bookingId', authing, bookingcontroller.cancelBooking);

module.exports = router;
