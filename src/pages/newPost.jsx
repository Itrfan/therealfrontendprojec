import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createPost } from "../utils/api_posts";
import { getCategories } from "../utils/api_categories";
import Header from "../components/Header";
Header
import { API_URL } from "../utils/constants";


const NewPost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // ✅ renamed from content
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]); // changed from single image

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [cookies] = useCookies(["currentuser"]);
  const navigate = useNavigate();
  const token = cookies?.currentuser?.token;

  // 🧠 Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        console.log("Fetched categories:", data);
        setCategories(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

 

  // 🚀 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      images.forEach((img) => formData.append("images", img)); // append multiple images

     await createPost(title, description, category, images, token);
 // send FormData
      toast.success("Post created successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

 const handleImageChange = (e) => {
   const files = Array.from(e.target.files);

   // Optional: limit total images or size
   if (files.some((f) => f.size > 3 * 1024 * 1024)) {
     toast.error("Each image must be under 3MB");
     return;
   }

   setImages(files);
 };

  return (
    <>
      <Header current="posts" />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#F8F4EF",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          py: 6,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(200, 180, 160, 0.3)",
            borderRadius: "16px",
            p: 4,
            width: "100%",
            maxWidth: "650px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              textAlign: "center",
              fontFamily: "'Cormorant Garamond', serif",
              color: "#5A4034",
              fontWeight: 600,
            }}
          >
            write something performative 🪶
          </Typography>

          {/* 📝 Title */}
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FDFBF9",
                borderRadius: "10px",
              },
            }}
          />

          {/* 🏷️ Category */}
          <TextField
            select
            label="Category"
            variant="outlined"
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FDFBF9",
                borderRadius: "10px",
              },
            }}
          >
            {categories.length > 0 ? (
              categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Loading...</MenuItem>
            )}
          </TextField>

          {/* ✍️ Description */}
          <TextField
            label="Description"
            variant="outlined"
            multiline
            minRows={5}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#FDFBF9",
                borderRadius: "10px",
              },
            }}
          />

          {/* 🖼️ Image Upload */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: "#7B6F66" }}>
              Upload Image (optional)
            </Typography>
            <input
              type="file"
              accept="images"
              multiple
              onChange={handleImageChange} 
            />
            {images.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {images.map((img, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={URL.createObjectURL(img)}
                    alt={`preview-${i}`}
                    sx={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 2,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* 🚀 Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: "#5A4034",
              color: "#F8EBD8",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              borderRadius: "10px",
              py: 1.2,
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: "0 4px 10px rgba(90,64,52,0.2)",
              "&:hover": {
                backgroundColor: "#7A5848",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#F8EBD8" }} />
            ) : (
              "Publish Post"
            )}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default NewPost;
