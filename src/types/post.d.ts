import { AxiosProgressEvent } from "axios";

export interface Post {
postid: string;
userid: string;
content: string;
posttype: string;
postphoto?: string | null;
}

export interface CreatePostData {
userid: string;
content: string;
posttype: string;
token: string;
filelink?: File | string;
onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
}

export interface PostState {
allPost: Post[];
poststatus: "idle" | "loading" | "succeeded" | "failed";
message: string;
error: string | null;
getpostbyidstatus: "idle" | "loading" | "succeeded" | "failed";
deletepostsatus: "idle" | "loading" | "succeeded" | "failed";
postphoto: string | null;
}