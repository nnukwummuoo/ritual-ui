import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "@/api/config";
import axios, { AxiosRequestConfig } from "axios";
import { CreatePostData, PostState } from "@/types/post";

export const createpost = createAsyncThunk("post/createpost", async (data: CreatePostData) => {
  try {
    // Send data as a FormData
    let formData = new FormData();

    // Prepare the post form data
    const postData = {
      userid: data.userid,
      content: data.content,
      posttype: data.posttype,
    };

    formData.append("data", JSON.stringify(postData));
    formData.append("token", data.token);
    formData.append("postFile", data.filelink || "");

    console.log("I am about to create formData", [...formData.entries()]);

    // Setup axios config with upload progress
    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
       timeout: 180000,
    };

    // Add upload progress callback if provided
    if (data.onUploadProgress) {
      config.onUploadProgress = data.onUploadProgress;
    }

    const response = await axios.put(`${URL}/post`, formData, config);

    if (response.status !== 200) {
      // Post was not successfully created
      throw "Error updating your post";
    }

    return response.data;
  } catch (err: any) {
    console.log("post err " + err);
    throw err.response.data.message;
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
    let response = await axios.post(`${URL}/getallpost`, data);
    return response.data;
  } catch (err: any) {
    throw err.response.data.message;
  }
});

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
      let response = await axios.post(`${URL}/post`, data);
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
  },
  extraReducers(builder) {
    builder
      .addCase(createpost.pending, (state) => {
        state.poststatus = "loading";
      })
      .addCase(createpost.fulfilled, (state, action) => {
        state.poststatus = "succeeded";
        state.message = action.payload.message;
        state.allPost.push(action.payload.post);

        // Shuffle after adding new post
        state.allPost = [...state.allPost].sort(() => Math.random() - 0.5);
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

        if (Array.isArray(action.payload.post)) {
          // Shuffle the posts when fetched
          state.allPost = [...action.payload.post].sort(
            () => Math.random() - 0.5
          );
        } else {
          state.allPost = [];
        }
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
export const { PostchangeStatus, emptypostphoto } = post.actions;