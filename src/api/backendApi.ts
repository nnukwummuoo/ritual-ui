import axios from "axios";
import { URL } from "@/api/config";

const backend = (token:String|undefined) => {
    return axios.create({
    baseURL: URL,
    headers: {
        // Do not set Content-Type here: FormData must get multipart/form-data with boundary from axios
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 180000,
});
}

export default backend;