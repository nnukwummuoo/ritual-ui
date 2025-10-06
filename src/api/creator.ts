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
  photolink?: File[];
}) {
  const { token, userid, data, photolink = [] } = params;

  if (!userid) throw new Error("Missing userid for createCreatorMultipart");
  if (!token) throw new Error("Missing token for createCreatorMultipart");

  const api = backend(token);

  // Create FormData for file upload
  const formData = new FormData();
  
  // Add all data fields
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, String(item));
      });
    } else {
      formData.append(key, String(value));
    }
  });

  // Add files
  photolink.forEach((file, index) => {
    formData.append(`photo${index}`, file);
  });

  console.log("[createCreatorMultipart] Sending FormData with files:", photolink.length);
  console.log("[createCreatorMultipart] File names:", photolink.map(f => f.name));
  console.log("[createCreatorMultipart] FormData entries:", Array.from(formData.entries()).map(([key, value]) => ({ key, type: typeof value, isFile: value instanceof File })));

  const res = await api.put("/creator", formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
    },
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
}) {
  const { token, data, files = [] } = params;

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

  // Attach new files only (no duplicates)
  files.forEach((file, i) => {
    if (file) {
      form.append("updateCreatorPhotos", file as any);
    }
  });

  console.log("[editCreatorMultipart] Sending data:", {
    userId: data.userId,
    creatorId: data.creatorId,
    existingImages: data.existingImages,
    imagesToDelete: data.imagesToDelete,
    newFilesCount: files.length
  });

  const res = await api.post("/editcreator", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}