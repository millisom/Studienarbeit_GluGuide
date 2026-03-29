const ExportModel = require('../models/exportModel');

const exportController = {

  async getAvailableDates(req, res, next) {
    try {
      const user_id = req.session.userId;
      const { range } = req.query;

      const startDate = new Date();
      if (range === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (range === 'month') startDate.setMonth(startDate.getMonth() - 1);
      else if (range === '3months') startDate.setMonth(startDate.getMonth() - 3);
      else startDate.setMonth(startDate.getMonth() - 1);

      const dates = await ExportModel.getAvailableDates(user_id, startDate);
      res.status(200).json({ dates });
    } catch (error) {
      next(error);
    }
  },

  async generatePdf(req, res, next) {
    try {
      const user_id = req.session.userId;
      const { selectedDates } = req.body;

      if (!selectedDates || selectedDates.length === 0) {
        return res.status(400).json({ message: "No dates selected for export." });
      }

      const rawData = await ExportModel.getReportData(user_id, selectedDates);
      const reportData = {};

      selectedDates.forEach(date => {
        reportData[date] = { fasting: null, meals: {} };
      });


      rawData.glucoseLogs.forEach(log => {
        const dateStr = new Date(log.date).toISOString().split('T')[0];

        if (reportData[dateStr] && log.reading_type === 'fasting') {
          reportData[dateStr].fasting = log;
        }
      });


      rawData.meals.forEach(meal => {
        const dateStr = new Date(meal.date).toISOString().split('T')[0];


        if (reportData[dateStr]) {
          // Find glucose logs linked specifically to this meal_id
          const postMealLogs = rawData.glucoseLogs.filter(g => g.meal_id === meal.meal_id);
          const glucose1h = postMealLogs.find(g => g.reading_type === '1h_post_meal');
          const glucose2h = postMealLogs.find(g => g.reading_type === '2h_post_meal');

          reportData[dateStr].meals[meal.meal_type] = {
            time: meal.meal_time,
            items: meal.items,
            glucose_1h: glucose1h ? glucose1h.glucose_level : null,
            glucose_2h: glucose2h ? glucose2h.glucose_level : null
          };
        }
      });


      res.status(200).json({ 
        success: true, 
        selectedDatesCount: selectedDates.length,
        structuredData: reportData 
      });

    } catch (error) {
      console.error("Aggregation Error:", error);
      next(error);
    }
  }
};

module.exports = exportController;