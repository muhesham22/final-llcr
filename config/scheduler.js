const cron = require('node-cron');
const Booking = require('../models/booking');

const updateBookingStatuses = async () => {
    try {
        const now = new Date();

        // Update 'Upcoming' bookings to 'Ongoing' if their start date has arrived and they are confirmed
        const ongoingBookings = await Booking.updateMany(
            {
                status: 'Upcoming',
                startDate: { $lte: now },
                confirmation: 'confirmed', // Only update if confirmed
                status: { $ne: 'Cancelled' } // Skip if cancelled
            },
            { $set: { status: 'Ongoing' } }
        );

        // Update 'Ongoing' bookings to 'Completed' if their end date has passed
        const completedBookings = await Booking.updateMany(
            {
                status: 'Ongoing',
                endDate: { $lte: now },
                status: { $ne: 'Cancelled' } // Skip if cancelled
            },
            { $set: { status: 'Completed' } }
        );

        console.log(`${ongoingBookings.modifiedCount} bookings set to 'Ongoing'`);
        console.log(`${completedBookings.modifiedCount} bookings set to 'Completed'`);
    } catch (error) {
        console.error('Error updating booking statuses:', error);
    }
};

// Schedule the job to run every hour
const startScheduler = () => {
    // This cron expression means "run at the start of every hour"
    cron.schedule('* * * * *', updateBookingStatuses); // Adjust interval as needed
};

module.exports = startScheduler;
