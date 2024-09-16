const User = require('../models/user');
const Booking = require('../models/booking');
const mongoose = require('mongoose');

exports.patchDocs = async (req, res) => {
    try {
        const userId = req.userId;
        const { type, bookingId } = req.query;
        const files = req.files.map(file => file.path.replace("\\", "/"));

        if (files.length < 1) {
            return res.status(400).json({ error: 'No documents uploaded' });
        }

        console.log('User ID:', userId); // Debugging
        console.log('Booking ID:', bookingId); // Debugging

        if (userId) { // If user is authenticated
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (type === 'profile') {
                user.image = files[0]; // Save profile image
                await user.save();
                return res.json({ message: 'Profile image uploaded successfully' });
            } else if (type === 'passport') {
                user.passport = [...(user.passport || []), ...files]; // Append files to user passport
                await user.save();
                return res.json({ message: 'Passport documents uploaded successfully' });
            } else if (type === 'license') {
                user.license = [...(user.license || []), ...files]; // Append files to user license
                await user.save();
                return res.json({ message: 'License documents uploaded successfully' });
            } else {
                return res.status(400).json({ error: 'Invalid document type' });
            }
        } else { // If user is not authenticated (guest)
            if (!bookingId) {
                return res.status(400).json({ error: 'Booking ID is required for guests' });
            }

            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({ error: 'Booking not found' });
            }

            if (type === 'passport' || type === 'license') {
                booking.documents.push(...files); // Add files to booking documents
                await booking.save();
                return res.json({ message: 'Documents uploaded successfully' });
            } else {
                return res.status(400).json({ error: 'Invalid document type for guest' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteDocs = async (req, res) => {
    try {
        const userId = req.userId;
        const { type, bookingId, docPath } = req.query; // docPath is the path to the document to be removed

        if (!docPath) {
            return res.status(400).json({ error: 'Document path is required to remove a document' });
        }

        if (userId) { // If user is authenticated
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (type === 'profile') {
                if (user.image === docPath) {
                    user.image = null; // Remove profile image
                    await user.save();
                    return res.json({ message: 'Profile image removed successfully' });
                } else {
                    return res.status(404).json({ error: 'Profile image not found' });
                }
            } else if (type === 'passport') {
                if (user.passport.includes(docPath)) {
                    user.passport = user.passport.filter(path => path !== docPath); // Remove the specific passport document
                    await user.save();
                    return res.json({ message: 'Passport document removed successfully' });
                } else {
                    return res.status(404).json({ error: 'Passport document not found' });
                }
            } else if (type === 'license') {
                if (user.license.includes(docPath)) {
                    user.license = user.license.filter(path => path !== docPath); // Remove the specific license document
                    await user.save();
                    return res.json({ message: 'License document removed successfully' });
                } else {
                    return res.status(404).json({ error: 'License document not found' });
                }
            } else {
                return res.status(400).json({ error: 'Invalid document type' });
            }
        } else { // If user is not authenticated (guest)
            if (!bookingId) {
                return res.status(400).json({ error: 'Booking ID is required for guests' });
            }

            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({ error: 'Booking not found' });
            }

            if (type === 'passport' || type === 'license') {
                if (booking.documents.includes(docPath)) {
                    booking.documents = booking.documents.filter(path => path !== docPath); // Remove the specific document
                    await booking.save();
                    return res.json({ message: 'Document removed successfully' });
                } else {
                    return res.status(404).json({ error: 'Document not found' });
                }
            } else {
                return res.status(400).json({ error: 'Invalid document type for guest' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


