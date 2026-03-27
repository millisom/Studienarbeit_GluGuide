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
  
  const [allUserMeals, setAllUserMeals] = useState([]); 
  const [dropdownMeals, setDropdownMeals] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editedLevel, setEditedLevel] = useState('');

  useEffect(() => {
    const fetchAllMeals = async () => {
      if (!userId) return;
      try {
        const meals = await getAllMealsForUser(userId);
        setAllUserMeals(meals);
      } catch (err) {
        console.error("Failed to fetch all meals:", err);
      }
    };
    fetchAllMeals();
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
    if (!formData.date || allUserMeals.length === 0) {
      setDropdownMeals([]);
      return;
    }

    const mealsForSelectedDate = allUserMeals.filter(meal => {
      if (!meal.meal_time) return false;
      const mealDateStr = new Date(meal.meal_time).toLocaleDateString('en-CA');
      return mealDateStr === formData.date;
    });

    mealsForSelectedDate.sort((a, b) => new Date(a.meal_time) - new Date(b.meal_time));

    let snackCount = 1;
    const formattedMeals = mealsForSelectedDate.map(meal => {
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

    setDropdownMeals(formattedMeals);
    setFormData(prev => ({...prev, meal_id: ''}));

  }, [formData.date, allUserMeals]);

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

    if (formData.reading_type === '1h_post_meal' || formData.reading_type === '2h_post_meal') {
      const selectedMeal = dropdownMeals.find(m => m.meal_id === parseInt(formData.meal_id, 10));
      
      if (selectedMeal && selectedMeal.meal_time) {
        const glucoseTime = new Date(`${formData.date}T${formData.time}`);
        const mealTime = new Date(selectedMeal.meal_time);
        
        const diffInMinutes = (glucoseTime - mealTime) / (1000 * 60);

        if (diffInMinutes < 0) {
          alert("The time entered is before the meal even happened! Please check your time.");
          return;
        }

        if (formData.reading_type === '1h_post_meal' && diffInMinutes < 50) {
          alert("To get a good accuracy, logging must be at least 60 minutes after a meal. Please wait a bit longer!");
          return;
        }

        if (formData.reading_type === '2h_post_meal' && diffInMinutes < 110) {
          alert("For accurate 2-hour tracking, please wait until it has been at least 2 hours since your meal.");
          return;
        }
      }
    }

    const success = await addLog({ 
      date: formData.date, 
      time: formData.time, 
      glucoseLevel: parseFloat(formData.level),
      reading_type: formData.reading_type,
      meal_id: formData.meal_id !== '' ? parseInt(formData.meal_id, 10) : null, 
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

  if (authLoading) return <div className={styles.container}><p>Checking authentication...</p></div>;
  if (!user) return <div className={styles.container}><p>Please log in to view logs.</p></div>;

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

  const getAssociatedMealName = (mealId) => {
    if (!mealId) return null;
    const meal = allUserMeals.find(m => m.meal_id === parseInt(mealId, 10));
    if (!meal) return "Unknown Meal";
    
    const typeStr = meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1).toLowerCase();
    const timeStr = new Date(meal.meal_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${typeStr} (${timeStr})`;
  };

  return (
    <div className={styles.container}>
      
      <h1 className={styles.pageTitle}>Glucose Readings</h1>

      {/* 1. TOP SECTION: LOGGING FORM (Matches CreatePost Component exactly) */}
      <div className={styles.formOuterContainer}>
        <div className={styles.formInnerRectangle}>
          <h2 className={styles.sectionTitle}>Log Your Glucose Level</h2>
          
          <form onSubmit={handleSubmit} className={styles.formWrapper}>
            
            <div className={styles.inputRow}>
              <div className={styles.inputField}>
                <label>Date:</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required className={styles.input} />
              </div>
              
              <div className={styles.inputField}>
                <label>Time:</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required className={styles.input} />
              </div>
            </div>
            
            <div className={styles.inputField}>
              <label>Reading Type:</label>
              <select 
                value={formData.reading_type} 
                onChange={(e) => setFormData({...formData, reading_type: e.target.value})}
                required
                className={styles.input}
              >
                <option value="fasting">Fasting (Morning)</option>
                <option value="1h_post_meal">1 Hour Post-Meal</option>
                <option value="2h_post_meal">2 Hours Post-Meal</option>
                <option value="random">Random / Other</option>
              </select>
            </div>

            {(formData.reading_type === '1h_post_meal' || formData.reading_type === '2h_post_meal') && (
              <div className={styles.inputField}>
                <label>Select Meal:</label>
                <select 
                  value={formData.meal_id} 
                  onChange={(e) => setFormData({...formData, meal_id: e.target.value})}
                  required 
                  className={styles.input}
                >
                  <option value="">-- Choose a Meal --</option>
                  {dropdownMeals.length > 0 ? (
                    dropdownMeals.map(meal => (
                      <option key={meal.meal_id} value={meal.meal_id}>
                        {meal.dropdownName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No meals logged on this date.</option>
                  )}
                </select>
              </div>
            )}

            <div className={styles.inputField}>
              <label>Level (mg/dL):</label>
              <input type="number" step="0.01" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} required className={styles.input} />
            </div>
            
            <button type="submit" className={styles.submitButton}>Log Glucose</button>
          </form>
          
          {error && <p className={styles.errorMessage}>{error}</p>}
          {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        </div>
      </div>

      {/* 2. BOTTOM SECTION: FILTER, CHART, AND HISTORY TABLE */}
      <div className={styles.historySection}>
        
        <div className={styles.filterHeader}>
          <h3 className={styles.filterTitle}>History & Analysis</h3>
          <div className={styles.filterControls}>
            <span className={styles.filterLabel}>Filter:</span>
            <select onChange={(e) => setFilter(e.target.value)} value={filter} className={styles.input} style={{ width: 'auto', padding: '6px 12px' }}>
              <option value="24hours">Last 24 Hours</option>
              <option value="1week">Last Week</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className={styles.chartWrapper}>
          <GlucoseChart logs={logs} filter={filter} />
        </div>
        
        <div>
          <table className={styles.glucoseLogsTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Associated Meal</th>
                <th>Level</th>
                <th className={styles.textCenter}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td>{log.time.slice(0, 5)}</td>
                  <td>{formatReadingType(log.reading_type)}</td>
                  
                  <td className={styles.associatedMeal}>
                    {getAssociatedMealName(log.meal_id) || '-'}
                  </td>
                  
                  <td className={styles.levelBold}>
                    {editingLogId === log.id ? (
                      <input type="number" value={editedLevel} onChange={(e) => setEditedLevel(e.target.value)} className={styles.editInput} />
                    ) : (
                      `${Number(log.glucose_level)} mg/dL`
                    )}
                  </td>

                  <td className={styles.textCenter}>
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
            <div className={styles.toggleButtonContainer}>
              <button onClick={() => setIsExpanded(!isExpanded)} className={styles.toggleButton}>
                {isExpanded ? 'Show Less' : 'See Full History'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GlucoseLog;