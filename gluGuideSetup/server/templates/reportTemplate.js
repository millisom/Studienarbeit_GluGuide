/**
 * Generates the HTML string for the GluGuide PDF report.
 * Splits days with many meals into multiple tables for readability.
 */
module.exports = function generateHtmlTemplate(data) {
  let daysHtml = '';
  // 3 meals per table is the best fit for A4 width
  const MAX_MEALS_PER_TABLE = 3; 

  for (const [date, content] of Object.entries(data)) {
    const allMeals = content.meals || [];
    const mealChunks = [];

    // 1. Split meals into chunks
    if (allMeals.length === 0) {
      mealChunks.push([]); 
    } else {
      for (let i = 0; i < allMeals.length; i += MAX_MEALS_PER_TABLE) {
        mealChunks.push(allMeals.slice(i, i + MAX_MEALS_PER_TABLE));
      }
    }

    daysHtml += `<div class="day-section">`;
    
    // 2. Render a table for each chunk
    mealChunks.forEach((chunk, index) => {
      const isFirstTable = index === 0;
      const isContinued = index > 0;
      
      // Visual indicator for the user
      const tableTitle = isFirstTable 
        ? `Report for ${date}` 
        : `Report for ${date} (continued)`;

      daysHtml += `
        <h2 class="${isContinued ? 'continued-h2' : ''}">${tableTitle}</h2>
        <table class="report-table">
          <thead>
            <tr>
              <th class="label-col">MEASUREMENT</th>
              <th class="fasting-col">${isFirstTable ? 'FASTING' : ''}</th>
              ${chunk.map(m => `
                <th>${m.type.toUpperCase()}<br><small class="h-time">${m.time}</small></th>
              `).join('') || '<th>No Meals Logged</th>'}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="label-cell">Logged Items</td>
              <td class="empty-cell">${isFirstTable ? '-' : ''}</td>
              ${chunk.map(m => `
                <td>
                  <ul class="food-list">
                    ${m.items.map(i => `<li>${i.name} (${i.quantity}g)</li>`).join('') || '<li>-</li>'}
                  </ul>
                </td>
              `).join('') || '<td>-</td>'}
            </tr>

            <tr class="carb-row">
              <td class="label-cell">Carb Intake</td>
              <td class="empty-cell">${isFirstTable ? '-' : ''}</td>
              ${chunk.map(m => `
                <td class="carb-val">${m.carbs !== '-' ? m.carbs + 'g' : '-'}</td>
              `).join('') || '<td>-</td>'}
            </tr>

            <tr>
              <td class="label-cell">1h Post-Meal</td>
              <td>
                <div class="glucose-val">
                  ${isFirstTable && content.fasting ? `
                    <strong>${content.fasting.level}</strong> <small>mg/dL</small><br>
                    <span class="log-time">at ${content.fasting.time}</span>
                  ` : ''}
                </div>
              </td>
              ${chunk.map(m => `
                <td>
                  <div class="glucose-val">
                    ${m.g1h ? `<strong>${m.g1h.val}</strong> <small>mg/dL</small><br><span class="log-time">at ${m.g1h.time}</span>` : '-'}
                  </div>
                </td>
              `).join('') || '<td>-</td>'}
            </tr>

            ${chunk.some(m => m.g2h) ? `
            <tr>
              <td class="label-cell">2h Post-Meal</td>
              <td class="empty-cell"></td>
              ${chunk.map(m => `
                <td>
                  <div class="glucose-val">
                    ${m.g2h ? `<strong>${m.g2h.val}</strong> <small>mg/dL</small><br><span class="log-time">at ${m.g2h.time}</span>` : '-'}
                  </div>
                </td>
              `).join('')}
            </tr>
            ` : ''}
          </tbody>
        </table>
      `;
    });

    daysHtml += `</div>`;
  }

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', Arial, sans-serif; color: #333; padding: 20px; }
          h1 { text-align: center; font-size: 22px; color: #2c3e50; margin-bottom: 30px; }
          h2 { font-size: 14px; border-left: 4px solid #3498db; padding-left: 10px; margin-top: 40px; margin-bottom: 10px; color: #2c3e50; }
          .continued-h2 { margin-top: 10px; font-style: italic; border-left-color: #bdc3c7; color: #7f8c8d; }
          
          table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 20px; }
          th, td { border: 1px solid #dfe6e9; padding: 8px; font-size: 10px; vertical-align: top; }
          
          /* FIXED WIDTHS for consistency across multiple tables */
          .label-col, .label-cell { width: 110px; background-color: #f1f2f6; font-weight: bold; }
          .fasting-col { width: 85px; } 
          
          th { background-color: #f8f9fa; text-align: left; border-bottom: 2px solid #3498db; }
          .h-time { color: #636e72; font-weight: normal; font-size: 9px; }
          
          .food-list { padding-left: 15px; margin: 0; list-style-type: square; }
          .carb-row { background-color: #fcfcfc; }
          .carb-val { font-weight: bold; color: #2980b9; font-size: 11px; }
          
          .glucose-val strong { font-size: 11px; color: #2c3e50; }
          .log-time { color: #e67e22; font-size: 8px; }
          
          .day-section { page-break-inside: avoid; margin-bottom: 50px; }
          .empty-cell { background-color: #fafafa; }
          small { color: #7f8c8d; }
        </style>
      </head>
      <body>
        <h1>GluGuide Health Export</h1>
        ${daysHtml}
      </body>
    </html>`;
};