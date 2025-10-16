import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../components/Header";
import { getPostById } from "../utils/api_posts";
import { toggleLike } from "../utils/api_likes";
import { usePosts } from "../context/postContext";
import {
  getCommentsByPost,
  addComment,
  deleteComment,
} from "../utils/api_comments";

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cookies] = useCookies(["currentuser"]);
  const { currentuser = {} } = cookies;
  const { token = "", _id: userId = "", name: userName = "" } = currentuser;

  const { posts, updatePost } = usePosts();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  // Comment modal
  const [openCommentModal, setOpenCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState("recent");


  // Fetch post + comments
  useEffect(() => {
    const loadData = async () => {
      try {
        let currentPost = posts.find((p) => p._id === id);
        if (!currentPost) {
          currentPost = await getPostById(id);
        }
        setPost(currentPost);
        setLoading(false);

        const fetchedComments = await getCommentsByPost(id);
        setComments(fetchedComments);
      } catch (err) {
        toast.error("Failed to load post or comments");
      }
    };
    loadData();
  }, [id, posts]);

  // Like handler
  const handleLike = async () => {
    if (!token) return toast.error("Login required");
    try {
      const res = await toggleLike(id, "Post", token);
      if (!post) return;
      const updatedPost = {
        ...post,
        likes: res.liked
          ? [...(post.likes || []), userId]
          : (post.likes || []).filter((l) => l !== userId),
      };
      setPost(updatedPost);
      updatePost(updatedPost);
    } catch {
      toast.error("Failed to toggle like");
    }
  };

  // Add comment handler (calls backend)
  const handleAddComment = async () => {
    if (!token) return toast.error("Login required");
    if (!newComment.trim()) return toast.error("Comment cannot be empty");

    try {
      const newC = await addComment(id, newComment, token);
      setComments((prev) => [newC, ...prev]); // prepend newest comment
      setNewComment("");
      setOpenCommentModal(false);
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment");
    }
  };
  

  if (loading)
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );

  if (!post)
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography>Post not found.</Typography>
      </Container>
    );

  // 🗑️ Delete comment handler
  const handleDeleteComment = async (commentId) => {
    if (!token) return toast.error("Login required");
    try {
      await deleteComment(commentId, token);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted!");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  // 🧡 Toggle like on a comment
 const handleLikeComment = async (commentId) => {
   if (!token) return toast.error("Login required");

   try {
     // toggle like on backend
     const res = await toggleLike(commentId, "Comment", token);

     // 1️⃣ Local instant UI feedback (optimistic update)
     setComments((prev) =>
       prev.map((c) =>
         c._id === commentId
           ? {
               ...c,
               likes: res.liked
                 ? [...(c.likes || []), userId]
                 : (c.likes || []).filter((id) => id !== userId),
             }
           : c
       )
     );

     // 2️⃣ Refresh comment list with the current sort option
     const updatedComments = await getCommentsByPost(id, sortBy);
     setComments(updatedComments);
   } catch (error) {
     console.error(error);
     toast.error("Failed to like comment");
   }
 };


  return (
    <>
      <Header />

      {/* Floating Back Button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "fixed",
          top: 80,
          left: 30,
          bgcolor: "#fff",
          border: "1px solid #e0d7cc",
          boxShadow: 2,
          "&:hover": { bgcolor: "#f8f5f0" },
          zIndex: 1000,
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        {/* Author Info */}
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${
              post.user?.name || "Anonymous"
            }`}
            alt={post.user?.name || "Anonymous"}
            sx={{ width: 40, height: 40, mr: 1 }}
          />
          <Box>
            <Typography fontWeight="600" color="#4b2e1e">
              {post.user?.name || "Anonymous"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(post.createdAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Title */}
        <Typography variant="h4" fontWeight={700} mb={2}>
          {post.title}
        </Typography>

        {/* Image */}
        {post.images?.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 2,
              mb: 3,
            }}
          >
            {post.images.map((img, index) => (
              <Box
                key={index}
                component="img"
                src={`http://localhost:3000${img}`}
                alt={`${post.title}-${index}`}
                sx={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 2,
                  border: "2px solid #8b5e34", // outline
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Description */}
        <Typography variant="body1" sx={{ mb: 3 }}>
          {post.description}
        </Typography>

        {/* Actions */}
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            color={post.likes?.includes(userId) ? "error" : "default"}
            onClick={handleLike}
          >
            <FavoriteIcon />
          </IconButton>
          <Typography>{post.likes?.length || 0}</Typography>

          <IconButton onClick={() => setOpenCommentModal(true)}>
            <ChatBubbleOutlineIcon />
          </IconButton>
          <Typography>{comments.length}</Typography>
        </Box>
        <hr />

        {/* Comments Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Comments</Typography>

          <select
            value={sortBy}
            onChange={async (e) => {
              const newSort = e.target.value;
              setSortBy(newSort);
              const sorted = await getCommentsByPost(id, newSort);
              setComments(sorted);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="likes">Most Liked</option>
          </select>
        </Box>

        {comments.length > 0 && (
          <Box mt={3}>
            {comments.map((c) => (
              <Box
                key={c._id}
                sx={{
                  mb: 2,
                  p: 1.5,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  position: "relative",
                }}
              >
                {/* 🧍 User info */}
                <Box display="flex" alignItems="center" mb={0.5}>
                  <Avatar
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                      c.user?.name || "Anonymous"
                    }`}
                    sx={{ width: 30, height: 30, mr: 1 }}
                  />
                  <Typography fontWeight="600" fontSize="0.9rem">
                    {c.user?.name || "Anonymous"}
                    {c.user?._id === post.user?._id && (
                      <Box
                        component="span"
                        sx={{
                          bgcolor: "#3d2617",
                          color: "#fff",
                          px: 1,
                          py: 0.1,
                          borderRadius: 1,
                          fontSize: "0.7rem",
                          ml: 0.5,
                        }}
                      >
                        OP
                      </Box>
                    )}
                  </Typography>

                  {(c.user?._id === userId || currentuser.role === "admin") && (
                    <IconButton
                      size="small"
                      sx={{
                        ml: "auto",
                      }}
                      color="error"
                      onClick={() => handleDeleteComment(c._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="body2">{c.content}</Typography>

                  <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                    <IconButton
                      size="small"
                      color={c.likes?.includes(userId) ? "error" : "default"}
                      onClick={() => handleLikeComment(c._id)}
                    >
                      <FavoriteIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2">
                      {c.likes?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Container>

      {/* Comment Modal */}
      <Dialog
        open={openCommentModal}
        onClose={() => setOpenCommentModal(false)}
      >
        <DialogTitle>Add a Comment</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            minRows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCommentModal(false)}>Cancel</Button>
          <Button onClick={handleAddComment} variant="contained">
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostPage;
