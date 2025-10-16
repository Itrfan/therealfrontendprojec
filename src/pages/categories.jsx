import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";
import { Edit, Delete, Save, Close } from "@mui/icons-material";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useCookies } from "react-cookie";
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} from "../utils/api_categories";
import Header from "../components/Header";

const Categories = () => {
  const [cookies] = useCookies(["currentuser"]);
  const { currentuser = {} } = cookies;
  const { token = "" } = currentuser;

  const [categories, setCategories] = useState([]);
  const [label, setLabel] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async () => {
    if (!label.trim()) return toast.error("Please enter a category name");
    try {
      await addCategory(label, token);
      setLabel("");
      toast.success("Category added!");
      loadCategories();
    } catch {
      toast.error("Failed to add category");
    }
  };

const handleDelete = async (id) => {
  Swal.fire({
    title: "Delete this category?",
    text: "You can only delete empty categories.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then(async (res) => {
    if (res.isConfirmed) {
      try {
        await deleteCategory(id, token);
        toast.success("Category deleted");
        loadCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete category");
      }
    }
  });
};

  const handleEdit = (id, currentLabel) => {
    setEditingId(id);
    setEditingLabel(currentLabel);
  };

  const handleSaveEdit = async (id) => {
    if (!editingLabel.trim()) return toast.error("Name cannot be empty");
    try {
      await updateCategory(id, editingLabel, token);
      toast.success("Category updated!");
      setEditingId(null);
      loadCategories();
    } catch {
      toast.error("Failed to update category");
    }
  };

  return (
    <>
      <Header current="categories" />
      <Container sx={{ mt: 4, mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ color: "#4b2e1e" }}
        >
          Manage Categories
        </Typography>

        {/* Add Category Section */}
        <Box
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: "#fffaf3",
          }}
        >
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="New Category"
              variant="outlined"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              sx={{
                px: 3,
                borderRadius: 2,
                backgroundColor: "#4b2e1e",
                "&:hover": { backgroundColor: "#6b3b1f" },
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>

        {/* Table Section */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5ede2" }}>
                <TableCell sx={{ fontWeight: 700 }}>Category Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Typography color="text.secondary">
                      No categories yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => (
                  <TableRow key={c._id} hover>
                    <TableCell>
                      {editingId === c._id ? (
                        <TextField
                          value={editingLabel}
                          onChange={(e) => setEditingLabel(e.target.value)}
                          size="small"
                          fullWidth
                        />
                      ) : (
                        <Typography variant="body1">{c.label}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {editingId === c._id ? (
                        <>
                          <IconButton
                            color="success"
                            onClick={() => handleSaveEdit(c._id)}
                          >
                            <Save />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => setEditingId(null)}
                          >
                            <Close />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(c._id, c.label)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(c._id)}
                          >
                            <Delete />
                          </IconButton>
                        </>
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

export default Categories;
