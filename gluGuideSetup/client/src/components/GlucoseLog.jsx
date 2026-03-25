import React, { useState, useEffect } from 'react';
import { useGlucoseData } from '../hooks/useGlucoseData';
import { getAllMealsForUser } from '../api/mealApi';
import GlucoseChart from './GlucoseChart';
import styles from '../styles/GlucoseLog.module.css';
import { useAuth } from '../context/AuthContext';

const GlucoseLog = () => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id || user?.userId || null;

  const { 
    logs, error, successMessage, filter, setFilter, 
    addLog, deleteLog, updateLog, setSuccessMessage 
  } = useGlucoseData(userId);

  const [formData, setFormData] = useState({ 
    date: '', 
    time: '', 
    level: '', 
    reading_type: 'fasting', 
    meal_id: '' 
  });
  

  const [todaysMeals, setTodaysMeals] = useState([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editedLevel, setEditedLevel] = useState('');


  useEffect(() => {
    const fetchTodaysMeals = async () => {
      if (!userId) return;
      try {
        const allMeals = await getAllMealsForUser(userId);
        

        const todayStr = new Date().toLocaleDateString('en-CA');

 
        const mealsToday = allMeals.filter(meal => {
          if (!meal.meal_time) return false;

          const mealDateStr = new Date(meal.meal_time).toLocaleDateString('en-CA');
          return mealDateStr === todayStr;
        });


        mealsToday.sort((a, b) => new Date(a.meal_time) - new Date(b.meal_time));

        let snackCount = 1;
        const formattedMeals = mealsToday.map(meal => {
          let displayName = meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1).toLowerCase();
          
          if (displayName === 'Snack') {
            displayName = `Snack ${snackCount}`;
            snackCount++;
          }


          const timeStr = new Date(meal.meal_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return {
            ...meal,
            dropdownName: `${displayName} (${timeStr})`
          };
        });

        setTodaysMeals(formattedMeals);
      } catch (err) {
        console.error("Failed to fetch meals for dropdown:", err);
      }
    };

    fetchTodaysMeals();
  }, [userId]);

  useEffect(() => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    }));
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(''); 
      }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

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
      reading_type: formData.reading_type,
      meal_id: formData.meal_id ? parseInt(formData.meal_id, 10) : null,
      userId 
    });
    
    if (success) setFormData({ ...formData, level: '', meal_id: '' });
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

  if (authLoading) return <div className={styles.glucoseLogContainer}><p>Checking authentication...</p></div>;
  if (!user) return <div className={styles.glucoseLogContainer}><p>Please log in to view logs.</p></div>;

  const displayedLogs = isExpanded ? logs : logs.slice(-3);

  const formatReadingType = (type) => {
    switch(type) {
      case 'fasting': return 'Fasting';
      case '1h_post_meal': return '1-Hour Post-Meal';
      case '2h_post_meal': return '2-Hours Post-Meal';
      case 'random': return 'Random/Other';
      default: return type || 'N/A';
    }
  };

  return (
    <div className={styles.glucoseLogContainer}>
      <div className={styles.horizontalWrapper}>
        
        <div className={styles.leftFormColumn}>
          <div className={styles.loggingFormContainer}>
            <h2 className={styles.sectionTitle}>Log Your Glucose Level</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputField}>
                <label>Date:</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>
              
              <div className={styles.inputField}>
                <label>Time:</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required />
              </div>
              
              <div className={styles.inputField}>
                <label>Reading Type:</label>
                <select 
                  value={formData.reading_type} 
                  onChange={(e) => setFormData({...formData, reading_type: e.target.value})}
                  required
                >
                  <option value="fasting">Fasting (Morning)</option>
                  <option value="1h_post_meal">1 Hour Post-Meal</option>
                  <option value="2h_post_meal">2 Hours Post-Meal</option>
                  <option value="random">Random / Other</option>
                </select>
              </div>

              {/* 3. NEW: Replaced the manual ID input with a Smart Dropdown */}
              {(formData.reading_type === '1h_post_meal' || formData.reading_type === '2h_post_meal') && (
                <div className={styles.inputField}>
                  <label>Select Meal:</label>
                  <select 
                    value={formData.meal_id} 
                    onChange={(e) => setFormData({...formData, meal_id: e.target.value})}
                    required // Make this required so they don't accidentally skip it!
                  >
                    <option value="">-- Choose a Meal --</option>
                    {todaysMeals.length > 0 ? (
                      todaysMeals.map(meal => (
                        <option key={meal.meal_id} value={meal.meal_id}>
                          {meal.dropdownName}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No meals logged today yet.</option>
                    )}
                  </select>
                </div>
              )}

              <div className={styles.inputField}>
                <label>Level (mg/dL):</label>
                <input type="number" step="0.01" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} required />
              </div>
              
              <button type="submit" className={styles.submitButton}>Log Glucose</button>
            </form>
            {error && <p className={styles.errorMessage}>{error}</p>}
            {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
          </div>
        </div>

        <div className={styles.rightDisplayColumn}>
          <div className={styles.filterBox}>
            <h3>Filter View</h3>
            <select onChange={(e) => setFilter(e.target.value)} value={filter} className={styles.filterSelect}>
              <option value="24hours">Last 24 Hours</option>
              <option value="1week">Last Week</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className={styles.chartWrapper}>
            <GlucoseChart logs={logs} />
          </div>
          
          <div className={styles.glucoseLogsListContainer}>
            <h3 className={styles.tableHeader}>History</h3>
            <table className={styles.glucoseLogsTable}>
              <thead>
                <tr><th>Date</th><th>Time</th><th>Type</th><th>Level</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {displayedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.date).toLocaleDateString()}</td>
                    <td>{log.time}</td>
                    <td>{formatReadingType(log.reading_type)}</td>
                    <td>
                      {editingLogId === log.id ? (
                        <input type="number" value={editedLevel} onChange={(e) => setEditedLevel(e.target.value)} className={styles.editInput} />
                      ) : log.glucose_level}
                    </td>
                    <td>
                      <div className={styles.actionButtonsWrapper}>
                        {editingLogId === log.id ? (
                          <>
                            <button onClick={() => handleSaveEdit(log.id)} className={styles.saveButton}>Save</button>
                            <button onClick={() => setEditingLogId(null)} className={styles.cancelButton}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingLogId(log.id); setEditedLevel(log.glucose_level); }} className={styles.editButton}>Edit</button>
                            <button onClick={() => handleDeleteLog(log.id)} className={styles.deleteButton}>Delete</button>
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