import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { toast } from "sonner";

import Header from "../../components/Header";
import { login } from "../../utils/api_auth";

const Login = () => {
  const navigate = useNavigate();
  const [, setCookie] = useCookies(["currentuser"]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userData = await login(email.trim(), password.trim());

      // Save user data to cookies (8-hour expiry)
      setCookie("currentuser", userData, { maxAge: 60 * 60 * 8 });

      toast.success("✅ Logged in successfully!");
      navigate("/"); // redirect to posts or homepage
    } catch (error) {
      console.error(error);
      // Safely extract backend error message
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header current="login" />
      <Container maxWidth="sm">
        <Typography variant="h3" align="center" mb={3} mt={4}>
          Login to Your Account
        </Typography>

        <Box mb={2}>
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>

        <Box mb={2}>
          <TextField
            type="password"
            label="Password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleFormSubmit}
          disabled={loading}
          sx={{
            bgcolor: "#8b5e34",
            "&:hover": {
              bgcolor: "#75491f", // slightly darker for hover
            },
          }}
        >
          {loading ? "Logging in..." : "Submit"}
        </Button>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Don’t have an account?{" "}
            <Button onClick={() => navigate("/signup")}>Sign Up</Button>
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default Login;
