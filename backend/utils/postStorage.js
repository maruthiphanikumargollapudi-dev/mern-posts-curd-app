const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

let writeQueue = Promise.resolve();

function getDataFilePath() {
  const configuredDir = process.env.DATA_DIR && process.env.DATA_DIR.trim();
  const baseDir = configuredDir
    ? path.resolve(configuredDir)
    : path.join(__dirname, "..", "data");
  return path.join(baseDir, "posts.json");
}

function createStorageError(message, statusCode = 500) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function ensureDirectory(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function readPostsFromDisk(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const trimmed = raw.replace(/^\uFEFF/, "").trim();

    if (trimmed === "") {
      throw createStorageError(
        `Corrupted JSON storage at ${filePath}: file is empty`,
        500
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch (parseErr) {
      throw createStorageError(
        `Corrupted JSON storage at ${filePath}: ${parseErr.message}`,
        500
      );
    }

    if (!Array.isArray(parsed)) {
      throw createStorageError(
        `Corrupted JSON storage at ${filePath}: root value must be an array`,
        500
      );
    }

    return parsed;
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

async function writePostsAtomically(filePath, posts) {
  await ensureDirectory(filePath);
  const dir = path.dirname(filePath);
  const tempFileName = `.posts.${process.pid}.${crypto.randomUUID()}.tmp`;
  const tempFilePath = path.join(dir, tempFileName);
  const serialized = `${JSON.stringify(posts, null, 2)}\n`;

  try {
    await fs.writeFile(tempFilePath, serialized, "utf8");
    await fs.rename(tempFilePath, filePath);
  } catch (err) {
    try {
      await fs.unlink(tempFilePath);
    } catch (_) {
      // Ignore cleanup failure if temp file was never created
    }
    throw createStorageError(
      `Failed to atomically write posts storage at ${filePath}: ${err.message}`,
      500
    );
  }
}

function enqueueMutation(taskFn) {
  const runNext = writeQueue.then(() => taskFn());
  // Keep the queue chain alive even if a task rejects
  writeQueue = runNext.catch(() => {});
  return runNext;
}

async function getAllPosts() {
  const filePath = getDataFilePath();
  return readPostsFromDisk(filePath);
}

async function getPostById(id) {
  const posts = await getAllPosts();
  return posts.find((post) => post._id === id) || null;
}

async function createPost({ title, content }) {
  return enqueueMutation(async () => {
    const filePath = getDataFilePath();
    const posts = await readPostsFromDisk(filePath);
    const now = new Date().toISOString();

    const newPost = {
      _id: crypto.randomUUID(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
    };

    posts.push(newPost);
    await writePostsAtomically(filePath, posts);
    return newPost;
  });
}

async function updatePost(id, updates) {
  return enqueueMutation(async () => {
    const filePath = getDataFilePath();
    const posts = await readPostsFromDisk(filePath);
    const index = posts.findIndex((post) => post._id === id);

    if (index === -1) {
      return null;
    }

    const existing = posts[index];
    const updatedPost = {
      ...existing,
      title: updates.title !== undefined ? updates.title : existing.title,
      content: updates.content !== undefined ? updates.content : existing.content,
      updatedAt: new Date().toISOString(),
    };

    posts[index] = updatedPost;
    await writePostsAtomically(filePath, posts);
    return updatedPost;
  });
}

async function deletePost(id) {
  return enqueueMutation(async () => {
    const filePath = getDataFilePath();
    const posts = await readPostsFromDisk(filePath);
    const index = posts.findIndex((post) => post._id === id);

    if (index === -1) {
      return false;
    }

    posts.splice(index, 1);
    await writePostsAtomically(filePath, posts);
    return true;
  });
}

module.exports = {
  getDataFilePath,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
