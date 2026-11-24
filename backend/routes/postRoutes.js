const express = require("express");
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require("../utils/postStorage");

const router = express.Router();

function createHttpError(statusCode, message, details = undefined) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (details) {
    err.details = details;
  }
  return err;
}

function validatePostPayload(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || Object.prototype.hasOwnProperty.call(body || {}, "title")) {
    if (typeof body?.title !== "string") {
      errors.push("Title is required and must be a string.");
    } else {
      const trimmedTitle = body.title.trim();
      if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
        errors.push("Title must be between 3 and 150 characters.");
      } else {
        data.title = trimmedTitle;
      }
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(body || {}, "content")) {
    if (typeof body?.content !== "string") {
      errors.push("Content is required and must be a string.");
    } else {
      const trimmedContent = body.content.trim();
      if (trimmedContent.length < 5) {
        errors.push("Content must be at least 5 characters long.");
      } else {
        data.content = trimmedContent;
      }
    }
  }

  if (partial && Object.keys(data).length === 0 && errors.length === 0) {
    errors.push("Provide at least one valid field (title or content) to update.");
  }

  return { errors, data };
}

router.post("/", async (req, res, next) => {
  try {
    const { errors, data } = validatePostPayload(req.body, { partial: false });
    if (errors.length > 0) {
      return next(createHttpError(400, "Validation failed", errors));
    }

    const created = await createPost(data);
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await getAllPosts();
    return res.status(200).json(posts);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      return next(createHttpError(404, `Post with id '${req.params.id}' not found`));
    }
    return res.status(200).json(post);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { errors, data } = validatePostPayload(req.body, { partial: true });
    if (errors.length > 0) {
      return next(createHttpError(400, "Validation failed", errors));
    }

    const updated = await updatePost(req.params.id, data);
    if (!updated) {
      return next(createHttpError(404, `Post with id '${req.params.id}' not found`));
    }

    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await deletePost(req.params.id);
    if (!deleted) {
      return next(createHttpError(404, `Post with id '${req.params.id}' not found`));
    }

    return res.status(200).json({
      message: "Post deleted successfully",
      _id: req.params.id,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
