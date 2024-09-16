const { body, validationResult } = require('express-validator');

exports.isBooking = () => {
    return [
        body('startDate')
            .isISO8601().withMessage('Start date must be a valid date')
            .toDate()
            .custom((startDate, { req }) => {
                const today = new Date();
                const maxBookingDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 365);
                // if (startDate < today) {
                //     throw new Error('Start date cannot be in the past');
                // }
                if (startDate > maxBookingDate) {
                    throw new Error('Start date cannot be more than 1 year in the future');
                }
                return true;
            }),
        body('endDate')
            .isISO8601().withMessage('End date must be a valid date')
            .toDate()
            .custom((endDate, { req }) => {
                const startDate = new Date(req.body.startDate);
                if (endDate < startDate) {
                    throw new Error('End date cannot be before the start date');
                }
                return true;
            }),
        body('paymentMethod')
            .isIn(['cash', 'card']).withMessage('Payment method must be either "cash" or "card"'),

        // Additional validation for guest users
        body('guestInfo')
            .if((value, { req }) => !req.userId) // Only validate guestInfo if userId is null
            .exists().withMessage('Guest info is required for guests')
            .bail() // Stop further validation if this fails
            .custom(value => {
                if (!value.name || !value.email || !value.phone) {
                    throw new Error('Guest information (name, email, phone) is required for guest bookings');
                }
                return true;
            })
    ];
};

exports.requires = () => {
    return [
        body('startDate')
            .notEmpty().withMessage('Start date is required'),
        body('endDate')
            .notEmpty().withMessage('End date is required'),
        body('paymentMethod')
            .notEmpty().withMessage('Payment method is required')
    ];
};
