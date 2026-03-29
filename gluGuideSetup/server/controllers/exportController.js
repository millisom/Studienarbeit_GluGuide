const ExportModel = require('../models/exportModel');
const puppeteer = require('puppeteer');
const generateHtmlTemplate = require('../templates/reportTemplate'); 

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
    } catch (error) { next(error); }
  },

  async generatePdf(req, res, next) {
    let browser;
    try {
      const user_id = req.session.userId;
      const { selectedDates } = req.body;
      if (!selectedDates || selectedDates.length === 0) return res.status(400).json({ message: "No dates selected." });

      const rawData = await ExportModel.getReportData(user_id, selectedDates);
      const reportData = {};

      selectedDates.forEach(date => { reportData[date] = { fasting: null, meals: [] }; });

      rawData.glucoseLogs.forEach(log => {
        const dateStr = new Date(log.date).toISOString().split('T')[0];
        if (reportData[dateStr] && log.reading_type === 'fasting') {
          reportData[dateStr].fasting = { level: parseFloat(log.glucose_level).toFixed(0), time: log.time.slice(0, 5) };
        }
      });

      rawData.meals.forEach(meal => {
        const dateStr = new Date(meal.date).toISOString().split('T')[0];
        if (reportData[dateStr]) {
          const logs = rawData.glucoseLogs.filter(g => g.meal_id === meal.meal_id);
          const g1h = logs.find(g => g.reading_type === '1h_post_meal');
          const g2h = logs.find(g => g.reading_type === '2h_post_meal');

          reportData[dateStr].meals.push({
            type: meal.meal_type,
            time: new Date(meal.meal_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: meal.items,
            carbs: Number(meal.total_carbs || 0).toFixed(1), 
            g1h: g1h ? { val: parseFloat(g1h.glucose_level).toFixed(0), time: g1h.time.slice(0, 5) } : null,
            g2h: g2h ? { val: parseFloat(g2h.glucose_level).toFixed(0), time: g2h.time.slice(0, 5) } : null
          });
        }
      });

      const htmlContent = generateHtmlTemplate(reportData);

      browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
      const pdfBuffer = await page.pdf({ 
        format: 'A4', 
        printBackground: true, 
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' } 
      });
      await browser.close();

      res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': pdfBuffer.length });
      res.end(pdfBuffer);
    } catch (error) {
      if (browser) await browser.close();
      console.error(error);
      res.status(500).send("Error generating PDF");
    }
  }
};

module.exports = exportController;