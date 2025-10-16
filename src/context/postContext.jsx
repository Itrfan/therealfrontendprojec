// src/context/PostsContext.jsx
import { createContext, useState, useContext } from "react";

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  const updatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  return (
    <PostsContext.Provider value={{ posts, setPosts, updatePost }}>
      {children}
    </PostsContext.Provider>
  );
};
