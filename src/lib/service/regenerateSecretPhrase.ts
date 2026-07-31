import backend from "@/api/backendApi";

interface RegeneratePhraseResponse {
  ok: boolean;
  message: string;
  secretPhrase?: string[];
}

export const regenerateSecretPhrase = async (
  password: string,
  token: string
): Promise<RegeneratePhraseResponse> => {
  try {
    const api = backend(token);
    const res = await api.post("/regeneratesecretphrase", { password });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to regenerate your recovery phrase."
    );
  }
};