import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../styles/GlucoseLog.module.css';

const GlucoseChart = ({ logs }) => {
  const formatLogsForGraph = logs.map((log) => ({
    name: `${new Date(log.date).toLocaleDateString()} ${log.time}`,
    glucose: parseFloat(log.glucose_level),
  }));

  const chartData = [...formatLogsForGraph].reverse();

  return (
    <div className={styles.graphBox}>
      <h3 className={styles.chartTitle}>Glucose levels over time</h3>
      
      <div className={styles.graphContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="glucose" 
              stroke="var(--color-primary)" 
              strokeWidth={3} 
              dot={{r: 4, fill: 'var(--color-primary)'}} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GlucoseChart;