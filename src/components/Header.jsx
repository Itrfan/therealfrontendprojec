import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useCookies } from "react-cookie";

const Header = ({ current }) => {
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies(["currentuser"]);
  const { currentuser } = cookies || {};
  const role = currentuser?.role || "";

  const handleLogout = () => {
    removeCookie("currentuser", { path: "/" });
    navigate("/login");
  };

  // 🌟 Define nav items dynamically
  const navItems = [
    { to: "/", label: "home", key: "home" },
    ...(role === "admin"
      ? [
          { to: "/categories", label: "categories", key: "categories" },
          { to: "/flagged", label: "flagged posts", key: "flagged" }, // 🚩 added link
        ]
      : []),
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "rgba(90, 64, 52, 0.75)", // soft mocha brown
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(240, 225, 210, 0.3)",
        color: "#F9EFE3",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          px: { xs: 2, sm: 4 },
        }}
      >
        {/* 🪶 Site Title */}
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "#F8EBD8",
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            letterSpacing: "0.5px",
            "&:hover": { color: "#FFE0B2" },
            transition: "color 0.3s ease",
          }}
        >
          perfect on paper🪶
        </Typography>

        {/* 🌿 Nav Buttons */}
        <Box display="flex" alignItems="center" gap={1}>
          {navItems.map((item) => (
            <Button
              key={item.key}
              component={Link}
              to={item.to}
              sx={{
                color: current === item.key ? "#FFE0B2" : "#F9EFE3",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                textTransform: "none",
                fontSize: "0.95rem",
                letterSpacing: "0.3px",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: current === item.key ? "100%" : "0%",
                  height: "1px",
                  backgroundColor: "#FFE0B2",
                  transition: "width 0.3s ease",
                },
                "&:hover::after": {
                  width: "100%",
                },
                "&:hover": { color: "#FFE0B2" },
              }}
            >
              {item.label}
            </Button>
          ))}

          {/* 👤 Auth Button */}
          {currentuser ? (
            <Button
              onClick={handleLogout}
              sx={{
                color: "#F9C8B7",
                fontFamily: "'Inter', sans-serif",
                textTransform: "none",
                "&:hover": { color: "#FFE0B2" },
              }}
            >
              logout
            </Button>
          ) : (
            <Button
              component={Link}
              to="/login"
              sx={{
                color: current === "login" ? "#FFE0B2" : "#F9EFE3",
                fontFamily: "'Inter', sans-serif",
                textTransform: "none",
                "&:hover": { color: "#FFE0B2" },
              }}
            >
              login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
