import React, { useState, useEffect } from 'react';
import { useGlucoseData } from '../hooks/useGlucoseData';
import GlucoseChart from './GlucoseChart';
import styles from '../styles/GlucoseLog.module.css';
import { useAuth } from '../context/AuthContext';

const GlucoseLog = () => {
  const { user, loading: authLoading } = useAuth();
  
  const userId = user?.id || user?.userId || null;

  const { 
    logs, error, successMessage, filter, setFilter, 
    addLog, deleteLog, updateLog 
  } = useGlucoseData(userId);

  const [formData, setFormData] = useState({ date: '', time: '', level: '' });
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editedLevel, setEditedLevel] = useState('');

  useEffect(() => {
    const now = new Date();
    setFormData({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      level: ''
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return alert("Please log in.");

    if (parseFloat(formData.level) <= 0) {
      alert("Please enter a valid glucose level.");
      return;
    }

    const success = await addLog({ 
      date: formData.date, 
      time: formData.time, 
      glucoseLevel: formData.level, 
      userId 
    });

    if (success) setFormData({ ...formData, level: '' });
  };

 const handleSaveEdit = async (logId) => {
  const currentLog = logs.find(l => l.id === logId);

  const success = await updateLog(logId, { 
    glucoseLevel: parseFloat(editedLevel),
    date: currentLog.date, 
    time: currentLog.time 
  });

  if (success) {
    setEditingLogId(null);
    setEditedLevel('');
  }
};


  const handleDeleteLog = async (logId) => {
    if (window.confirm('Are you sure you want to delete this glucose log?')) {
      await deleteLog(logId);
    }
  };

  if (authLoading) {
    return (
      <div className={styles.glucoseLogContainer}>
        <p className={styles.loadingMessage}>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.glucoseLogContainer}>
        <p>Please log in to view your Glucose Logs.</p>
      </div>
    );
  }

  const displayedLogs = isExpanded ? logs : logs.slice(-3);

return (
  <div className={styles.glucoseLogContainer}>
    {/* This wrapper ensures the side-by-side layout logic from the CSS is applied */}
    <div className={styles.horizontalWrapper}>
      
      {/* LEFT SIDE: Only the Form */}
      <div className={styles.leftFormColumn}>
        <div className={styles.loggingFormContainer}>
          <h2 className={styles.pb1}>Log Your Glucose Level</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputField}>
              <label>Date:</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                required 
              />
            </div>
            <div className={styles.inputField}>
              <label>Time:</label>
              <input 
                type="time" 
                value={formData.time} 
                onChange={(e) => setFormData({...formData, time: e.target.value})} 
                required 
              />
            </div>
            <div className={styles.inputField}>
              <label>Level (mg/dL):</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.level} 
                onChange={(e) => setFormData({...formData, level: e.target.value})} 
                required 
              />
            </div>
            <button type="submit" className={styles.submitButton}>Log Glucose</button>
          </form>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        </div>
      </div>

      {/* RIGHT SIDE: Filter, Diagram, and Table stacked with consistent spacing */}
      <div className={styles.rightDisplayColumn}>
        
        {/* Filter Box */}
        <div className={styles.filterBox}>
          <h3>Filter View</h3>
          <select 
            onChange={(e) => setFilter(e.target.value)} 
            value={filter} 
            className={styles.filterSelect}
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="1week">Last Week</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Chart Card */}
        <div className={styles.chartWrapper}>
          <GlucoseChart logs={logs} />
        </div>
        
        {/* History Table Card */}
        <div className={styles.glucoseLogsListContainer}>
          <h3 className={styles.tableHeader}>History</h3>
          <table className={styles.glucoseLogsTable}>
            <thead>
              <tr><th>Date</th><th>Time</th><th>Level</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {displayedLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td>{log.time}</td>
                  <td>
                    {editingLogId === log.id ? (
                      <input 
                        type="number" 
                        value={editedLevel} 
                        onChange={(e) => setEditedLevel(e.target.value)} 
                        className={styles.editInput}
                      />
                    ) : log.glucose_level}
                  </td>
                  <td>
                    {/* The wrapper div below ensures table structure is preserved while buttons stay side-by-side */}
                    <div className={styles.actionButtonsWrapper}>
                      {editingLogId === log.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(log.id)} className={styles.saveButton}>Save</button>
                          <button onClick={() => setEditingLogId(null)} className={styles.cancelButton}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => { setEditingLogId(log.id); setEditedLevel(log.glucose_level); }} 
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteLog(log.id)} 
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length > 3 && (
            <button onClick={() => setIsExpanded(!isExpanded)} className={styles.toggleButton}>
              {isExpanded ? 'Show Less' : 'See More'}
            </button>
          )}
        </div>
      </div>

    </div>
  </div>
);
};

export default GlucoseLog;