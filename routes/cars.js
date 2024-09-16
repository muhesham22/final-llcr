const express = require('express');
const router = express.Router();

const carscontroller = require('../controllers/cars');
const authing = require('../middlewares/authing');
const { isAdmin } = require('../middlewares/isadmin');
const carvalidation = require('../validation/car');

router.get('/viewall', carscontroller.getAllCars)

router.get('/filter',carscontroller.filter)

router.get('/:carId', carscontroller.getCarById)

router.post('/', authing, isAdmin, carvalidation.requires(), carvalidation.isCar(), carscontroller.PostCar);

router.patch('/:carId', authing, isAdmin, carvalidation.requires(), carscontroller.updateCar);

router.delete('/:carId', authing, isAdmin, carscontroller.deleteCar);

router.get('/',carscontroller.search)


module.exports = router;
