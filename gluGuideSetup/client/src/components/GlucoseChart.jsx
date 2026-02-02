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
      <h3>Glucose Levels Over Time</h3>
      <div className={styles.graphContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="glucose" stroke="#8884d8" strokeWidth={2} dot={{r: 4}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GlucoseChart;