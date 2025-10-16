import { BrowserRouter as Router, Routes, Route } from "react-router";
import { CookiesProvider } from "react-cookie";
import { Toaster } from "sonner";
import Posts from "./pages/posts";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Categories from "./pages/categories"
import NewPost from "./pages/newPost";
import PostPage from "./pages/postPage";
PostPage
import { PostsProvider } from "./context/postContext";
import AdminFlagged from "./pages/adminFlagged";
import ProfilePage from "./pages/profile";


function App() {
  return (
    <CookiesProvider>
      <PostsProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Posts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/new" element={<NewPost />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/flagged" element={<AdminFlagged />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
          </Routes>
        </Router>
        <Toaster />
      </PostsProvider>
    </CookiesProvider>
  );
}

export default App;
