import { useState, useEffect } from "react";
import axiosInstance from '../api/axiosConfig';
import CreateComment from "./createComment";
import CommentsList from "./fetchComments";
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext'; 

const CommentsSection = ({ postId }) => {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");


  const fetchComments = async () => {
    try {
      const response = await axiosInstance.get(
        `/comments/${postId}`,
        {
          withCredentials: true,
        }
      );
      setComments(response.data.comments || []);
      setError("");
    } catch (error) {
      console.error("Error loading comments:", error);
      setError("Failed to load comments");
      setComments([]);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCommentCreated = () => {
    fetchComments();
  };

  
  const currentUserId = user ? (user.id || user.userId) : null;

  return (
    <div style={{ marginTop: "20px" }}>
      <CreateComment 
        postId={postId} 
        onCommentCreated={handleCommentCreated} 
        hasExistingComments={comments && comments.length > 0}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <CommentsList
        comments={comments}
        currentUserId={currentUserId} 
        isAdmin={isAdmin}             
        refreshComments={fetchComments}
      />
    </div>
  );
};

CommentsSection.propTypes = {
  postId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
};

export default CommentsSection;