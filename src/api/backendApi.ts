import axios from "axios";
import { URL } from "@/api/config";
import { store } from "@/store/store";
import { updateAccessToken } from "@/store/registerSlice";
import { handleInvalidToken } from "@/utils/handleInvalidToken"

const backend = (token: String | undefined) => {
  const instance = axios.create({
    baseURL: URL,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 180000,
  });

  instance.interceptors.response.use(
    (res) => {
      const newToken = res.headers?.["x-new-access-token"];
      if (newToken) {
        store.dispatch(updateAccessToken(newToken));
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            data.accesstoken = newToken;
            localStorage.setItem("login", JSON.stringify(data));
          }
        } catch {
          // Redux update above still applies even if localStorage fails
        }
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