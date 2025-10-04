import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "@/api/config";
import axios, { AxiosRequestConfig } from "axios";
import { CreatePostArgs, CreatePostData, PostState, Like, Post } from "@/types/post";
import backend from "@/api/backendApi";
import { toast } from "material-react-toastify";
import { postlike } from "./like";

export const createpost = createAsyncThunk("post/createpost", async (data: CreatePostData) => {
  try {
    // Send data as a FormData
    let formData = new FormData();

    // Backend expects these fields directly
    formData.append("userid", data.userid);
    formData.append("content", data.content);
    formData.append("posttype", data.posttype);
    if (data.token) formData.append("token", data.token);
    if (data.filelink) {
      // Always send under 'image' as the endpoint is /api/image/save
      if (data.posttype == "image") {
        toast("appending image, this may take a while...", { type: "info" });
        formData.append('image', data.filelink as any);
      }
      // And for video posts, also send under 'video' for servers that expect this key
      if (data.posttype == "video") {
        toast("appending video, this may take a while...", { type: "info" });
        formData.append('video', data.filelink as any);
      }
    }

    console.log("I am about to create formData", [...formData.entries()]);

    // Setup axios config with upload progress
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(data.token ? { Authorization: `Bearer ${data.token}` } : {}),
      }
    };

    // Add upload progress callback if provided
    if (data.onUploadProgress) {
      (config as any).onUploadProgress = data.onUploadProgress;
    }
    const uploadeable=["image","video"]
    const response = uploadeable.includes(data?.posttype)?(await axios.post(`${URL}/api/image/save`, formData, config)):{status:201,data:{
            "postfilelink": "",
      "postfilepublicid": ""
    }
    };

    if (!(response.status >= 200 && response.status < 300)) {
      // Treat any non-2xx as failure
      throw "Image upload failed";
    }

  const api = backend(String(data?.token))
    const resPost = await api.post("/post", {
      userid:data.userid,
      content: data.content,
      posttype: data.posttype,
      authorUsername: data.authorUsername,
      authorName: data.authorName,
      handle: data.handle,
      ...(response?.data||{}),
  })
  console.log(resPost?.data)

    return response.data;
  } catch (err: any) {
    try { console.log("post err", err); } catch {}
    let message = 'Upload failed';
    if (err?.response?.data) {
      const d = err.response.data;
      if (typeof d === 'string') message = d;
      else if (typeof d?.message === 'string') message = d.message;
      else message = JSON.stringify(d);
    } else if (typeof err?.message === 'string') {
      message = err.message;
    }
    console.error(err)
    throw message;
  }
});

const initialState: PostState = {
  allPost: [],
  poststatus: "idle",
  message: "",
  error: null,
  getpostbyidstatus: "idle",
  deletepostsatus: "idle",
  postphoto: null,
};

export const getallpost = createAsyncThunk("post/getallpost", async (data: any) => {
  try {
    // Get posts
    let response = await axios.post(`${URL}/getallpost`, data);
    const posts = response.data.post || [];

    // For each post, get its likes
    const postsWithLikes = await Promise.all(posts.map(async (post: any) => {
      try {
        // Get likes for this post
        const likeResponse = await axios.get(`${URL}/like`, {
          params: { postid: post._id || post.postid || post.id }
        });
        if (likeResponse.data.ok) {
          return {
            ...post,
            likeCount: likeResponse.data.likeCount,
            likedBy: likeResponse.data.likedBy
          };
        }
        return post;
      } catch (err) {
        console.error(`Error fetching likes for post ${post._id}:`, err);
        return {
          ...post,
          likeCount: post.likeCount || 0,
          likedBy: post.likedBy || []
        };
      }
    }));

    return {
      ...response.data,
      post: postsWithLikes
    };
  } catch (err: any) {
    throw err.response.data.message;
  }
});

export const fetchposts = async () => {
  try {
    // Get user ID from localStorage for blocking filter
    let userid = "";
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        userid = data?.userID || data?.userid || data?.id || "";
      }
    } catch (error) {
      console.error("Error getting user ID from localStorage:", error);
    }

    let response = await axios.post(`${URL}/getallpost`, { userid });
    const posts = response.data.post || [];

    // For each post, get its likes
    const postsWithLikes = await Promise.all(posts.map(async (post: any) => {
      try {
        // Get likes for this post
        const likeResponse = await axios.get(`${URL}/like`, {
          params: { postid: post._id || post.postid || post.id }
        });
        if (likeResponse.data.ok) {
          return {
            ...post,
            likeCount: likeResponse.data.likeCount,
            likedBy: likeResponse.data.likedBy
          };
        }
        return post;
      } catch (err) {
        console.error(`Error fetching likes for post ${post._id}:`, err);
        return {
          ...post,
          likeCount: post.likeCount || 0,
          likedBy: post.likedBy || []
        };
      }
    }));

    return {
      ...response.data,
      post: postsWithLikes
    };
  } catch (err: any) {
    throw err.response.data.message;
  }
}

export const fetchsinglepost = async (pid:String) => {
  try {
    let response = await axios.get(`${URL}/getallpost/${pid}`);
    return response.data;
  } catch (err: any) {
    throw err.response.data.message;
  }
}

export const deletesinglepost = async (pid:String) => {
  try {
    let response = await axios.delete(`${URL}/getallpost/${pid}`);
    window.dispatchEvent(new Event("refreshfeed"));
    return response.data;
  } catch (err: any) {
    throw err.response.data.message;
  }
}

export const updatepost = async (pid:String,post:any) => {
  try {
    let response = await axios.put(`${URL}/getallpost/${pid}`,post);
    return response.data;
  } catch (err: any) {
    throw err.response.data.message;
  }
}

export const getpost = createAsyncThunk("post/getpost", async (data: any) => {
  try {
    let response = await axios.get(`${URL}/getallpost`, data);
    return response.data;
  } catch (err: any) {
    throw err.response.data.message;
  }
});
export const getpostbyid = createAsyncThunk(
  "post/getpostbyid",
  async (data: any) => {
    try {
      const response = await axios.post(`${URL}/getallpost`, data);
      return response.data;
    } catch (err: any) {
      throw err.response.data.message;
    }
  }
);

export const deletepost = createAsyncThunk("post/deletepost", async (data: any) => {
  try {
    let response = await axios.patch(`${URL}/post`, data);
    let postphoto = response.data.post.postphoto;

    if (postphoto) {
      // deleteImage(postphoto, "post");
    }

    return response.data;
  } catch (err: any) {
    throw err.response.data.message;
  }
});

const post = createSlice({
  name: "post",
  initialState,
  reducers: {
    PostchangeStatus(state, action) {
      state.poststatus = action.payload;
      state.getpostbyidstatus = action.payload;
      state.deletepostsatus = action.payload;
    },
    emptypostphoto(state, action) {
      state.postphoto = null;
    },
    hydrateFromCache(state, action) {
      try {
        const arr = Array.isArray(action.payload) ? action.payload : [];
        state.allPost = arr as any[];
        if (state.allPost.length > 0) state.poststatus = "succeeded";
      } catch {}
    }
  },
  extraReducers(builder) {
    builder
      .addCase(createpost.pending, (state) => {
        state.poststatus = "loading";
      })
      .addCase(createpost.fulfilled, (state, action) => {
        state.poststatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
        // Accept multiple possible shapes for the created post
        const payload = action.payload as any;
        if (process.env.NODE_ENV !== 'production') {
          try { console.debug('createpost.fulfilled payload:', payload); } catch {}
        }
        const candidate =
          payload?.post ||
          payload?.data?.post ||
          payload?.data ||
          payload?.created ||
          null;

        if (candidate) {
          const args = (action.meta as any)?.arg as CreatePostArgs;
          const newPost = candidate;
          // Ensure display fields exist for header
          if (newPost && args) {
            if (!newPost.username && args.authorUsername) newPost.username = args.authorUsername;
            if (!newPost.name && args.authorName) newPost.name = args.authorName;
            if (!newPost.handle && args.handle) newPost.handle = args.handle;
          }
          const newId = newPost?.postid ?? newPost?.id ?? newPost?._id;
          if (newId != null) {
            // De-duplicate if it already exists
            const existingIdx = state.allPost.findIndex((p: any) => (p?.postid ?? p?.id ?? p?._id) === newId);
            if (existingIdx !== -1) {
              state.allPost.splice(existingIdx, 1);
            }
          }
          state.allPost.unshift(newPost);
          try { localStorage.setItem('feedPosts', JSON.stringify(state.allPost)); } catch {}
        } else {
          // Optimistic fallback when API doesn't return the created post
          const args = (action.meta as any)?.arg as CreatePostArgs;
          // If API returns upload identifiers directly, build a post from them
          const uploadPublicId = payload?.publicId || payload?.public_id || payload?.data?.publicId || payload?.data?.public_id;
          const uploadUrl = payload?.url || payload?.secure_url || payload?.data?.url || payload?.data?.secure_url;
          const basePost: any = args?.userid ? {
            postid: Date.now(),
            userid: args.userid,
            content: args?.content,
            posttype: args?.posttype,
            createdAt: new Date().toISOString(),
            // Author display fields for UI
            username: args.authorUsername,
            name: args.authorName,
            handle: args.handle,
          } : null;
          if (basePost && (uploadPublicId || uploadUrl)) {
            basePost.postphoto = uploadPublicId || uploadUrl;
            state.allPost.unshift(basePost);
            try { localStorage.setItem('feedPosts', JSON.stringify(state.allPost)); } catch {}
          } else if (basePost) {
            state.allPost.unshift(basePost);
            try { localStorage.setItem('feedPosts', JSON.stringify(state.allPost)); } catch {}
          }
        }
      })
      .addCase(createpost.rejected, (state, action) => {
        state.poststatus = "failed";
        state.error = action.error.message || "Check internet connection";
      })
      .addCase(getallpost.pending, (state) => {
        state.poststatus = "loading";
      })
      .addCase(getallpost.fulfilled, (state, action) => {
        state.poststatus = "succeeded";
        state.message = action.payload.message;
        
        // Extract posts with their like counts
        const payload: any = action.payload || {};
        const postsArray =
          (Array.isArray(payload?.post) && payload.post) ||
          (Array.isArray(payload?.posts) && payload.posts) ||
          (Array.isArray(payload?.data?.post) && payload.data.post) ||
          (Array.isArray(payload?.data?.posts) && payload.data.posts) ||
          [];
          
        // Each post should now have likeCount and likedBy from the backend
        // Create a map of existing posts for merging
        const existingMap = new Map<string | number, any>();
        const getId = (p: any) => p?.postid ?? p?.id;

        // First store existing posts
        for (const p of state.allPost) {
          const id = getId(p);
          if (id) existingMap.set(id, p);
        }

        // Then merge in new posts, preserving likes and other metadata from existing posts
        const mergedPosts = postsArray.map(newPost => {
          const id = getId(newPost);
          const existingPost = id ? existingMap.get(id) : null;
          if (existingPost) {
            // Preserve existing likes/comments but update other fields
            return {
              ...newPost,
              likes: existingPost.likes || newPost.likes || [],
              like: existingPost.like || newPost.like || [], 
              likeCount: existingPost.likeCount || newPost.likeCount || 0,
              likedBy: existingPost.likedBy || newPost.likedBy || []
            };
          }
          return newPost;
        });

        // Sort posts by date
        const toDate = (v: any) => {
          const t = v?.createdAt ?? v?.created_at ?? v?.date;
          const n = typeof t === 'number' ? t : Date.parse(t);
          return Number.isFinite(n) ? n : 0;
        };

        state.allPost = mergedPosts.sort((a, b) => toDate(b) - toDate(a));
        try { localStorage.setItem('feedPosts', JSON.stringify(state.allPost)); } catch {}
      })
      .addCase(getallpost.rejected, (state, action) => {
        state.poststatus = "failed";
        state.error = action.error.message || "Check internet connection";
      })
      .addCase(getpostbyid.pending, (state) => {
        state.getpostbyidstatus = "loading";
      })
      .addCase(getpostbyid.fulfilled, (state, action) => {
        state.getpostbyidstatus = "succeeded";
        state.message = action.payload.message;

        let postindex = state.allPost.findIndex(
          (value) => value.postid === action.payload.post.postid
        );

        if (postindex !== -1) {
          state.allPost[postindex] = action.payload.post;
        }
      })
      .addCase(getpostbyid.rejected, (state, action) => {
        state.getpostbyidstatus = "failed";
        state.error = action.error.message || "Check internet connection";
      })
      // Handle like updates
      .addCase(postlike.fulfilled, (state, action: any) => {
        if (!action.meta?.arg) return;
        
        const { postid, userid } = action.meta.arg;
        const postIndex = state.allPost.findIndex(
          p => (p.postid === postid || p.id === postid || p._id === postid)
        );
        
        if (postIndex === -1) return;
        
        const post = state.allPost[postIndex];
        const isUnlike = action.payload?.ok === false;
        
        // Safely copy existing likes
        const existingLikes = (post.likes || post.like || []) as Like[];
        const likes = [...existingLikes];
        
        // Find existing like by this user
        const hasLike = likes.some(l => String(l.userid || l.userId) === String(userid));
        
        if (isUnlike && hasLike) {
          // Remove like on unlike response
          const filtered = likes.filter(l => String(l.userid || l.userId) !== String(userid));
          state.allPost[postIndex] = {
            ...post,
            likes: filtered,
            like: filtered,
            likeCount: filtered.length
          };
        } else if (!isUnlike && !hasLike) {
          // Add like on successful like response
          const newLike = { userid, postid } as Like;
          const updated = [...likes, newLike];
          state.allPost[postIndex] = {
            ...post,
            likes: updated,
            like: updated,
            likeCount: updated.length
          };
        }
      })
      .addCase(deletepost.pending, (state) => {
        state.deletepostsatus = "loading";
      })
      .addCase(deletepost.fulfilled, (state, action) => {
        state.deletepostsatus = "succeeded";
        state.message = action.payload.message;
        state.postphoto = action.payload.post.postphoto;

        let postindex = state.allPost.findIndex(
          (value) => value.postid === action.payload.post.postid
        );

        if (postindex !== -1) {
          state.allPost.splice(postindex, 1);
        }
      })
      .addCase(deletepost.rejected, (state, action) => {
        state.deletepostsatus = "failed";
        state.error = action.error.message || "Check internet connection";
      });
  },
});

export default post.reducer;
export const { PostchangeStatus, emptypostphoto, hydrateFromCache } = post.actions;