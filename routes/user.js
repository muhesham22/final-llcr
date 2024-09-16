const express = require('express');
const router = express.Router();
const userDocsController = require('../controllers/user-docs');
const authing = require('../middlewares/authing');


router.patch('/documents',authing ,userDocsController.patchDocs)

router.delete('/documents',authing ,userDocsController.deleteDocs)

module.exports = router;