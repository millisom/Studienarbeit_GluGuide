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


  const getAssociatedMealName = (mealId) => {
    if (!mealId) return null;
    const meal = allUserMeals.find(m => m.meal_id === parseInt(mealId, 10));
    if (!meal) return "Unknown Meal";
    
    const typeStr = meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1).toLowerCase();
    const timeStr = new Date(meal.meal_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${typeStr} (${timeStr})`;
  };

  return (
    <div className={styles.glucoseLogContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto', gap: '30px' }}>
      
      {/* 1. TOP: LOGGING FORM */}
      <div className={styles.loggingFormContainer} style={{ width: '100%', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '20px' }}>Log Your Glucose Level</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label>Date:</label>
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required style={{ width: '100%' }} />
            </div>
            
            <div className={styles.inputField} style={{ flex: 1 }}>
              <label>Time:</label>
              <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required style={{ width: '100%' }} />
            </div>
          </div>
          
          <div className={styles.inputField}>
            <label>Reading Type:</label>
            <select 
              value={formData.reading_type} 
              onChange={(e) => setFormData({...formData, reading_type: e.target.value})}
              required
              style={{ width: '100%' }}
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
                style={{ width: '100%' }}
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
            <input type="number" step="0.01" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} required style={{ width: '100%' }} />
          </div>
          
          <button type="submit" className={styles.submitButton} style={{ width: '100%', marginTop: '10px' }}>Log Glucose</button>
        </form>
        
        {error && <p className={styles.errorMessage} style={{ textAlign: 'center', marginTop: '15px' }}>{error}</p>}
        {successMessage && <p className={styles.successMessage} style={{ textAlign: 'center', marginTop: '15px' }}>{successMessage}</p>}
      </div>


      <div style={{ width: '100%', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Glucose History</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: '500', color: '#64748b' }}>Filter:</span>
            <select onChange={(e) => setFilter(e.target.value)} value={filter} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <option value="24hours">Last 24 Hours</option>
              <option value="1week">Last Week</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>


        <div className={styles.chartWrapper} style={{ marginBottom: '30px' }}>
          <GlucoseChart logs={logs} filter={filter} />
        </div>
        

        <div className={styles.glucoseLogsListContainer}>
          <table className={styles.glucoseLogsTable} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              <tr>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Time</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Associated Meal</th>
                <th style={{ padding: '12px' }}>Level</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{new Date(log.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{log.time.slice(0, 5)}</td>
                  <td style={{ padding: '12px' }}>{formatReadingType(log.reading_type)}</td>
                  

                  <td style={{ padding: '12px', color: '#64748b', fontSize: '0.9rem' }}>
                    {getAssociatedMealName(log.meal_id) || '-'}
                  </td>
                  
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    {editingLogId === log.id ? (
                      <input type="number" value={editedLevel} onChange={(e) => setEditedLevel(e.target.value)} className={styles.editInput} style={{ width: '70px' }} />
                    ) : (
                      `${Number(log.glucose_level)} mg/dL`
                    )}
                  </td>

                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div className={styles.actionButtonsWrapper} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      {editingLogId === log.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(log.id)} className={styles.saveButton} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>Save</button>
                          <button onClick={() => setEditingLogId(null)} className={styles.cancelButton} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingLogId(log.id); setEditedLevel(log.glucose_level); }} className={styles.editButton} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>Edit</button>
                          <button onClick={() => handleDeleteLog(log.id)} className={styles.deleteButton} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {logs.length > 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
              <button onClick={() => setIsExpanded(!isExpanded)} className={styles.toggleButton} style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
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