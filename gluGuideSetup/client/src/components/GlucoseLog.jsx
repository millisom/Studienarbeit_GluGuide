import React, { useState, useEffect } from 'react';
import { useGlucoseData } from '../hooks/useGlucoseData';
import { getAllMealsForUser } from '../api/mealApi'; 
import GlucoseChart from './GlucoseChart';
import styles from '../styles/GlucoseLog.module.css';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const GlucoseLog = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
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
      let typeKey = meal.meal_type.toLowerCase();
      let displayName = t(`glucoseLog.types.${typeKey}`, { defaultValue: meal.meal_type });
      
      if (typeKey === 'snack') {
        displayName = `${t('glucoseLog.types.snack')} ${snackCount}`;
        snackCount++;
      }

      const timeStr = new Date(meal.meal_time).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
      
      return {
        ...meal,
        dropdownName: `${displayName} (${timeStr})`
      };
    });

    setDropdownMeals(formattedMeals);
    setFormData(prev => ({...prev, meal_id: ''}));

  }, [formData.date, allUserMeals, t, i18n.language]);

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
    if (!userId) return alert(t('glucoseLog.alerts.login'));
    if (parseFloat(formData.level) <= 0) {
      alert(t('glucoseLog.alerts.validLevel'));
      return;
    }

    if (formData.reading_type === '1h_post_meal' || formData.reading_type === '2h_post_meal') {
      const selectedMeal = dropdownMeals.find(m => m.meal_id === parseInt(formData.meal_id, 10));
      
      if (selectedMeal && selectedMeal.meal_time) {
        const glucoseTime = new Date(`${formData.date}T${formData.time}`);
        const mealTime = new Date(selectedMeal.meal_time);
        const diffInMinutes = (glucoseTime - mealTime) / (1000 * 60);

        if (diffInMinutes < 0) {
          alert(t('glucoseLog.alerts.timeBeforeMeal'));
          return;
        }

        if (formData.reading_type === '1h_post_meal' && diffInMinutes < 50) {
          alert(t('glucoseLog.alerts.wait1h'));
          return;
        }

        if (formData.reading_type === '2h_post_meal' && diffInMinutes < 110) {
          alert(t('glucoseLog.alerts.wait2h'));
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
    if (window.confirm(t('glucoseLog.alerts.deleteConfirm'))) {
      await deleteLog(logId);
    }
  };

  if (authLoading) return <div className={styles.container}><p>{t('glucoseLog.checkingAuth')}</p></div>;
  if (!user) return <div className={styles.container}><p>{t('glucoseLog.loginPrompt')}</p></div>;

  const displayedLogs = isExpanded ? logs : logs.slice(-3);

  const formatReadingType = (type) => {
    return t(`glucoseLog.types.${type}`, { defaultValue: type });
  };

  const getAssociatedMealName = (mealId) => {
    if (!mealId) return null;
    const meal = allUserMeals.find(m => m.meal_id === parseInt(mealId, 10));
    if (!meal) return t('glucoseLog.unknownMeal');
    
    let typeKey = meal.meal_type.toLowerCase();
    const typeStr = t(`glucoseLog.types.${typeKey}`, { defaultValue: meal.meal_type });
    const timeStr = new Date(meal.meal_time).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
    return `${typeStr} (${timeStr})`;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>{t('glucoseLog.pageTitle')}</h1>

      <div className={styles.formOuterContainer}>
        <div className={styles.formInnerRectangle}>
          <h2 className={styles.sectionTitle}>{t('glucoseLog.sectionTitle')}</h2>
          
          <form onSubmit={handleSubmit} className={styles.formWrapper}>
            <div className={styles.inputRow}>
              <div className={styles.inputField}>
                <label>{t('glucoseLog.labelDate')}</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required className={styles.input} />
              </div>
              <div className={styles.inputField}>
                <label>{t('glucoseLog.labelTime')}</label>
                <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} required className={styles.input} />
              </div>
            </div>
            
            <div className={styles.inputField}>
              <label>{t('glucoseLog.labelType')}</label>
              <select 
                value={formData.reading_type} 
                onChange={(e) => setFormData({...formData, reading_type: e.target.value})}
                required
                className={styles.input}
              >
                <option value="fasting">{t('glucoseLog.types.fasting')}</option>
                <option value="1h_post_meal">{t('glucoseLog.types.1h_post_meal')}</option>
                <option value="2h_post_meal">{t('glucoseLog.types.2h_post_meal')}</option>
                <option value="random">{t('glucoseLog.types.random')}</option>
              </select>
            </div>

            {(formData.reading_type === '1h_post_meal' || formData.reading_type === '2h_post_meal') && (
              <div className={styles.inputField}>
                <label>{t('glucoseLog.labelSelectMeal')}</label>
                <select 
                  value={formData.meal_id} 
                  onChange={(e) => setFormData({...formData, meal_id: e.target.value})}
                  required 
                  className={styles.input}
                >
                  <option value="">{t('glucoseLog.chooseMeal')}</option>
                  {dropdownMeals.length > 0 ? (
                    dropdownMeals.map(meal => (
                      <option key={meal.meal_id} value={meal.meal_id}>
                        {meal.dropdownName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>{t('glucoseLog.noMeals')}</option>
                  )}
                </select>
              </div>
            )}

            <div className={styles.inputField}>
              <label>{t('glucoseLog.labelLevel')}</label>
              <input type="number" step="0.01" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} required className={styles.input} />
            </div>
            
            <button type="submit" className={styles.submitButton}>{t('glucoseLog.btnSubmit')}</button>
          </form>
          
          {error && <p className={styles.errorMessage}>{error}</p>}
          {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
        </div>
      </div>

      <div className={styles.historySection}>
        <div className={styles.filterHeader}>
          <h3 className={styles.filterTitle}>{t('glucoseLog.historyTitle')}</h3>
          <div className={styles.filterControls}>
            <span className={styles.filterLabel}>{t('glucoseLog.filterLabel')}</span>
            <select onChange={(e) => setFilter(e.target.value)} value={filter} className={styles.input} style={{ width: 'auto', padding: '6px 12px' }}>
              <option value="24hours">{t('glucoseLog.filters.24hours')}</option>
              <option value="1week">{t('glucoseLog.filters.1week')}</option>
              <option value="all">{t('glucoseLog.filters.all')}</option>
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
                <th>{t('glucoseLog.table.date')}</th>
                <th>{t('glucoseLog.table.time')}</th>
                <th>{t('glucoseLog.table.type')}</th>
                <th>{t('glucoseLog.table.meal')}</th>
                <th>{t('glucoseLog.table.level')}</th>
                <th className={styles.textCenter}>{t('glucoseLog.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.date).toLocaleDateString(i18n.language)}</td>
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
                          <button onClick={() => handleSaveEdit(log.id)} className={styles.saveButton}>{t('glucoseLog.actions.save')}</button>
                          <button onClick={() => setEditingLogId(null)} className={styles.cancelButton}>{t('glucoseLog.actions.cancel')}</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingLogId(log.id); setEditedLevel(log.glucose_level); }} className={styles.editButton}>{t('glucoseLog.actions.edit')}</button>
                          <button onClick={() => handleDeleteLog(log.id)} className={styles.deleteButton}>{t('glucoseLog.actions.delete')}</button>
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
                {isExpanded ? t('glucoseLog.btnShowLess') : t('glucoseLog.btnFullHistory')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlucoseLog;