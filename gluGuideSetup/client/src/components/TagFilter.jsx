import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import styles from '../styles/ViewBlogEntries.module.css';
import { useTranslation } from 'react-i18next';

const TagFilter = ({ 
  tagOptions, 
  selectedTags, 
  handleTagMultiSelectChange, 
  handleTagRemove, 
  clearAllTags 
}) => {
  const { t } = useTranslation();
  const selectedValues = tagOptions.filter(option => selectedTags.includes(option.value));

  return (
    <div className={styles.tagFilterSection}>
      <h4 className={styles.filterTitle}>{t('tagFilter.title')}</h4>
      <Select
        isMulti
        options={tagOptions}
        value={selectedValues}
        onChange={handleTagMultiSelectChange}
        placeholder={t('tagFilter.placeholder')}
        classNamePrefix="react-select"
        className={styles.tagSelectDropdown}
      />

      {selectedTags.length > 0 && (
        <div className={styles.selectedTagsList}>
          <span className={styles.selectedTagsTitle}>{t('tagFilter.activeFilters')}</span>
          {selectedTags.map(tag => (
            <span key={tag} className={styles.selectedTagItem}>
              {tag}
              <button 
                onClick={() => handleTagRemove(tag)} 
                className={styles.removeTagButton}
                aria-label={t('tagFilter.ariaRemove', { tag })}
              >
                <FontAwesomeIcon icon={faTimes} size="xs" />
              </button>
            </span>
          ))}
          <button onClick={clearAllTags} className={styles.clearAllButton}>
            {t('tagFilter.clearAll')}
          </button>
        </div>
      )}
    </div>
  );
};

export default TagFilter;