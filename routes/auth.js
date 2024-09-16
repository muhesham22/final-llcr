const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const authValidation = require('../validation/auth');
const authing = require('../middlewares/authing');

router.post('/register', authValidation.isUser(), authController.register);

router.post('/login', authValidation.login(), authController.login);

router.get('/myprofile', authing, authController.viewprofile);

router.patch('/myprofile/edit', authing, authController.updateUserInfo);


module.exports = router;