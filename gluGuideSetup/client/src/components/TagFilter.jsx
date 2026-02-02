import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import styles from '../styles/ViewBlogEntries.module.css';

const TagFilter = ({ 
  tagOptions, 
  selectedTags, 
  handleTagMultiSelectChange, 
  handleTagRemove, 
  clearAllTags 
}) => {
  const selectedValues = tagOptions.filter(option => selectedTags.includes(option.value));

  return (
    <div className={styles.tagFilterSection}>
      <h4 className={styles.filterTitle}>Filter by Tags:</h4>
      <Select
        isMulti
        options={tagOptions}
        value={selectedValues}
        onChange={handleTagMultiSelectChange}
        placeholder="Select tags..."
        classNamePrefix="react-select"
        className={styles.tagSelectDropdown}
      />

      {selectedTags.length > 0 && (
        <div className={styles.selectedTagsList}>
          <span className={styles.selectedTagsTitle}>Active Filters:</span>
          {selectedTags.map(tag => (
            <span key={tag} className={styles.selectedTagItem}>
              {tag}
              <button 
                onClick={() => handleTagRemove(tag)} 
                className={styles.removeTagButton}
                aria-label={`Remove ${tag} filter`}
              >
                <FontAwesomeIcon icon={faTimes} size="xs" />
              </button>
            </span>
          ))}
          <button onClick={clearAllTags} className={styles.clearAllButton}>
            Clear All Tags
          </button>
        </div>
      )}
    </div>
  );
};

export default TagFilter;