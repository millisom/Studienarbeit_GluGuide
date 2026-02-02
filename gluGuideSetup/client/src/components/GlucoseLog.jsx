import React, { useState } from 'react';
import { useGlucoseData } from '../hooks/useGlucoseData';
import GlucoseChart from './GlucoseChart';
import styles from '../styles/GlucoseLog.module.css';
import { useAuth } from '../context/AuthContext'; 

const GlucoseLog = () => {

  const { user } = useAuth();
  
  const userId = user ? (user.id || user.userId) : null;

  const { 
    logs, error, successMessage, filter, setFilter, 
    addLog, deleteLog, updateLog 
  } = useGlucoseData(userId);

 
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [glucoseLevel, setGlucoseLevel] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editedGlucoseLevel, setEditedGlucoseLevel] = useState('');


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) {
        alert("Please log in to track glucose.");
        return;
    }
    const success = await addLog({ date, time, glucoseLevel, userId });
    if (success) {
      setDate(''); setTime(''); setGlucoseLevel('');
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this glucose log?')) return;
    await deleteLog(logId);
  };

  const handleSaveEdit = async (log) => {
    const success = await updateLog(log.id, {
      date: log.date,
      time: log.time,
      glucoseLevel: editedGlucoseLevel,
    });
    if (success) {
      setEditingLogId(null);
      setEditedGlucoseLevel('');
    }
  };

  const displayedLogs = isExpanded ? logs : logs.slice(-3);
  const filterMap = { '24hours': '24 hours', '1week': 'the past week', '3months': '3 months', 'all': 'all time' };

  if (!user) {
      return <div className={styles.glucoseLogContainer}><p>Please log in to view your Glucose Logs.</p></div>;
  }

  return (
    <div className={styles.glucoseLogContainer}>
      <div className={styles.leftColumn}>
        <div className={styles.loggingFormContainer}>
          <h2 className={styles.pb1}>Log Your Glucose Level</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputField}>
              <label className={styles.label}>Date:</label>
              <input className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className={styles.inputField}>
              <label className={styles.label}>Time:</label>
              <input className={styles.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
            <div className={styles.inputField}>
              <label className={styles.label}>Glucose Level:</label>
              <input className={styles.input} type="number" step="0.01" value={glucoseLevel} onChange={(e) => setGlucoseLevel(e.target.value)} required />
            </div>
            <button type="submit" className={styles.submitButton}>Log Glucose</button>
          </form>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        </div>

        <div className={styles.filterBox}>
          <h3>Filter Data</h3>
          <select onChange={(e) => setFilter(e.target.value)} value={filter} className={styles.filterSelect}>
            <option value="24hours">Last 24 Hours</option>
            <option value="1week">Last Week</option>
            <option value="3months">Last 3 Months</option>
            <option value="all">All Data</option>
          </select>
        </div>
      </div>

      <div className={styles.rightColumn}>
        <GlucoseChart logs={logs} />

        <div className={styles.glucoseLogsListContainer}>
          <h3 className={styles.tableHeader}>Logged Data</h3>
          <table className={styles.glucoseLogsTable}>
            <thead>
              <tr><th>Date</th><th>Time</th><th>Glucose Level</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {displayedLogs.length > 0 ? (
                displayedLogs.map((log) =>
                  editingLogId === log.id ? (
                    <tr key={log.id}>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>{log.time}</td>
                      <td><input type="number" step="0.01" value={editedGlucoseLevel} onChange={(e) => setEditedGlucoseLevel(e.target.value)} /></td>
                      <td>
                        <button onClick={() => handleSaveEdit(log)} className={styles.saveButton}>Save</button>
                        <button onClick={() => setEditingLogId(null)} className={styles.cancelButton}>Cancel</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={log.id}>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>{log.time}</td>
                      <td>{log.glucose_level}</td>
                      <td>
                        <button onClick={() => { setEditingLogId(log.id); setEditedGlucoseLevel(log.glucose_level); }} className={styles.editButton}>Edit</button>
                        <button onClick={() => handleDeleteLog(log.id)} className={styles.deleteButton}>Delete</button>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr><td colSpan="4">No logs in the past {filterMap[filter] || ''}</td></tr>
              )}
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
  );
};

export default GlucoseLog;