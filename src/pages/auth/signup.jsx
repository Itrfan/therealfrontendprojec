import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { toast } from "sonner";
import validator from "validator";


import Header from "../../components/Header";
import { signup } from "../../utils/api_auth";


const SignUp = () => {
  const navigate = useNavigate();
  const [, setCookie] = useCookies(["currentuser"]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validator.isEmail(email)) {
      toast.error("Please use a valid email address");
      return;
    }


    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userData = await signup(name.trim(), email.trim(), password);

      // Save cookie (8-hour expiry)
      setCookie("currentuser", userData, { maxAge: 60 * 60 * 8 });

      toast.success("🎉 Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Sign up failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header current="signup" />
      <Container maxWidth="sm">
        <Typography variant="h3" align="center" mb={3} mt={4}>
          Create New Account
        </Typography>

        <Box mb={2}>
          <TextField
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Box>

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

        <Box mb={2}>
          <TextField
            type="password"
            label="Confirm Password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Signing up..." : "Submit"}
        </Button>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Already have an account?{" "}
            <Button onClick={() => navigate("/login")}>Log In</Button>
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default SignUp;
