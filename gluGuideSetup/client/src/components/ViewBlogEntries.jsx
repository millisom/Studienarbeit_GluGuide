import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosConfig';
import TagFilter from './TagFilter';
import PostCard from './PostCard';
import styles from '../styles/ViewBlogEntries.module.css';
import { useBlogPosts } from '../hooks/useBlogPosts'; 

const ViewBlogEntries = () => {
  const { 
    posts, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    selectedTags, 
    setSelectedTags, 
    availableTags 
  } = useBlogPosts();

  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axiosInstance.get('/status', { withCredentials: true });
        setIsAdmin(res.data.is_admin);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    checkAdmin();
  }, []);

  const handleViewClick = (id) => navigate(`/blogs/view/${id}`);
  
  const handleAdminDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
        try {
            await axiosInstance.delete(`/deletePost/${id}`, { withCredentials: true });
            alert('Post deleted.');
            window.location.reload(); 
        } catch (error) {
            alert('Failed to delete.');
        }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.viewBlogEntries}>
      <h2 className={styles.title}>Explore Blog Entries</h2>

      <div className={styles.filterContainer}>
        <input 
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        
        <TagFilter 
          tagOptions={availableTags}
          selectedTags={selectedTags}
          selectedTagValues={availableTags.filter(t => selectedTags.includes(t.value))}
          handleTagMultiSelectChange={(options) => setSelectedTags(options ? options.map(o => o.value) : [])}
          handleTagRemove={(tag) => setSelectedTags(prev => prev.filter(t => t !== tag))}
          clearAllTags={() => setSelectedTags([])}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>} 

      {posts.length === 0 && !error ? (
        <p className={styles.noPostsFound}>No posts match your search or filters.</p>
      ) : (
        <div className={styles.postContainer}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              handleViewClick={handleViewClick}
              handleAdminDelete={handleAdminDelete}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewBlogEntries;