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

  // Add files - use consistent field names that backend expects
  photolink.forEach((file, index) => {
    formData.append('creatorfiles', file);
  });

  const res = await api.put("/creator", formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
    },
  });

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
  console.log("📡 [editCreatorMultipart] Starting edit API call");
  console.log("📡 [editCreatorMultipart] Parameters:", {
    userId: params.data.userId,
    creatorId: params.data.creatorId,
    token: params.token ? "present" : "missing",
    filesCount: params.files?.length || 0
  });

  const { token, data, files = [] } = params;

  if (!data.userId) throw new Error("Missing userId in data for editCreatorMultipart");
  if (!token) throw new Error("Missing token for editCreatorMultipart");

  console.log("📡 [editCreatorMultipart] Files details:", {
    count: files.length,
    fileNames: files.map(f => f.name),
    fileSizes: files.map(f => f.size),
    fileTypes: files.map(f => f.type)
  });

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

  console.log("📡 [editCreatorMultipart] FormData entries:", Array.from(form.entries()).map(([key, value]) => ({ 
    key, 
    type: typeof value, 
    isFile: value instanceof File,
    value: value instanceof File ? `File: ${value.name}` : String(value).substring(0, 100)
  })));

  console.log("📡 [editCreatorMultipart] Sending data:", {
    userId: data.userId,
    creatorId: data.creatorId,
    existingImages: data.existingImages,
    imagesToDelete: data.imagesToDelete,
    newFilesCount: files.length
  });

  console.log("📡 [editCreatorMultipart] Making API request to /editcreator");

  const res = await api.post("/editcreator", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  
  console.log("📡 [editCreatorMultipart] API response:", {
    status: res.status,
    statusText: res.statusText,
    data: res.data
  });
  
  console.log("✅ [editCreatorMultipart] Edit API call successful");
  return res.data;
}