const ExportModel = require('../models/exportModel');
const puppeteer = require('puppeteer');

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
    let browser;
    try {
      const user_id = req.session.userId;
      const { selectedDates } = req.body;

      if (!selectedDates || selectedDates.length === 0) {
        return res.status(400).json({ message: "No dates selected." });
      }

      const rawData = await ExportModel.getReportData(user_id, selectedDates);
      const reportData = {};

      selectedDates.forEach(date => {
        // Change: meals is now an Array [] to support multiple entries
        reportData[date] = { fasting: null, meals: [] };
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
          const postMealLogs = rawData.glucoseLogs.filter(g => g.meal_id === meal.meal_id);
          const glucose1h = postMealLogs.find(g => g.reading_type === '1h_post_meal');
          const glucose2h = postMealLogs.find(g => g.reading_type === '2h_post_meal');

          // Change: Use .push() so we don't overwrite multiple snacks
          reportData[dateStr].meals.push({
            type: meal.meal_type,
            time: new Date(meal.meal_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: Array.isArray(meal.items) ? meal.items : [],
            glucose_1h: glucose1h ? glucose1h.glucose_level : '-',
            glucose_2h: glucose2h ? glucose2h.glucose_level : '-'
          });
        }
      });

      const htmlContent = generateHtmlTemplate(reportData);

      browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
      });

      await browser.close();

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=GluGuide_Report.pdf',
        'Content-Length': pdfBuffer.length
      });
      
      res.end(pdfBuffer);

    } catch (error) {
      if (browser) await browser.close();
      console.error("PDF Generation Error:", error);
      res.status(500).send("Error generating PDF");
    }
  }
};

function generateHtmlTemplate(data) {
  let daysHtml = '';

  for (const [date, content] of Object.entries(data)) {
    // Dynamically handle headers based on the meals logged for this specific day
    const mealHeaders = content.meals.map(meal => `
      <th>${meal.type.toUpperCase()}<br><small>${meal.time}</small></th>
    `).join('');

    daysHtml += `
      <div class="day-section">
        <h2>Report for ${date}</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 120px;">FASTING</th>
              ${mealHeaders || '<th>No meals logged</th>'}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="valign-top">
                ${content.fasting ? `<strong>${parseFloat(content.fasting.glucose_level).toFixed(0)} mg/dL</strong>` : '-'}
              </td>
              ${content.meals.map(meal => `
                <td class="valign-top">
                  <ul class="food-list">
                    ${meal.items.map(i => `<li>${i.name} (${i.quantity}g)</li>`).join('')}
                  </ul>
                  <div class="glucose-results">
                    <p>1h: ${meal.glucose_1h !== '-' ? parseFloat(meal.glucose_1h).toFixed(0) : '-'}</p>
                    <p>2h: ${meal.glucose_2h !== '-' ? parseFloat(meal.glucose_2h).toFixed(0) : '-'}</p>
                  </div>
                </td>
              `).join('') || '<td>-</td>'}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; padding: 10px; line-height: 1.2; }
          h1 { color: #2c3e50; text-align: center; margin-bottom: 20px; font-size: 22px; }
          h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 3px; margin-top: 25px; font-size: 14px; }
          .day-section { margin-bottom: 30px; page-break-inside: avoid; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; border: 1px solid #bdc3c7; }
          th, td { border: 1px solid #bdc3c7; padding: 6px; text-align: left; font-size: 9px; word-wrap: break-word; }
          th { background-color: #ecf0f1; color: #2c3e50; font-weight: bold; }
          .valign-top { vertical-align: top; }
          .food-list { padding-left: 10px; margin: 0; list-style-type: square; }
          .glucose-results { margin-top: 6px; padding-top: 4px; border-top: 1px dashed #bdc3c7; }
          .glucose-results p { margin: 1px 0; font-weight: bold; color: #d35400; }
        </style>
      </head>
      <body>
        <h1>GluGuide Health Export</h1>
        ${daysHtml}
      </body>
    </html>
  `;
}

module.exports = exportController;