const pool = require('../config/db');

const ExportModel = {
  async getAvailableDates(user_id, startDate) {
    const query = `
      SELECT DISTINCT DATE(meal_time) as log_date FROM meals WHERE user_id = $1 AND meal_time >= $2
      UNION
      SELECT DISTINCT date as log_date FROM glucose_logs WHERE user_id = $1 AND date >= $2
      ORDER BY log_date DESC;
    `;
    const result = await pool.query(query, [user_id, startDate]);
    return result.rows.map(row => row.log_date.toISOString().split('T')[0]);
  },

  async getReportData(user_id, datesArray) {
    const mealsQuery = `
      SELECT 
        DATE(m.meal_time) as date,
        m.meal_id,
        m.meal_type,
        m.meal_time,
        m.total_carbs, 
        COALESCE(
          json_agg(
            json_build_object('name', f.name, 'quantity', mfi.quantity_in_grams)
          ) FILTER (WHERE f.food_id IS NOT NULL), '[]'
        ) as items
      FROM meals m
      LEFT JOIN meal_food_items mfi ON m.meal_id = mfi.meal_id
      LEFT JOIN foods f ON mfi.food_id = f.food_id
      WHERE m.user_id = $1 AND DATE(m.meal_time) = ANY($2::date[])
      GROUP BY m.meal_id
      ORDER BY m.meal_time ASC;
    `;

    const glucoseQuery = `
      SELECT date, time, glucose_level, reading_type, meal_id
      FROM glucose_logs
      WHERE user_id = $1 AND date = ANY($2::date[])
      ORDER BY date ASC, time ASC;
    `;

    const [mealsResult, glucoseResult] = await Promise.all([
      pool.query(mealsQuery, [user_id, datesArray]),
      pool.query(glucoseQuery, [user_id, datesArray])
    ]);

    return { meals: mealsResult.rows, glucoseLogs: glucoseResult.rows };
  }
};

module.exports = ExportModel;