import { useEffect, useState } from "react";

function PostForm({ editingPost, onSubmitPost, onCancelEdit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setContent(editingPost.content || "");
      setValidationError("");
    } else {
      setTitle("");
      setContent("");
      setValidationError("");
    }
  }, [editingPost]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
      setValidationError("Title must be between 3 and 150 characters.");
      return;
    }

    if (trimmedContent.length < 5) {
      setValidationError("Content must be at least 5 characters long.");
      return;
    }

    setValidationError("");
    const didSucceed = await onSubmitPost({
      title: trimmedTitle,
      content: trimmedContent,
    });

    if (didSucceed && !editingPost) {
      setTitle("");
      setContent("");
    }
  };

  return (
    <section className="card form-card" aria-labelledby="post-form-heading">
      <div className="form-header">
        <h2 id="post-form-heading">
          {editingPost ? "Edit Post" : "Create New Post"}
        </h2>
        {editingPost && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="post-form" noValidate>
        <div className="form-group">
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear title (3–150 characters)"
            maxLength={150}
            disabled={isSubmitting}
            required
          />
          <span className="field-hint">{title.trim().length}/150 characters</span>
        </div>

        <div className="form-group">
          <label htmlFor="post-content">Content</label>
          <textarea
            id="post-content"
            name="content"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content (at least 5 characters)"
            disabled={isSubmitting}
            required
          />
          <span className="field-hint">
            {content.trim().length} characters (minimum 5)
          </span>
        </div>

        {validationError && (
          <p className="field-error" role="alert">
            {validationError}
          </p>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? editingPost
                ? "Updating..."
                : "Publishing..."
              : editingPost
              ? "Update Post"
              : "Publish Post"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default PostForm;
