const { body } = require('express-validator');

exports.isCar = () => {
    return [
        body('name')
            .isLength({ min: 3, max: 512 }).withMessage('Name must be at least 3 characters long')
            .trim(),
        body('rentalPrice')
            .isNumeric().withMessage('Price must be numeric'),
        body('year')
            .isNumeric().withMessage('Model year must be numeric'),
        body('seats')
            .isNumeric().withMessage('Car seats must be countable'),
        body('doors')
            .isNumeric().withMessage('Car doors must be either 2 or 4'),
        body('brand')
            .isLength({ min: 1, max: 256 }).withMessage('Brand must be 1 value')
            .trim(),
        body('description')
            .isLength({ min: 3, max: 1024 }).withMessage('Description must be at least 3 characters long')
            .trim(),
        body('type')
            .isIn(['SUV', 'Sport', 'Sedan','Luxury', 'Economy','Super']).withMessage('Car type must be SUV | Sport | Sedan | Luxury | Economy | Super'),
        body('transmissionType')
            .isIn(['Manual', 'Automatic']).withMessage('Car transmission type must be manual | automatic'),
        body('powerSystem')
            .isIn(['Conventional', 'Electric', 'Hybrid']).withMessage('Power system must be Conventional(gas) | Electric | Hybrid')
    ];
};

exports.requires = () => {
    return [
        body('name')
            .notEmpty().withMessage('Name is required'),
        body('rentalPrice')
            .notEmpty().withMessage('Price is required'),
        body('brand')
            .notEmpty().withMessage('brand is required'),
        body('description')
            .notEmpty().withMessage('Description is required'),
        body('type')
            .notEmpty().withMessage('type is required'),
        body('seats')
            .notEmpty().withMessage('seats is required'),
        body('doors')
            .notEmpty().withMessage('doors is required'),
        body('year')
            .notEmpty().withMessage('Model year is required'),
        body('transmissionType')
            .notEmpty().withMessage('Transmission type is required'),
        body('powerSystem')
            .notEmpty().withMessage('Power system is required')
    ];
};