import { Link } from "react-router-dom";
import {
  Avatar,
  Button,
  Box,
  Container,
  Typography,
  CardContent,
  IconButton,
  Paper,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import FlagIcon from "@mui/icons-material/Flag";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { API_URL } from "../utils/constants";


import Header from "../components/Header";
import { getPosts, deletePost } from "../utils/api_posts";
import { toggleLike } from "../utils/api_likes";
import { getCategories } from "../utils/api_categories";
import { usePosts } from "../context/postContext";
import { reportPost } from "../utils/api_reports";

const Posts = () => {
  const [cookies] = useCookies(["currentuser"]);
  const { currentuser = {} } = cookies;
  const { token = "", role = "", _id: userId = "" } = currentuser;

  const { posts, setPosts, updatePost } = usePosts();
  const [categories, setCategories] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [topCategories, setTopCategories] = useState([]);
  const [viewType, setViewType] = useState("forYou"); 

  // Fetch posts
  useEffect(() => {
    const catParam =
      selectedCategory === "All" ? "all" : selectedCategory.toLowerCase();

    getPosts(catParam, 1)
      .then((fetchedPosts) => {
        if (viewType === "forYou") {
          // Sort by combined likes + comments
          const popularPosts = [...fetchedPosts].sort(
            (a, b) =>
              (b.likes?.length || 0) +
              (b.comments?.length || 0) -
              ((a.likes?.length || 0) + (a.comments?.length || 0))
          );
          setPosts(popularPosts);
        } else {
          setPosts(fetchedPosts); // default recent order
        }
      })
      .catch(() => toast.error("Failed to load posts"));
  }, [selectedCategory, viewType, setPosts]);


  // Fetch categories
  useEffect(() => {
    getCategories()
      .then((res) => setCategories([{ label: "All" }, ...res]))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete post?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePost(id, token);
          setPosts((prev) => prev.filter((p) => p._id !== id));
          toast.success("Post deleted.");
        } catch {
          toast.error("Failed to delete post");
        }
      }
    });
  };

  const handleLike = async (postId) => {
    try {
      if (!token) return toast.error("Please log in to like posts");

      const res = await toggleLike(postId, "Post", token);
      const updatedPost = posts.find((p) => p._id === postId);
      if (!updatedPost) return;

      const newPost = {
        ...updatedPost,
        likes: res.liked
          ? [...updatedPost.likes, userId]
          : updatedPost.likes.filter((id) => id !== userId),
      };

      updatePost(newPost);
    } catch {
      toast.error("Failed to toggle like");
    }
  };

  const handleReport = async (postId) => {
    if (!token) return toast.error("Login required to report");

    try {
      const res = await reportPost(postId, token);
      if (res.alreadyReported) {
        toast.info("You already reported this post.");
      } else {
        toast.success("Post reported successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to report post");
    }
  };

  useEffect(() => {
    getCategories()
      .then(async (cats) => {
        setCategories(cats);

        // Count posts per category
        const counts = await Promise.all(
          cats.map(async (cat) => {
            const posts = await getPosts(cat.label.toLowerCase(), 1);
            return { ...cat, count: posts.length };
          })
        );

        // Sort descending and take top 2
        const topTwo = counts.sort((a, b) => b.count - a.count).slice(0, 2);
        setTopCategories(topTwo);
      })
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  return (
    <>
      <Header current="posts" />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          bgcolor: "#faf7f3",
          minHeight: "100vh",
          py: 3,
        }}
      >
        <Box
          sx={{ display: "flex", maxWidth: 1200, width: "100%", gap: 2, px: 2 }}
        >
          {/* LEFT SIDEBAR */}
          <Box
            sx={{
              width: 250,
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              alignItems: "center",
              p: 2,
              borderLeft: "1px solid #e0d7cc",
              bgcolor: "#fdfaf5",
              position: "sticky",
              top: 0, // stick to top
              height: "100vh", // full viewport height
              overflowY: "auto", // allow scrolling if content overflows
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontSize: 40,
                fontWeight: 700,
                color: "#4b2e1e",
                letterSpacing: 0.5,
              }}
            >
              🪶
            </Typography>

            <Button
              startIcon={<HomeIcon />}
              component={Link}
              to="/"
              sx={{ mb: 1.5, justifyContent: "flex-start", color: "#4b2e1e" }}
            >
              Home
            </Button>

            <Button
              startIcon={<PersonIcon />}
              component={currentuser._id ? Link : "button"} // only use Link if logged in
              to={currentuser._id ? `/profile/${userId}` : undefined}
              sx={{
                mb: 1.5,
                justifyContent: "flex-start",
                color: currentuser._id ? "#4b2e1e" : "#aaa", // gray if disabled
                pointerEvents: currentuser._id ? "auto" : "none", // unclickable if not logged in
              }}
            >
              Profile
            </Button>

            <Button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              endIcon={categoriesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                mb: 1.5,
                justifyContent: "space-between",
                color: "#4b2e1e",
              }}
            >
              Categories
            </Button>

            <Collapse in={categoriesOpen} sx={{ width: "100%" }}>
              <List dense>
                {categories.map((cat) => (
                  <ListItemButton
                    key={cat._id || cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      bgcolor:
                        selectedCategory === cat.label
                          ? "#8b5e34"
                          : "transparent",
                      color:
                        selectedCategory === cat.label ? "#fff" : "#4b2e1e",
                      "&:hover": {
                        bgcolor:
                          selectedCategory === cat.label
                            ? "#7a4c2b"
                            : "#f5f2ed",
                      },
                    }}
                  >
                    <ListItemText primary={cat.label} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            <Button
              startIcon={<AddCircleOutlineIcon />}
              component={currentuser._id ? Link : "button"} // only a link if logged in
              to={currentuser._id ? "/new" : undefined}
              sx={{
                justifyContent: "flex-start",
                color: currentuser._id ? "#8b5e34" : "#aaa",
                fontWeight: 600,
                mt: 2,
                pointerEvents: currentuser._id ? "auto" : "none", // unclickable
              }}
            >
              New Post
            </Button>
          </Box>

          {/* MAIN CONTENT */}
          <Container
            maxWidth={false}
            sx={{
              flex: 1,
              py: 2,
              px: { xs: 0, sm: 3 },
              borderLeft: { md: "1px solid #e0d7cc" },
              borderRight: { md: "1px solid #e0d7cc" },
              bgcolor: "#fffdfb",
              minHeight: "100vh",
            }}
          >
            <Box display="flex" justifyContent="center" gap={2} mb={3}>
              <Button
                variant={viewType === "forYou" ? "contained" : "text"}
                onClick={() => setViewType("forYou")}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: viewType === "forYou" ? "#8b5e34" : "#fff",
                  color: viewType === "forYou" ? "#fff" : "#4b2e1e",
                  "&:hover": {
                    bgcolor: viewType === "forYou" ? "#7a4c2b" : "#f5f2ed",
                  },
                }}
              >
                For You
              </Button>
              <Button
                variant={viewType === "recent" ? "contained" : "text"}
                onClick={() => setViewType("recent")}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: viewType === "recent" ? "#8b5e34" : "#fff",
                  color: viewType === "recent" ? "#fff" : "#4b2e1e",
                  "&:hover": {
                    bgcolor: viewType === "recent" ? "#7a4c2b" : "#f5f2ed",
                  },
                }}
              >
                Recent
              </Button>
            </Box>
            <hr />

            {posts.length === 0 && (
              <Typography align="center" sx={{ mt: 4 }}>
                No posts yet ☕
              </Typography>
            )}

            {posts.map((post) => (
              <Paper
                key={post._id}
                elevation={0}
                sx={{
                  mb: 2,
                  borderBottom: "1px solid #e0d7cc",
                  borderRadius: 0,
                  bgcolor: "#fff",
                  transition: "background 0.2s",
                  "&:hover": { background: "#fffaf4" },
                }}
              >
                <CardContent sx={{ px: 2, py: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                        post.user?.name || "Anonymous"
                      }`}
                      alt={post.user?.name || "Anonymous"}
                      sx={{ width: 40, height: 40, mr: 1 }}
                    />
                    <Box>
                      {post.user?._id ? (
                        <Typography
                          fontWeight="600"
                          color="#4b2e1e"
                          sx={{
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          component={Link}
                          to={`/profile/${post.user._id}`}
                        >
                          {post.user.name}
                        </Typography>
                      ) : (
                        <Typography fontWeight="600" color="#4b2e1e">
                          Anonymous
                        </Typography>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        {new Date(post.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "#3d2617", fontWeight: 600 }}
                    >
                      {post.title}
                    </Typography>

                    {post.category && (
                      <Box
                        sx={{
                          display: "inline-block",
                          bgcolor: "rgba(90, 64, 52, 0.85)",
                          color: "#fff",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 5,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "rgba(90, 64, 52, 1)",
                            transform: "scale(1.05)",
                          },
                        }}
                        onClick={() => setSelectedCategory(post.category.label)}
                      >
                        {post.category.label || "Uncategorized"}
                      </Box>
                    )}
                  </Box>

                  {post.images?.length > 0 && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: 2,
                        mb: 1.5,
                      }}
                    >
                      {post.images.map((img, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={`${API_URL}/${img}`}
                          alt={`${post.title}-${index}`}
                          sx={{
                            width: "100%",
                            height: 200,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "2px solid #8b5e34", // ✅ outline
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)", // subtle shadow
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
                  <Typography
                    variant="body2"
                    sx={{ mb: 1.5, color: "#4b2e1e" }}
                  >
                    {post.description?.slice(0, 150)}{" "}
                    {post.description?.length > 150 && (
                      <Link
                        to={`/post/${post._id}`}
                        style={{ color: "#8b5e34", fontWeight: 500 }}
                      >
                        Read more
                      </Link>
                    )}
                  </Typography>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <IconButton
                        color={
                          post.likes?.includes(userId) ? "error" : "default"
                        }
                        size="small"
                        onClick={() => handleLike(post._id)}
                      >
                        <FavoriteIcon fontSize="small" />
                        <Typography variant="caption" ml={0.5}>
                          {post.likes?.length || 0}
                        </Typography>
                      </IconButton>

                      <IconButton
                        color="default"
                        size="small"
                        component={Link}
                        to={`/post/${post._id}`}
                      >
                        <ChatBubbleOutlineIcon fontSize="small" />
                        <Typography variant="caption" ml={0.5}>
                          {post.comments?.length || 0}
                        </Typography>
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleReport(post._id)}
                      >
                        <FlagIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {(role === "admin" || userId === post.user?._id) && (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(post._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Paper>
            ))}
          </Container>

          {/* RIGHT SIDEBAR */}
          <Box
            sx={{
              width: 250,
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              alignItems: "center",
              p: 2,
              borderLeft: "1px solid #e0d7cc",
              bgcolor: "#fdfaf5",
              position: "sticky",
              top: 0, // stick to top
              height: "100vh", // full viewport height
              overflowY: "auto", // allow scrolling if content overflows
            }}
          >
            <Typography
              variant="h5"
              fontWeight="700"
              mb={3}
              sx={{ color: "#4b2e1e", textAlign: "center" }}
            >
              Popular Categories
            </Typography>

            {topCategories.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            ) : (
              topCategories.map((cat) => (
                <Button
                  key={cat.label}
                  variant="text"
                  sx={{
                    color: "#8b5e34",
                    textTransform: "none",
                    mb: 1,
                    justifyContent: "flex-start",
                  }}
                  onClick={() => setSelectedCategory(cat.label)}
                >
                  #{cat.label} ({cat.count})
                </Button>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Posts;
