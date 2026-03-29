const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const setUserIdInSession = require('../middleware/sessionMiddleware'); 

// GET: Fetch available dates for the frontend checkboxes
router.get('/dates', setUserIdInSession, exportController.getAvailableDates);

// POST: Receive selected dates and return the structured report data (later PDF)
router.post('/generate', setUserIdInSession, exportController.generatePdf);

module.exports = router;