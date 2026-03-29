const ExportModel = require('../models/exportModel');
const puppeteer = require('puppeteer');

const exportController = {
  // getAvailableDates stays the same...
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
            carbs: Number(meal.total_carbs || 0).toFixed(1), // 👈 Pulling directly from DB
            g1h: g1h ? { val: parseFloat(g1h.glucose_level).toFixed(0), time: g1h.time.slice(0, 5) } : null,
            g2h: g2h ? { val: parseFloat(g2h.glucose_level).toFixed(0), time: g2h.time.slice(0, 5) } : null
          });
        }
      });

      const htmlContent = generateHtmlTemplate(reportData);
      browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' } });
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

function generateHtmlTemplate(data) {
  let daysHtml = '';
  for (const [date, content] of Object.entries(data)) {
    const mealHeaders = content.meals.map(m => `<th>${m.type.toUpperCase()}<br><small class="h-time">${m.time}</small></th>`).join('');
    
    daysHtml += `
      <div class="day-section">
        <h2>Report for ${date}</h2>
        <table>
          <thead>
            <tr><th style="width: 105px;">FASTING</th>${mealHeaders || '<th>No meals</th>'}</tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="cell-wrapper">
                  <div class="top-content"><p class="log-time">Time: ${content.fasting?.time || '-'}</p></div>
                  <div class="glucose-results no-border">
                    <p>${content.fasting ? `Level: ${content.fasting.level} <small>mg/dL</small>` : '-'}</p>
                  </div>
                </div>
              </td>
              ${content.meals.map(m => `
                <td>
                  <div class="cell-wrapper">
                    <div class="top-content">
                      <ul class="food-list">${m.items.map(i => `<li>${i.name} (${i.quantity}g)</li>`).join('')}</ul>
                      <p class="carb-total">Carbs: ${m.carbs}g</p>
                    </div>
                    <div class="glucose-results">
                      <p>1h: ${m.g1h ? `${m.g1h.val} <small>mg/dL</small> <span class="log-time">(${m.g1h.time})</span>` : '-'}</p>
                      ${m.g2h ? `<p>2h: ${m.g2h.val} <small>mg/dL</small> <span class="log-time">(${m.g2h.time})</span></p>` : ''}
                    </div>
                  </div>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>`;
  }

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial; color: #333; padding: 10px; }
          h1 { text-align: center; font-size: 20px; color: #2c3e50; }
          h2 { border-bottom: 2px solid #3498db; font-size: 13px; margin-top: 25px; padding-bottom: 3px; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #bdc3c7; vertical-align: top; padding: 0; }
          th { background: #f8f9fa; font-size: 10px; padding: 8px; }
          .h-time { color: #7f8c8d; font-weight: normal; }
          
          .cell-wrapper { 
            display: flex; flex-direction: column; 
            min-height: 220px; /* Forces uniform height */
            padding: 8px; 
          }
          .top-content { flex-grow: 1; } /* Pushes everything below it down */
          
          .food-list { font-size: 9px; padding-left: 12px; margin: 0; list-style: square; }
          .carb-total { font-size: 9px; font-weight: bold; color: #2980b9; margin-top: 8px; }
          
          .glucose-results { 
            margin-top: 30px; /* THE WHITESPACE GAP */
            border-top: 1px dashed #dcdde1; 
            padding-top: 8px; 
            min-height: 40px; 
          }
          .no-border { border: none; margin-top: 0; }
          .glucose-results p { margin: 2px 0; font-size: 9px; font-weight: bold; }
          .log-time { color: #e67e22; font-size: 8px; font-weight: normal; }
          small { color: #7f8c8d; font-size: 8px; }
        </style>
      </head>
      <body><h1>GluGuide Health Export</h1>${daysHtml}</body>
    </html>`;
}

module.exports = exportController;