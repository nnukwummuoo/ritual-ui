/* eslint-disable @typescript-eslint/no-explicit-any */
import backend from "@/api/backendApi";

// -----------------------------
// Create Portfolio (URLs for photolink)
// -----------------------------
// -----------------------------
// Create Portfolio (photolinks always strings)
// -----------------------------
export async function createCreatorMultipart(params: {
  token: string;
  userid: string;
  data: Record<string, any>;
  photolink?: string[];
}) {
  const { token, userid, data, photolink = [] } = params;

  if (!userid) throw new Error("Missing userid for createCreatorMultipart");
  if (!token) throw new Error("Missing token for createCreatorMultipart");

  const api = backend(token);

  const validPhotoLinks = photolink.filter(link => typeof link === "string" && link.trim() !== "");

  const payload = {
    ...data,
    userid, // ✅ keep exactly as is for backend
    photolink: validPhotoLinks,
  };

  console.log("[createCreatorMultipart] Payload ready:", payload);

  const res = await api.put("/creator", payload, {
    headers: { "Content-Type": "application/json" },
  });

  console.log("[createCreatorMultipart] Backend response:", res.data);
  return res.data;
}



// -----------------------------
// Get My Creator by userid
// -----------------------------
export async function getMyCreator(params: { userid: string; token?: string }) {
  const { userid, token } = params;
  if (!userid) throw new Error("Missing userid for getMyCreator");

  const api = backend(token);
  const res = await api.post("/creator", { userid }, {
    headers: { "Content-Type": "application/json" } // <-- Fix: use JSON content type
  });
  const data = res.data;

  if (data.ok && data.host) {
    // Ensure a fallback image exists
    data.host = data.host.map((creator: any) => ({
      ...creator,
      displayImage: (creator.photolink && creator.photolink[0]) || "/default-image.png",
    }));
  }

  return data;
}
// -----------------------------
// Edit Portfolio (multipart)
// -----------------------------
export async function editCreatorMultipart(params: {
  token: string;
  data: Record<string, any>; // must include userId and creatorId
  files?: Array<File | Blob>;
  doc1?: File | Blob;
  doc2?: File | Blob;
}) {
  const { token, data, files, doc1, doc2 } = params;

  if (!data.userId) throw new Error("Missing userId in data for editCreatorMultipart");
  if (!token) throw new Error("Missing token for editCreatorMultipart");

  const api = backend(token);
  const form = new FormData();

  // Append all non-file fields
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => form.append(key, v));
    } else if (value !== undefined && value !== null) {
      form.append(key, String(value));
    }
  });

  // Attach update files
  [...(files || []), doc1, doc2].forEach((file, i) => {
    if (file) {
      form.append("updateCreatorPhotos", file as any);
    }
  });

  const res = await api.post("/editcreator", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}