import { useState } from "react";

function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PostItem({ post, onEdit, onDelete, isBusy, isEditing }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleConfirmDelete = async () => {
    await onDelete(post._id);
    setConfirmingDelete(false);
  };

  return (
    <article className={`card post-card ${isEditing ? "post-card--editing" : ""}`}>
      <div className="post-card-header">
        <h3 className="post-title">{post.title}</h3>
        <div className="post-meta">
          <span>Created: {formatDate(post.createdAt)}</span>
          {post.updatedAt && post.updatedAt !== post.createdAt && (
            <span>Updated: {formatDate(post.updatedAt)}</span>
          )}
        </div>
      </div>

      <p className="post-content">{post.content}</p>

      <div className="post-actions">
        {!confirmingDelete ? (
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(post)}
              disabled={isBusy}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setConfirmingDelete(true)}
              disabled={isBusy}
            >
              Delete
            </button>
          </>
        ) : (
          <div className="delete-confirm" role="group" aria-label="Confirm post deletion">
            <span className="delete-confirm-text">Delete this post?</span>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleConfirmDelete}
              disabled={isBusy}
            >
              {isBusy ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setConfirmingDelete(false)}
              disabled={isBusy}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default PostItem;
