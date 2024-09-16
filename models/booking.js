const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    guestInfo: {
        name: {
            type: String,
        },
        email: {
            type: String
        },
        phone: {
            type: String,
        }
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    documents: [
        String
    ],
    delivery: {
        type: Boolean,
        default: false
    },
    address: {
        district: { type: String },
        street: { type: String },
        building: { type: String },
        floor: { type: Number }
    },
    chauffeur: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card']
    },
    bookingDate: {
        type: Date,
        default: Date.now,
    },
    confirmation: {
        type: String,
        enum: ['pending', 'confirmed', 'declined'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['Completed', 'Upcoming', 'Ongoing', 'Cancelled'],
        default: 'Upcoming'
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
