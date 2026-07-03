import axios from "axios";
import { URL } from "@/api/config";
import { handleInvalidToken } from "@/utils/handleInvalidToken";

const backend = (token: String | undefined) => {
  const instance = axios.create({
    baseURL: URL,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 180000,
  });

  instance.interceptors.response.use(
    async (res) => {
      const newToken = res.headers?.["x-new-access-token"];
      if (newToken) {
        const { store } = await import("@/store/store");
        const { updateAccessToken } = await import("@/store/registerSlice");
        store.dispatch(updateAccessToken(newToken));
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            data.accesstoken = newToken;
            localStorage.setItem("login", JSON.stringify(data));
          }
        } catch {}
      }
      return res;
    },
    (error) => {
      if (error?.response?.status === 403 && error?.response?.data?.code === "TOKEN_INVALID") {
        handleInvalidToken();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default backend;