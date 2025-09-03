import axios from "axios";
import { URL } from "@/api/config";

// Create Model (multipart) with both Authorization and x-refresh-token headers
export async function createModelMultipart(params: {
  token: string;
  userid: string;
  data: Record<string, any>;
  files?: Array<File | Blob>;
  doc1?: File | Blob;
  doc2?: File | Blob;
}) {
  const { token, userid, data, files, doc1, doc2 } = params;
  const form = new FormData();
  const payload = { ...data, userid };
  form.append("data", JSON.stringify(payload));
  form.append("token", token);
  // Backend expects photos under 'modelFiles'
  if (Array.isArray(files)) {
    files.forEach((f) => form.append("modelFiles", f as any));
  }
  // Also attach explicit doc1/doc2 fields per backend sample
  // Prefer provided doc1/doc2, otherwise map from the first two files
  const first = doc1 || (Array.isArray(files) && files.length > 0 ? files[0] : undefined);
  const second = doc2 || (Array.isArray(files) && files.length > 1 ? files[1] : undefined);
  if (first) form.append("doc1", first as any);
  if (second) form.append("doc2", second as any);

  const res = await axios.put(`${URL}/model`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-refresh-token": token,
    },
  });
  return res.data;
}

// Get My Model by userid (optionally with Authorization header)
export async function getMyModel(params: { userid: string; token?: string }) {
  const { userid, token } = params;
  const res = await axios.post(
    `${URL}/getverifymodel`,
    { userid },
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );
  return res.data;
}

// Edit Model (multipart)
export async function editModelMultipart(params: {
  token: string;
  data: Record<string, any>; // must include userid and modelid inside data
  files?: Array<File | Blob>;
  doc1?: File | Blob;
  doc2?: File | Blob;
}) {
  const { token, data, files, doc1, doc2 } = params;
  const form = new FormData();
  form.append("data", JSON.stringify(data));
  form.append("token", token);
  // Backend expects photos under 'updateModelPhotos'
  console.log(files)
  if (files?.length) {
    files.forEach((f) => form.append("updateModelPhotos", f as any));
  }
  if (doc1) form.append("updateModelPhotos", doc1 as any);
  if (doc2) form.append("updateModelPhotos", doc2 as any);

  const res = await axios.post(`${URL}/editmodel`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
