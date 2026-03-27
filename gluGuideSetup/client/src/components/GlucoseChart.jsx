import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../styles/GlucoseLog.module.css';

const GlucoseChart = ({ logs, filter }) => {
  
  const chartData = logs.map((log) => {
    const cleanDate = log.date.split('T')[0]; 
    const cleanTime = log.time.length === 5 ? `${log.time}:00` : log.time; 
    
    const dateObj = new Date(`${cleanDate}T${cleanTime}`);
    let timestamp = dateObj.getTime();
    

    if (isNaN(timestamp)) {
        timestamp = new Date(log.date).getTime();
    }

    const dateStr = new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeStr = log.time.slice(0, 5); 
    
    return {
      timestamp: timestamp, 
      fullTooltip: `${dateStr} at ${timeStr}`, 
      glucose: parseFloat(log.glucose_level),
    };
  })

  .filter(item => !isNaN(item.timestamp) && !isNaN(item.glucose)) 
  .sort((a, b) => a.timestamp - b.timestamp);

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    if (filter === '24hours') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b' }}>{payload[0].payload.fullTooltip}</p>
          <p style={{ margin: '5px 0 0 0', color: 'var(--color-primary, #3b82f6)', fontWeight: 'bold' }}>
            {payload[0].value} mg/dL
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.graphBox}>
      <div className={styles.graphContainer}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              
              <XAxis 
                dataKey="timestamp" 
                type="number" 
                domain={['dataMin', 'dataMax']} 
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12, fill: '#64748b' }} 
                tickMargin={10} 
                minTickGap={40} 
              />
              
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                domain={['auto', 'auto']} 
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Line 
                type="monotone" 
                dataKey="glucose" 
                stroke="var(--color-primary, #3b82f6)" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'var(--color-primary, #3b82f6)', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            No glucose logs available for this time period.
          </div>
        )}
      </div>
    </div>
  );
};

export default GlucoseChart;