const express = require('express');
const router = express.Router();
const glucoseController = require('../controllers/glucoseController');
const { validateGlucoseLog } = require('../middleware/validationMiddleware');


router.post('/log', validateGlucoseLog, glucoseController.logGlucose);

router.get('/:userId/time-period', glucoseController.getGlucoseLogsByTimePeriod);

router.get('/:userId', glucoseController.getFilteredGlucoseLogs);

router.get('/log/:id', glucoseController.getGlucoseLogById);

router.put('/log/:id', validateGlucoseLog, glucoseController.updateGlucoseLog);

router.delete('/log/:id', glucoseController.deleteGlucoseLog);

module.exports = router;