import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExportReportModal = ({ isOpen, onClose }) => {
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
      const response = await axios.get(`/export/dates?range=${range}`);
      setAvailableDates(response.data.dates);
      setSelectedDates(response.data.dates);
    } catch (err) {
      console.error("Error fetching dates:", err);
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
    if (selectedDates.length === availableDates.length) {
      setSelectedDates([]);
    } else {
      setSelectedDates([...availableDates]);
    }
  };


  const handleExport = async () => {
    if (selectedDates.length === 0) return alert("Please select at least one date.");
    
    setExporting(true);
    try {
      const response = await axios.post('/export/generate', 
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
        <h3>Export Health Report</h3>
        
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
            <button onClick={handleSelectAll}>
              {selectedDates.length === availableDates.length ? 'Unselect All' : 'Select All'}
            </button>
            <span>{selectedDates.length} days selected</span>
          </div>

          {loading ? (
            <p>Loading available dates...</p>
          ) : (
            <div className="date-list">
              {availableDates.map(date => (
                <label key={date} className="date-item">
                  <input 
                    type="checkbox" 
                    checked={selectedDates.includes(date)} 
                    onChange={() => handleToggleDate(date)} 
                  />
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </label>
              ))}
              {availableDates.length === 0 && <p>No data found for this period.</p>}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={exporting}>Cancel</button>
          <button 
            className="btn-primary" 
            onClick={handleExport} 
            disabled={exporting || selectedDates.length === 0}
          >
            {exporting ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .export-modal { background: white; padding: 25px; border-radius: 12px; width: 400px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .range-selector { margin-bottom: 20px; }
        .range-selector select { width: 100%; padding: 8px; margin-top: 5px; border-radius: 6px; border: 1px solid #ddd; }
        .date-checklist { flex: 1; overflow-y: auto; border: 1px solid #eee; border-radius: 8px; padding: 10px; margin-bottom: 20px; }
        .checklist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.9em; }
        .date-list { display: flex; flex-direction: column; gap: 8px; }
        .date-item { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 4px 0; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
        .btn-primary { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
        .btn-primary:disabled { background: #bdc3c7; }
        .btn-secondary { background: #eee; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default ExportReportModal;