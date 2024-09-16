const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose")
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, email, password, phone } = req.body;
        // const image = req.files.path.replace("\\", "/");
        // const passport = req.files.path.replace("\\", "/");
        // const license = req.files.path.replace("\\", "/");
        if (!req.body.role) {
            req.body.role = 'customer';
        }
        const role = req.body.role;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ name, email, password: hashedPassword, phone, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        let loadedUser;
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const token = jwt.sign({
            email: loadedUser.email,
            role: loadedUser.role,
            userId: loadedUser._id.toString(),
        },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        res.status(200).json({ token: token, role: loadedUser.role, name: loadedUser.name, userId: loadedUser._id.toString() });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.viewprofile = async (req, res) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User information retreived', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateUserInfo = async (req,res)=>{
    const userId = req.userId;
    try {
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(422).json({ error: 'Invalid iput' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const {
            name,
            email,
            phone,
                }= req.body;
        user.name = name || user.name;
        // user.email = email || user.email;
        user.phone = phone || user.phone;
        await user.save();
        res.json({ message: 'user updated successfully', user });
        
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Internal server error', error });
    }
}

// const auth = {
//     auth: {
//       api_key: process.env.MG_KEY,
//       domain: process.env.MG_DOMAIN ,
//     }
//   };
  
//   const transporter = nodemailer.createTransport(mg(auth));
  

// // Request password reset
// exports.requestPasswordReset = async (req, res) => {
//     const { email } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Generate reset token
//         const token = crypto.randomBytes(20).toString('hex');
//         user.resetToken = token;
//         user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
//         await user.save();

//         // Send email
//         const mailOptions = {
//             to: user.email,
//             from: 'your-email@example.com',
//             subject: 'Password Reset',
//             text: `You requested a password reset. Click the following link to reset your password: http://localhost:3000/reset/${token}`
//         };

//         transporter.sendMail(mailOptions, (err, info) => {
//             if (err) {
//                 return res.status(500).json({ message: 'Error sending email' });
//             }
//             res.status(200).json({ message: 'Password reset email sent' });
//         });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // Reset password
// exports.resetPassword = async (req, res) => {
//     const { token, newPassword } = req.body;
//     try {
//         const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid or expired token' });
//         }

//         const hashedPassword = await bcrypt.hash(newPassword, 12);
//         user.password = hashedPassword;
//         user.resetToken = null;
//         user.resetTokenExpiration = null;
//         await user.save();

//         res.status(200).json({ message: 'Password reset successful' });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };



