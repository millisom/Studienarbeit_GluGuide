const Log = require('../models/glucoseModel');

const logController = {

    async logGlucose(req, res) {
        const userId = req.session?.userId;
        // 1. UPDATED: Destructure the new meal_id and reading_type fields
        const { date, time, glucoseLevel, meal_id, reading_type } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required (Session).' });
        }

        try {
            console.log('Calling Log.createLog with:', { userId, date, time, glucoseLevel, meal_id, reading_type });

            // 2. UPDATED: Pass the new fields to the model
            const newLog = await Log.createLog(userId, date, time, glucoseLevel, meal_id, reading_type);

            // ==========================================
            // 💉 GESTATIONAL DIABETES: 2-HOUR TRAP
            // ==========================================
            const threshold = 140; // Alert threshold (Change to 7.8 if you use mmol/L)
            const isOneHourCheck = reading_type === '1h_post_meal';
            const isTooHigh = parseFloat(glucoseLevel) > threshold;

            if (isOneHourCheck && isTooHigh) {
                console.log(`⚠️ [WARNING] High 1-hour reading (${glucoseLevel}) for User ${userId}. Scheduling 2-hour check.`);
                
                // Set a timer for 1 hour from NOW (which equals 2 hours post-meal)
                setTimeout(() => {
                    console.log(`⏰ [ALERT] Triggering 2-hour glucose check for User ${userId} (Meal ${meal_id})`);
                    
                    // TODO: Call your existing email alert function here!
                    // sendEmailAlert(userId, "Follow-up required", "Your 1-hour reading was elevated. Please check your glucose again now.");
                    
                }, 60 * 60 * 1000);
            }
            // ==========================================

            return res.status(201).json(newLog);
        } catch (error) {
            console.error('Error logging glucose:', error);
            return res.status(500).json({ error: 'Failed to log glucose level' });
        }
    },

    async getUserGlucoseLogs(req, res) {
        const { userId } = req.params;

        try {
            const logs = await Log.getLogsByUser(userId);

            if (logs.length === 0) {
                return res.status(404).json({ message: 'No logs found for this user' });
            }

            return res.status(200).json(logs);
        } catch (error) {
            console.error('Error fetching glucose logs:', error);
            return res.status(500).json({ error: 'Failed to fetch glucose logs' });
        }
    },

    async getFilteredGlucoseLogs(req, res) {
        console.log('Request reached the controller');
        const { userId } = req.params;
        const { filter } = req.query;

        console.log('Controller: User ID:', userId);
        console.log('Controller: Filter received:', filter);

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required for this operation.' });
        }

        try {
            const logs = await Log.getLogsByFilter(userId, filter);
            console.log('Controller: Logs returned from model:', logs);

            if (logs.length === 0) {
                return res.status(404).json({ message: 'No logs found for the specified filter' });
            }

            return res.status(200).json(logs);
        } catch (error) {
            console.error('Error fetching filtered logs:', error);
            return res.status(500).json({ error: 'Failed to fetch glucose logs.' });
        }
    },

    async getGlucoseLogsByTimePeriod(req, res) {
        const { userId } = req.params;
        const { timePeriod } = req.query;

        console.log('Controller: User ID:', userId);
        console.log('Controller: Time Period:', timePeriod);

        if (!userId) {
            console.error('Error: Missing user ID in session.');
            return res.status(400).json({ error: 'User ID is required for this operation.' });
        }

        if (!timePeriod || !['1 day', '7 days', '30 days'].includes(timePeriod)) {
            console.error('Error: Invalid time period.');
            return res.status(400).json({ error: 'Valid time period is required (e.g., 1 day, 7 days, 30 days).' });
        }

        try {
            const logs = await Log.getLogsByTimePeriod(userId, timePeriod);

            if (logs.length === 0) {
                return res.status(404).json({ message: 'No logs found for the specified time period' });
            }

            return res.status(200).json(logs);
        } catch (error) {
            console.error('Error fetching glucose logs by time period:', error);
            return res.status(500).json({ error: 'Failed to fetch glucose logs' });
        }
    },

    async getGlucoseLogById(req, res) {
        const { id } = req.params;

        try {
            const log = await Log.getLogById(id);

            if (!log) {
                return res.status(404).json({ message: 'Log not found' });
            }

            return res.status(200).json(log);
        } catch (error) {
            console.error('Error fetching glucose log by ID:', error);
            return res.status(500).json({ error: 'Failed to fetch glucose log' });
        }
    },

    async updateGlucoseLog(req, res) {
        const logId = parseInt(req.params.id, 10);
        const userId = req.session.userId;

        console.log("DEBUG: logId:", logId, "userId:", userId, "body:", req.body);

        if (isNaN(logId)) {
            return res.status(400).json({ error: 'Invalid Log ID format' });
        }
        if (!userId) {
            return res.status(401).json({ error: 'Session expired or User not logged in' });
        }

        // 3. UPDATED: Destructure the new fields for updates
        const { date, time, glucoseLevel, meal_id, reading_type } = req.body;

        try {
            // 4. UPDATED: Pass the new fields to the update method
            const updatedLog = await Log.updateLog(logId, userId, date, time, glucoseLevel, meal_id, reading_type);

            if (!updatedLog) {
                return res.status(403).json({ message: 'Log not found or unauthorized' });
            }

            return res.status(200).json({ success: true, log: updatedLog });
        } catch (error) {
            console.error('Update Controller Error:', error.message);
            return res.status(500).json({ error: 'Internal server error during update' });
        }
    },

    async deleteGlucoseLog(req, res) {
        const { id } = req.params;
        const userId = req.session.userId;

        try {
            const deleted = await Log.deleteLog(id, userId);

            if (!deleted) {
                return res.status(403).json({ message: 'Forbidden: Log not found or unauthorized' });
            }

            return res.status(200).json({ message: 'Log deleted successfully' });
        } catch (error) {
            console.error('Error deleting glucose log:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

module.exports = logController;