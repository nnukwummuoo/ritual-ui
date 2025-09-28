import { AxiosProgressEvent } from "axios";

export interface Like {
  userid: string;
  userId?: string;
  postid: string;
}

export interface Post {
  postid: string;
  userid: string;
  content: string;
  posttype: string;
  postphoto?: string | null;
  likes?: Like[];
  like?: Like[];
  likeCount?: number;
  likedBy?: string[];
  // Support multiple ID fields from different APIs
  id?: string;
  _id?: string;
}

export interface CreatePostData {
userid: string;
content: string;
authorUsername?: any;
authorName?: any;
handle?: any;
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

export type CreatePostArgs = {
    userid: string;
    content: string;
    posttype: string;
    token: string;
    filelink?: File | Blob | string;
    onUploadProgress?: (progressEvent: any) => void;
    // Optional local media data to enable optimistic UI when API doesn't echo the post
    localMediaId?: string;
    localMediaUrl?: string;
    // Optional author display fields for optimistic UI
    authorUsername?: string;
    authorName?: string;
    handle?: string;
  };