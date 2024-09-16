const mongoose = require("mongoose");
const bookingSchema = require("../models/booking").schema;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer'
    },
    passport: [
        String
    ],
    license: [
        String
    ],
    bookings: [bookingSchema] // Correctly reference the bookingSchema
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);
