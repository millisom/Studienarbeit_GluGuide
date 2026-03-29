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
        reportData[date] = { fasting: null, meals: [] };
      });

      rawData.glucoseLogs.forEach(log => {
        const dateStr = new Date(log.date).toISOString().split('T')[0];
        if (reportData[dateStr] && log.reading_type === 'fasting') {
          // Store level and formatted time for Fasting
          reportData[dateStr].fasting = {
            level: parseFloat(log.glucose_level).toFixed(0),
            time: log.time.slice(0, 5) // HH:mm
          };
        }
      });

      rawData.meals.forEach(meal => {
        const dateStr = new Date(meal.date).toISOString().split('T')[0];
        if (reportData[dateStr]) {
          const postMealLogs = rawData.glucoseLogs.filter(g => g.meal_id === meal.meal_id);
          const g1h = postMealLogs.find(g => g.reading_type === '1h_post_meal');
          const g2h = postMealLogs.find(g => g.reading_type === '2h_post_meal');

          reportData[dateStr].meals.push({
            type: meal.meal_type,
            time: new Date(meal.meal_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: Array.isArray(meal.items) ? meal.items : [],
            // Store as objects containing value and time
            glucose_1h: g1h ? { level: parseFloat(g1h.glucose_level).toFixed(0), time: g1h.time.slice(0, 5) } : null,
            glucose_2h: g2h ? { level: parseFloat(g2h.glucose_level).toFixed(0), time: g2h.time.slice(0, 5) } : null
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
    const mealHeaders = content.meals.map(meal => `
      <th>${meal.type.toUpperCase()}<br><small class="header-time">${meal.time}</small></th>
    `).join('');

    daysHtml += `
      <div class="day-section">
        <h2>Report for ${date}</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 100px;">FASTING</th>
              ${mealHeaders || '<th>No meals logged</th>'}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="valign-top">
                <div class="cell-wrapper">
                  <div class="glucose-results no-border">
                    ${content.fasting ? `
                      <p>Level: ${content.fasting.level} <small>mg/dL</small></p>
                      <p class="log-time">Time: ${content.fasting.time}</p>
                    ` : '<p>-</p>'}
                  </div>
                </div>
              </td>
              ${content.meals.map(meal => `
                <td class="valign-top">
                  <div class="cell-wrapper">
                    <ul class="food-list">
                      ${meal.items.map(i => `<li>${i.name} (${i.quantity}g)</li>`).join('')}
                    </ul>
                    <div class="glucose-results">
                      ${meal.glucose_1h ? `
                        <p>1h: ${meal.glucose_1h.level} <small>mg/dL</small> <span class="log-time">(${meal.glucose_1h.time})</span></p>
                      ` : '<p>1h: -</p>'}
                      
                      ${meal.glucose_2h ? `
                        <p>2h: ${meal.glucose_2h.level} <small>mg/dL</small> <span class="log-time">(${meal.glucose_2h.time})</span></p>
                      ` : ''}
                    </div>
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
          th, td { border: 1px solid #bdc3c7; padding: 0; text-align: left; word-wrap: break-word; vertical-align: top; }
          th { background-color: #f8f9fa; color: #2c3e50; font-weight: bold; padding: 8px; font-size: 10px; }
          
          .header-time { color: #7f8c8d; font-weight: normal; font-size: 9px; }
          
          /* Flexbox to push glucose results to the bottom */
          .cell-wrapper { 
            display: flex; 
            flex-direction: column; 
            min-height: 140px; /* Ensures minimum row height */
            height: 100%; 
            padding: 8px;
          }
          
          .food-list { 
            padding-left: 12px; 
            margin: 0; 
            list-style-type: square; 
            font-size: 9px;
            flex-grow: 1; /* Pushes everything else down */
          }
          
          .glucose-results { 
            margin-top: auto; /* Aligns logs to bottom */
            padding-top: 6px; 
            border-top: 1px dashed #dcdde1; 
          }
          
          .no-border { border-top: none; margin-top: 0; }
          
          .glucose-results p { margin: 2px 0; font-weight: bold; font-size: 9px; color: #2c3e50; }
          .log-time { font-weight: normal !important; color: #e67e22; font-size: 8.5px; }
          
          small { font-weight: normal; font-size: 8px; color: #7f8c8d; }
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