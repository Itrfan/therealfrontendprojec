import { useEffect, useState } from "react";
import { getReportedPosts, dismissReports } from "../utils/api_reports";
import { updatePost, deletePost } from "../utils/api_posts";
import { useCookies } from "react-cookie";
import { toast } from "sonner";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Stack,
} from "@mui/material";
import {
  Delete,
  Visibility,
  Edit,
  Save,
  Close,
  Flag,
} from "@mui/icons-material";
import Header from "../components/Header";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AdminFlagged = () => {
  const [cookies] = useCookies(["currentuser"]);
  const { token, role } = cookies.currentuser || {};
  const [reports, setReports] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const navigate = useNavigate();

  const loadReports = async () => {
    if (role !== "admin") return;
    try {
      const data = await getReportedPosts(token);
      setReports(data);
    } catch {
      toast.error("Failed to load flagged posts");
    }
  };

  useEffect(() => {
    loadReports();
  }, [token, role]);

  const startEdit = (post) => {
    setEditingId(post._id);
    setEditingTitle(post.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = async (postId) => {
    if (!editingTitle.trim()) return toast.error("Title cannot be empty");
    try {
      await updatePost(postId, { title: editingTitle }, token);
      setReports((prev) =>
        prev.map((r) =>
          r.post._id === postId
            ? { ...r, post: { ...r.post, title: editingTitle } }
            : r
        )
      );
      toast.success("Title updated!");
      cancelEdit();
    } catch {
      toast.error("Failed to update title");
    }
  };

  const handleDismiss = async (postId) => {
    try {
      await dismissReports(postId, token);
      setReports((prev) => prev.filter((r) => r.post._id !== postId));
      toast.success("Reports dismissed");
    } catch {
      toast.error("Failed to dismiss reports");
    }
  };

  const handleDelete = async (postId) => {
    const result = await Swal.fire({
      title: "Delete this post?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deletePost(postId, token);
        setReports((prev) => prev.filter((r) => r.post._id !== postId));
        toast.success("Post deleted");
      } catch {
        toast.error("Failed to delete post");
      }
    }
  };

  return (
    <>
      <Header current="reports" />
      <Container sx={{ mt: 4, mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ color: "#4b2e1e" }}
        >
          🚩 Flagged Posts
        </Typography>

        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 3 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5ede2" }}>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Flags</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">
                      No flagged posts yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map(({ post, count }) => (
                  <TableRow key={post._id} hover>
                    <TableCell>
                      {editingId === post._id ? (
                        <TextField
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          size="small"
                          fullWidth
                        />
                      ) : (
                        post.title
                      )}
                    </TableCell>
                    <TableCell>
                      {post.description.length > 80
                        ? post.description.slice(0, 80) + "..."
                        : post.description}
                    </TableCell>
                    <TableCell>
                      <Flag fontSize="small" sx={{ mr: 0.5 }} />
                      {count}
                    </TableCell>
                    <TableCell align="right">
                      {editingId === post._id ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <IconButton
                            color="success"
                            onClick={() => saveEdit(post._id)}
                          >
                            <Save />
                          </IconButton>
                          <IconButton color="error" onClick={cancelEdit}>
                            <Close />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <IconButton
                            color="warning"
                            onClick={() => handleDismiss(post._id)}
                          >
                            <Flag />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(post._id)}
                          >
                            <Delete />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/post/${post._id}`)}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => startEdit(post)}
                          >
                            <Edit />
                          </IconButton>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
};

export default AdminFlagged;
