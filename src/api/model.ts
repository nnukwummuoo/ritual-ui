import backend from "@/api/backendApi";

// -----------------------------
// Create Model (URLs for photolink)
// -----------------------------
// -----------------------------
// Create Model (photolinks always strings)
// -----------------------------
export async function createModelMultipart(params: {
  token: string;
  userid: string;
  data: Record<string, any>;
  photolink?: string[];
}) {
  const { token, userid, data, photolink = [] } = params;

  if (!userid) throw new Error("Missing userid for createModelMultipart");
  if (!token) throw new Error("Missing token for createModelMultipart");

  const api = backend(token);

  const validPhotoLinks = photolink.filter(link => typeof link === "string" && link.trim() !== "");

  const payload = {
    ...data,
    userid, // ✅ keep exactly as is for backend
    photolink: validPhotoLinks,
  };

  console.log("[createModelMultipart] Payload ready:", payload);

  const res = await api.put("/model", payload, {
    headers: { "Content-Type": "application/json" },
  });

  console.log("[createModelMultipart] Backend response:", res.data);
  return res.data;
}



// -----------------------------
// Get My Model by userid
// -----------------------------
export async function getMyModel(params: { userid: string; token?: string }) {
  const { userid, token } = params;
  if (!userid) throw new Error("Missing userid for getMyModel");

  const api = backend(token);
  const res = await api.post("/getverifymodel", { userid }); // <-- make sure key matches backend
  const data = res.data;

  if (data.ok && data.host) {
    // Ensure a fallback image exists
    data.host = data.host.map(model => ({
      ...model,
      displayImage: (model.photolink && model.photolink[0]) || "/default-image.png",
    }));
  }

  console.log("[getMyModel] Normalized response:", data);
  return data;
}
// -----------------------------
// Edit Model (multipart)
// -----------------------------
export async function editModelMultipart(params: {
  token: string;
  data: Record<string, any>; // must include userId and modelId
  files?: Array<File | Blob>;
  doc1?: File | Blob;
  doc2?: File | Blob;
}) {
  const { token, data, files, doc1, doc2 } = params;

  if (!data.userId) throw new Error("Missing userId in data for editModelMultipart");
  if (!token) throw new Error("Missing token for editModelMultipart");

  const api = backend(token);
  const form = new FormData();

  // Append all non-file fields
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => form.append(key, v));
      console.log(`[editModelMultipart] Appended array field "${key}" with values:`, value);
    } else if (value !== undefined && value !== null) {
      form.append(key, String(value));
      console.log(`[editModelMultipart] Appended field "${key}" with value:`, value);
    }
  });

  // Attach update files
  [...(files || []), doc1, doc2].forEach((file, i) => {
    if (file) {
      form.append("updateModelPhotos", file as any);
      console.log(
        `[editModelMultipart] Appended updateModelPhotos[${i}]:`,
        (file as any).name || "[blob-no-name]"
      );
    } else {
      console.log(`[editModelMultipart] update file[${i}] is null or undefined, skipped`);
    }
  });

  console.log("[editModelMultipart] Final FormData ready to send");

  const res = await api.post("/editmodel", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  console.log("[editModelMultipart] Backend response:", res.data);
  return res.data;
}