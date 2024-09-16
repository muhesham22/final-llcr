const mongoose = require("mongoose");
const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    rentalPrice: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        // required: true
    }],
    type: {
        type: String,
        enum: ['SUV', 'Sedan', 'Sport', 'Luxury', 'Economy','Super']
    },
    transmissionType: {
        type: String,
        enum: ['Manual', 'Automatic']
    },
    powerSystem: {
        type: String,
        enum: ['Conventional', 'Electric', 'Hybrid']
    },
    seats: {
        type: Number,
        required: true
    },
    doors: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Car', carSchema);