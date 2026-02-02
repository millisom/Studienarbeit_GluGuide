import PropTypes from 'prop-types';
import styles from '../styles/ViewBlogEntries.module.css';

const PostTags = ({ tags, selectedTags = [], setSelectedTags }) => {
  if (!Array.isArray(tags) || tags.length === 0) return null;

 
  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className={styles.tagsContainer}>
      {tags.map((tag, index) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button 
            key={`${tag}-${index}`} 
            className={`${styles.tagItem} ${isSelected ? styles.selectedTagInCard : ''}`}
            onClick={(e) => handleTagClick(e, tag)}
            aria-pressed={isSelected}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

PostTags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedTags: PropTypes.arrayOf(PropTypes.string),
  setSelectedTags: PropTypes.func.isRequired,
};

export default PostTags;