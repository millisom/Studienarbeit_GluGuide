import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosConfig';

export const useBlogPosts = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axiosInstance.get('/getAllPosts', { withCredentials: true });
        
        
        const normalizedPosts = response.data.map(post => ({
           ...post,
           tags: Array.isArray(post.tags) ? post.tags : (post.tags ? post.tags.split(',') : [])
        }));
        
        setAllPosts(normalizedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError('Failed to load posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

 
  const filteredPosts = useMemo(() => {
    return allPosts.filter(post => {
      const lowerSearch = searchTerm.toLowerCase();
      
      const matchesSearch = post.title.toLowerCase().includes(lowerSearch) || 
                            post.username.toLowerCase().includes(lowerSearch);
      
     
      const matchesTags = selectedTags.length === 0 || 
                          selectedTags.every(tag => post.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [allPosts, searchTerm, selectedTags]);


  const availableTags = useMemo(() => {
    const tags = new Set();
    allPosts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).map(tag => ({ value: tag, label: tag }));
  }, [allPosts]);

  return { 
    posts: filteredPosts, 
    loading, 
    error, 
    searchTerm, setSearchTerm, 
    selectedTags, setSelectedTags,
    availableTags
  };
};