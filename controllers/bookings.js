const mongoose = require('mongoose');
const Car = require('../models/car');
const Booking = require('../models/booking');
const User = require('../models/user');
const scheduleBookingEvents = require('../config/scheduler');
const { validationResult } = require('express-validator');

exports.getAllBookings = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        let bookings;
        if (user.role === 'customer') {
            bookings = await Booking.find({ user: userId }).populate('car');
            if (!bookings) {
                res.status(404).json({ message: 'No bookings yet', bookings })
            } else {
                res.status(200).json({ message: 'user bookings retreived', bookings })
            }
        } else {
            bookings = await Booking.find().populate('car');
            res.status(200).json({ message: 'All bookings successfully retrived', bookings });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve Bookings' });
    }
};
// View booking details
exports.getBookingById = async (req, res) => {
    const bookingId = req.params.bookingId;
    try {
        const booking = await Booking.findById(bookingId).populate('car').populate('user');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.status(200).json({ message: 'booking retrieved', booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Booking retreival failed' });
    }
};

exports.createBooking = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.userId; // userId will be null if the user is a guest
        const { carId } = req.params;
        const {
            startDate,
            endDate,
            paymentMethod,
            chauffeur,
            delivery,
            guestInfo, // Expect this in the request body for guests
            address    // Include the address object in the request body
        } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check for overlapping bookings
        const overlappingBookings = await Booking.find({
            car: carId,
            $or: [
                {
                    startDate: { $lt: end },
                    endDate: { $gt: start },
                },
                {
                    startDate: { $lt: end },
                    endDate: { $gte: end },
                },
                {
                    startDate: { $lte: start },
                    endDate: { $gt: start },
                },
            ],
        });

        if (overlappingBookings.length > 0) {
            return res.status(409).json({ message: 'The car is already booked for the selected dates' });
        }

        // Calculate the duration and total cost
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const car = await Car.findById(carId);
        const total = car.rentalPrice * duration;

        // Initialize documents array
        let documents = [];

        // If the user is authenticated, add their license and passport to documents
        if (userId) {
            const user = await User.findById(userId);
            if (user.license.length > 0) {
                documents.push(user.license);
            }
            if (user.passport.length > 0) {
                documents.push(user.passport);
            }
        }

        // Create a new booking, including guest details if userId is null
        const booking = new Booking({
            car: carId,
            user: userId, // This will be null for guests
            startDate,
            endDate,
            total,
            paymentMethod,
            chauffeur,
            delivery,
            address,
            documents, // Add the documents array
            guestInfo: userId ? null : guestInfo // Set guestInfo only if the user is a guest
        });

        // Save the booking
        await booking.save();

        // If the user is authenticated, add the booking to their record
        if (userId) {
            const user = await User.findById(userId);
            user.bookings.push(booking);
            await user.save();
        }
        res.status(201).json({ message: 'Booking completed successfully', booking });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Internal server error', error });
    }
};


// Update a booking
// exports.updateBooking = async (req, res) => {
//     const bookingId = req.params.bookingId;
//     try {
//         const booking = await Booking.findById({ bookingId }).populate('car').populate('user');
//         if (!booking) {
//             res.status(404).json({ message: 'Invalid input booking not found' })
//         }
//         const status = booking.status;
//         const {
//             car,
//             startDate,
//             endDate,
//             paymentMethod } = req.body;
//         if (status === 'Upcoming') {
//             booking.car = car || booking.car;
//             booking.startDate = startDate || booking.startDate;
//             booking.endDate = endDate || booking.endDate;
//             booking.brand = brand || booking.brand;
//             booking.paymentMethod = paymentMethod || booking.paymentMethod;
//         }
//         else {
//             res.json({ message: 'Can not update booking unless its upcoming' })
//         }
//         await booking.save();
//         res.status(200).json({ message: 'booking updated', booking });
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: 'Internal server error' });
//     }
// };
//cancelbooking
exports.cancelBooking = async (req, res) => {
    const bookingId = req.params.bookingId;
    try {
        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(422).json({ error: 'Invalid input' });
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        if (booking.status === 'Upcoming') {
            booking.status = 'Cancelled';
            booking.confirmation = 'declined'
            await booking.save();
            res.json({ message: 'Booking cancelled successfully', booking });
        } else if (booking.status === 'Cancelled') {
            res.json({ message: 'Booking already cancelled' });
        } else {
            res.status(400).json({ message: 'Cannot cancel booking unless it is still upcoming' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};
//update booking status
// exports.updateBookingStatus = async (req, res) => {
//     const bookingId = req.params.bookingId;
//     try {
//         const booking = await Booking.findById(bookingId).populate('car');
//         if (!booking) {
//             return res.status(404).json({ message: 'Booking not found' });
//         }
//         if (booking.confirmation !== 'confirmed') {
//             return res.status(400).json({ message: 'Booking not confirmed' })
//         }
//         if (booking.status === 'Cancelled') {
//             booking.confirmation = 'declined'
//             return res.json({ message: 'Cannot update a cancelled booking' })
//         }
//         booking.status = req.body.status;
//         await booking.save();
//         if (booking.status === 'Upcoming') {
//             schedule.scheduleJob(booking.startDate, async () => {
//                 const updatedBooking = await Booking.findById(booking._id);
//                 if (updatedBooking && updatedBooking.status === 'Upcoming') {
//                     updatedBooking.status = 'Ongoing';
//                     await updatedBooking.save();
//                 }
//             });
//         }
//         if (booking.status === 'Ongoing') {
//             schedule.scheduleJob(booking.endDate, async () => {
//                 const updatedBooking = await Booking.findById(booking._id);
//                 if (updatedBooking && updatedBooking.status === 'Ongoing') {
//                     updatedBooking.status = 'Completed';
//                     await updatedBooking.save();
//                 }
//             });
//         }
//         res.status(200).json({ message: 'Booking status updated successfully', booking });
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: 'Internal server error' });
//     }
// };
//confirm booking
exports.confirmation = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate('car').populate('user');
        const { response } = req.body;

        if (response === 'confirmed' || response === 'declined') {
            if (booking.status === 'Cancelled' && response === 'confirmed') {
                return res.status(400).json({ error: 'Cannot confrim a cancelled booking' })
            }
            booking.confirmation = response;
            if (response === 'declined') {
                booking.status = 'Cancelled';
            }
            res.json({ message: `booking ${response}` })
        }
        else {
            res.status(400).json({ error: 'Bad request' })
        }
        await booking.save();
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Internal server error' });
    }
}