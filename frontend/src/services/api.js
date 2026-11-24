const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api/v1";

const POSTS_ENDPOINT = `${BASE_URL}/posts`;

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && payload.message
        ? payload.details?.length
          ? `${payload.message}: ${payload.details.join(" ")}`
          : payload.message
        : `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export async function fetchPosts() {
  const response = await fetch(POSTS_ENDPOINT, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  return parseResponse(response);
}

export async function createPost(postData) {
  const response = await fetch(POSTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(postData),
  });
  return parseResponse(response);
}

export async function updatePost(id, postData) {
  const response = await fetch(`${POSTS_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(postData),
  });
  return parseResponse(response);
}

export async function deletePost(id) {
  const response = await fetch(`${POSTS_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  return parseResponse(response);
}
