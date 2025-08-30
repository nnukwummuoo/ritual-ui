import axios from "axios";
import { URL } from "@/api/config";

const backend = (token:String|undefined) => {
    return axios.create({
    baseURL: URL,
    headers: {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 180000,
});
}

export default backend;