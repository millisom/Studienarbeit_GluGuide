const cron = require('node-cron');
const alertController = require('../controllers/alertController');


cron.schedule('* * * * *', () => {
    console.log('Running scheduled task: Sending reminder emails...');
    alertController.sendReminderEmails();
  });