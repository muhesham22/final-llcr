const mongoose = require('mongoose');
const Car = require('../models/car');
const { validationResult } = require('express-validator');
const Booking = require('../models/booking');

exports.PostCar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // if (!req.files || req.files.length === 0) {
    //     return res.status(422).json({ error: 'Image is required' });
    // }
    try {
        const {
            name,
            year,
            brand,
            type,
            rentalPrice,
            description,
            transmissionType,
            powerSystem,
            seats,
            doors
        } = req.body;

        const images = req.files.map(file => file.path.replace('\\', "/"));
        const car = new Car({
            images,
            name,
            year,
            brand,
            type,
            rentalPrice,
            description,
            transmissionType,
            powerSystem,
            seats,
            doors
        });
        await car.save();
        res.status(201).json({ message: 'product created successfully', car });
    } catch (error) {
        console.error(error);;
        res.status(400).json({ message: 'Internal server error' });
    }
};

//Retrieve all cars 
exports.getAllCars = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: errors.array()[0].msg });
        }
        const cars = await Car.find({});
        res.status(200).json({ message: 'Cars Inventory Retrieved', cars });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//Retreiving a single car 
exports.getCarById = async (req, res) => {
    const carId = req.params.carId
    try {
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: 'Car could not be found' });
        }
        const bookings = await Booking.find({ car });
        // let bookings ;
        // if (bookings.car === car) {

        // }
        res.status(200).json({ message: 'Car retrieved successfully', car, bookings });
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};

//Updating an existing car
exports.updateCar = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const carId = req.params.carId;
        if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(422).json({ error: 'Invalid iput' });
        }
        const {
            name,
            doors,
            brand,
            type,
            rentalPrice,
            description,
            transmissionType,
            powerSystem,
            seats,
            year
        } = req.body;
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: 'Car could not be found' });
        }
        car.name = name || car.name;
        car.doors = doors || car.doors;
        car.rentalPrice = rentalPrice || car.rentalPrice;
        car.description = description || car.description;
        car.year = year || car.year;
        car.brand = brand || car.brand;
        car.type = type || car.type;
        car.transmissionType = transmissionType || car.transmissionType;
        car.powerSystem = powerSystem || car.powerSystem;
        car.seats = seats || car.seats;
        await car.save();
        res.json({ message: 'car updated successfully', car });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update car' });
    }
};

//delete car
exports.deleteCar = async (req, res, next) => {
    try {
        const carId = req.params.carId;
        if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
            return res.status(422).json({ error: 'invalid input' });
        }
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ error: 'car not found' });
        }
        await Car.findByIdAndDelete(carId);
        res.json({ message: 'car deleted successfully', car });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete car' });
    }
};

exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword;

        // If keyword is empty, return an empty array
        if (!keyword.trim()) {
            return res.json({ message: 'No cars found', keyword, cars: [] });
        }

        // Initialize search conditions array
        const searchConditions = [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { brand: { $regex: keyword, $options: 'i' } },
            { type: { $regex: keyword, $options: 'i' } },
            { transmissionType: { $regex: keyword, $options: 'i' } },
            { powerSystem: { $regex: keyword, $options: 'i' } }
        ];

        // Check if keyword is a valid number
        if (!isNaN(keyword)) {
            const numberKeyword = Number(keyword);
            searchConditions.push(
                { year: numberKeyword },
                { seats: numberKeyword },
                { rentalPrice: numberKeyword },
                { doors: numberKeyword }
            );
        }

        const results = await Car.find({
            $or: searchConditions,
        });

        if (results.length === 0) {
            return res.json({ message: 'No cars found', keyword, cars: [] });
        }

        res.json({ message: 'Cars fetched successfully', keyword, cars: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.filter = async (req, res) => {
    try {
        const filterConditions = [];
        const {
            name,
            brand,
            type,
            transmissionType,
            powerSystem,
            year,
            rentalPrice,
            seats,
            doors,
            startDate,
            endDate
        } = req.query;

        // Convert startDate and endDate to Date objects
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        console.log('Start Date:', start);
        console.log('End Date:', end);


        // Build the filter conditions based on query parameters
        if (name) {
            filterConditions.push({ name: { $regex: name, $options: 'i' } });
        }
        if (brand) {
            filterConditions.push({ brand: { $regex: brand, $options: 'i' } });
        }
        if (type) {
            filterConditions.push({ type: { $regex: type, $options: 'i' } });
        }
        if (transmissionType) {
            filterConditions.push({ transmissionType: { $regex: transmissionType, $options: 'i' } });
        }
        if (powerSystem) {
            filterConditions.push({ powerSystem: { $regex: powerSystem, $options: 'i' } });
        }
        if (year && Number.isInteger(parseInt(year))) {
            filterConditions.push({ year: parseInt(year) });
        }
        if (rentalPrice && Number.isInteger(parseInt(rentalPrice))) {
            filterConditions.push({ rentalPrice: parseInt(rentalPrice) });
        }
        if (seats && Number.isInteger(parseInt(seats))) {
            filterConditions.push({ seats: parseInt(seats) });
        }
        if (doors && Number.isInteger(parseInt(doors))) {
            filterConditions.push({ doors: parseInt(doors) });
        }

        // Find cars that are booked during the specified date range
        let bookedCars = [];
        if (start && end) {
            bookedCars = await Booking.find({
                car: { $exists: true },
                $or: [
                    { startDate: { $lt: end }, endDate: { $gt: start } },
                    { startDate: { $lt: end }, endDate: { $gte: end } },
                    { startDate: { $lte: start }, endDate: { $gt: start } }
                ]
            }).select('car');
        }
        

        const bookedCarIds = bookedCars.map(booking => booking.car);

        // Exclude booked cars from the filter conditions
        if (bookedCarIds.length > 0) {
            filterConditions.push({ _id: { $nin: bookedCarIds } });
        }

        if (filterConditions.length === 0) {

            console.log('Filter Conditions:', filterConditions);
            return res.json({ message: 'No cars found', cars: [] });
        }

        const results = await Car.find({
            $and: filterConditions,
        });


        if (results.length === 0) {
            return res.json({ message: 'No cars found', cars: [] });
        }


        res.json({ message: 'Cars fetched successfully', cars: results, filterConditions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
