import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig'; // Ensure you use your axiosInstance

const ExportReportModal = ({ isOpen, onClose }) => {
  // Always initialize with empty arrays []
  const [range, setRange] = useState('month');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDates();
    }
  }, [range, isOpen]);

  const fetchDates = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/export/dates?range=${range}`);
      
      // FIX: Use || [] fallback in case the backend returns something unexpected
      const dates = response.data?.dates || []; 
      setAvailableDates(dates);
      setSelectedDates(dates);
    } catch (err) {
      console.error("Error fetching dates:", err);
      setAvailableDates([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDate = (date) => {
    setSelectedDates(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const handleSelectAll = () => {
    // FIX: Add optional chaining ?. just in case
    if (selectedDates?.length === availableDates?.length) {
      setSelectedDates([]);
    } else {
      setSelectedDates([...availableDates]);
    }
  };

  const handleExport = async () => {
    if (!selectedDates || selectedDates.length === 0) return alert("Please select at least one date.");
    
    setExporting(true);
    try {
      const response = await axiosInstance.post('/export/generate', 
        { selectedDates }, 
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `GluGuide_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="export-modal">
        <div className="modal-header">
           <h3>Export Health Report</h3>
           <button className="close-x" onClick={onClose}>&times;</button>
        </div>
        
        <div className="range-selector">
          <label>Time Period:</label>
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
          </select>
        </div>

        <div className="date-checklist">
          <div className="checklist-header">
            <button className="select-all-btn" onClick={handleSelectAll}>
              {selectedDates?.length === availableDates?.length ? 'Unselect All' : 'Select All'}
            </button>
            <span>{selectedDates?.length || 0} days selected</span>
          </div>

          {loading ? (
            <p className="loading-text">Loading available dates...</p>
          ) : (
            <div className="date-list">
              {availableDates?.map(date => (
                <label key={date} className="date-item">
                  <input 
                    type="checkbox" 
                    checked={selectedDates.includes(date)} 
                    onChange={() => handleToggleDate(date)} 
                  />
                  <span>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </label>
              ))}
              {availableDates?.length === 0 && <p className="no-data">No data found for this period.</p>}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={exporting}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={handleExport} 
            disabled={exporting || !selectedDates || selectedDates.length === 0}
          >
            {exporting ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .export-modal { background: white; padding: 25px; border-radius: 15px; width: 420px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 15px 35px rgba(0,0,0,0.3); color: #333; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .close-x { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
        .range-selector { margin-bottom: 20px; }
        .range-selector label { font-weight: bold; font-size: 0.9em; display: block; margin-bottom: 5px; }
        .range-selector select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ddd; outline: none; }
        .date-checklist { flex: 1; overflow-y: auto; border: 1px solid #eee; border-radius: 10px; padding: 12px; margin-bottom: 20px; background: #fdfdfd; min-height: 150px; }
        .checklist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .select-all-btn { background: #f0f0f0; border: 1px solid #ddd; padding: 5px 12px; border-radius: 5px; font-size: 0.8em; cursor: pointer; }
        .date-list { display: flex; flex-direction: column; gap: 10px; }
        .date-item { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 6px 8px; border-radius: 6px; transition: background 0.2s; }
        .date-item:hover { background: #f5f5f5; }
        .date-item input { width: 18px; height: 18px; cursor: pointer; }
        .no-data { text-align: center; color: #999; padding-top: 20px; font-style: italic; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
        .btn-primary { background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s; }
        .btn-primary:hover:not(:disabled) { background: #219150; }
        .btn-primary:disabled { background: #bdc3c7; cursor: not-allowed; }
        .btn-secondary { background: #f0f0f0; border: 1px solid #ddd; padding: 12px 24px; border-radius: 8px; cursor: pointer; color: #666; }
      `}</style>
    </div>
  );
};

export default ExportReportModal;