import React from 'react';
import WorryBox from './WorryBox';
import styles from '../styles/WorryModal.module.css';

const WorryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          &times;
        </button>
        <WorryBox />
      </div>
    </div>
  );
};

export default WorryModal;