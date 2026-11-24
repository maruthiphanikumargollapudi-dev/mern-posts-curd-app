import { useEffect, useState } from "react";
import PostForm from "./components/PostForm";
import PostItem from "./components/PostItem";
import {
  createPost,
  deletePost,
  fetchPosts,
  updatePost,
} from "./services/api";
import "./App.css";

function App() {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyPostId, setBusyPostId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadPosts = async ({ showSpinner = true } = {}) => {
    if (showSpinner) {
      setIsLoading(true);
    }
    setErrorMessage("");
    try {
      const data = await fetchPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message || "Unable to load posts from server.");
    } finally {
      if (showSpinner) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPosts({ showSpinner: true });
  }, []);

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (editingPost) {
        const updated = await updatePost(editingPost._id, formData);
        setPosts((prev) =>
          prev.map((item) => (item._id === updated._id ? updated : item))
        );
        setEditingPost(null);
        setSuccessMessage("Post updated successfully.");
      } else {
        const created = await createPost(formData);
        setPosts((prev) => [...prev, created]);
        setSuccessMessage("Post created successfully.");
      }
      return true;
    } catch (err) {
      setErrorMessage(err.message || "Failed to save post.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setBusyPostId(postId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((item) => item._id !== postId));
      if (editingPost && editingPost._id === postId) {
        setEditingPost(null);
      }
      setSuccessMessage("Post deleted successfully.");
    } catch (err) {
      setErrorMessage(err.message || "Failed to delete post.");
    } finally {
      setBusyPostId(null);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Mern curd App</p>
          <h1>Posts CRUD Manager</h1>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => loadPosts({ showSpinner: true })}
          disabled={isLoading || isSubmitting}
        >
          Refresh
        </button>
      </header>

      {errorMessage && (
        <div className="banner banner-error" role="alert">
          <span>{errorMessage}</span>
          <button
            type="button"
            className="banner-close"
            onClick={() => setErrorMessage("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="banner banner-success" role="status">
          <span>{successMessage}</span>
          <button
            type="button"
            className="banner-close"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      <main className="app-grid">
        <PostForm
          editingPost={editingPost}
          onSubmitPost={handleFormSubmit}
          onCancelEdit={() => {
            setEditingPost(null);
            setErrorMessage("");
          }}
          isSubmitting={isSubmitting}
        />

        <section className="posts-column" aria-labelledby="posts-list-heading">
          <div className="posts-header">
            <h2 id="posts-list-heading">All Posts</h2>
            <span className="count-badge">{posts.length}</span>
          </div>

          {isLoading ? (
            <div className="card status-box" role="status">
              <span className="spinner" aria-hidden="true" />
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="card status-box empty-state">
              <h3>No posts yet</h3>
              <p>Create your first post using the form to see it stored here.</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <PostItem
                  key={post._id}
                  post={post}
                  onEdit={(item) => {
                    setEditingPost(item);
                    setSuccessMessage("");
                    setErrorMessage("");
                  }}
                  onDelete={handleDeletePost}
                  isBusy={busyPostId === post._id}
                  isEditing={editingPost?._id === post._id}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
