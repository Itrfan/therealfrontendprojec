import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Avatar,
  Button,
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  CardContent,
  IconButton,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FlagIcon from "@mui/icons-material/Flag";
import DeleteIcon from "@mui/icons-material/Delete";
import { API_URL } from "../utils/constants";


import Header from "../components/Header";
import { getUserById, updateUser } from "../utils/api_users";
import { getPosts } from "../utils/api_posts";

const Profile = () => {
  const { userId: profileId } = useParams();
  const [cookies] = useCookies(["currentuser"]);
  const { currentuser = {} } = cookies;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(profileId);
        setUser(res);
        setBioInput(res.bio || "");
      } catch {
        toast.error("Failed to load user");
      }
    };
    fetchUser();
  }, [profileId]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getPosts("all", 1);
        const userPosts = res.filter((p) => p.user && p.user._id === profileId);
        setPosts(userPosts);
      } catch {
        toast.error("Failed to load posts");
      }
    };
    fetchPosts();
  }, [profileId]);

  const handleBioSave = async () => {
    if (bioInput.length > 50) {
      toast.error("Bio cannot exceed 50 characters");
      return;
    }
    try {
      const updated = await updateUser(
        profileId,
        { bio: bioInput },
        currentuser.token
      );
      setUser(updated);
      setEditingBio(false);
      toast.success("Bio updated!");
    } catch {
      toast.error("Failed to update bio");
    }
  };

  const handleLike = (postId) => {
    // TODO: implement like functionality
  };
  const handleReport = (postId) => {
    // TODO: implement report functionality
  };
  const handleDelete = (postId) => {
    // TODO: implement delete functionality
  };

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <>
      <Header current="profile" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" gap={4}>
          {/* Left column: posts */}
          <Box flex={3}>
            <Typography variant="h5" fontWeight={600} mb={2}>
              {user.name}'s Posts
            </Typography>

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
                          component={Link}
                          to={`/profile/${post.user._id}`}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
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

                  <Typography
                    variant="h6"
                    sx={{ color: "#3d2617", fontWeight: 600, mb: 1 }}
                  >
                    {post.title}
                  </Typography>

                  {post.images?.length > 0 && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: 1.5,
                        mb: 2,
                      }}
                    >
                      {post.images.map((img, index) => (
                        <Box
                          key={index}
                          component="img"
                          src={`${API_URL}${img}`}
                          alt={`${post.title}-${index}`}
                          sx={{
                            width: "100%",
                            height: 150,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "2px solid #8b5e34",
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
                        size="small"
                        onClick={() => handleLike(post._id)}
                      >
                        <FavoriteIcon fontSize="small" />
                        <Typography variant="caption" ml={0.5}>
                          {post.likes?.length || 0}
                        </Typography>
                      </IconButton>

                      <IconButton
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

                    {(currentuser.role === "admin" ||
                      currentuser._id === post.user?._id) && (
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
          </Box>

          {/* Right sidebar */}
          <Box flex={1}>
            <Paper sx={{ p: 3 }}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={2}
              >
                <Avatar
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  alt={user.name}
                  sx={{ width: 80, height: 80 }}
                />
                <Typography variant="h6" fontWeight={600}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle2" fontWeight={500} mb={1}>
                  Bio
                </Typography>

                {currentuser._id === user._id ? (
                  editingBio ? (
                    <Box display="flex" gap={1}>
                      <TextField
                        value={bioInput}
                        onChange={(e) =>
                          setBioInput(e.target.value.slice(0, 50))
                        }
                        size="small"
                        fullWidth
                        placeholder="Write a bio (max 50 chars)"
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleBioSave}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setEditingBio(false);
                          setBioInput(user.bio || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {user.bio || "No bio yet"}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setEditingBio(true)}
                      >
                        Edit
                      </Button>
                    </Box>
                  )
                ) : (
                  <Typography variant="body2">
                    {user.bio || "No bio yet"}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Profile;
