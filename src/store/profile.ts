import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { URL } from "../api/config";
import axios from "axios";
import { ProfileState } from "@/types/profile";
// import { saveImage } from "../../../api/sendImage";
// import { deleteImage } from "../../../api/sendImage";

// Typed error helpers
const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? err.message ?? "Unknown Axios error";
  }
  if (err instanceof Error) return err.message;
  return typeof err === "string" ? err : "Unknown error";
};

// Thunk payload types
type PostExclusiveContentPayload = {
  contentname: string;
  price: number;
  content_type: string;
  userid: string;
  token: string;
  contentlink?: Blob | File;
  thumbnaillink?: Blob | File;
};

type PostExclusiveImgPayload = {
  imagelink: { name: string } | File;
  thumbnaillink: { name: string } | File;
};

const getErrorMessageWithNetworkFallback = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message ?? err.message ?? "";
    return msg || "check internet connection";
  }
  if (err instanceof Error) return err.message || "Unknown error";
  return typeof err === "string" && err ? err : "Unknown error";
};

const initialState = {
  firstname: "",
  lastname: "",
  email: "",
  nickname: "",
  active: false,
  State: "",
  country: "",
  balance: "",
  admin: false,
  witdrawable: "",
  model: "false",
  status: "idle",
  error: "",
  modelID: "",
  modelphotolink: "",
  modelname: "",
  history_stats: "idle",
  history_message: "",
  historys: {},
  monthly_history_stats: "idle",
  monthly_history_messege: "",
  monthly: [],
  deposit_stats: "idle",
  deposit_message: "",
  exclusive_verify: false,
  follow_stats: "idle",
  unfollow_stats: "idle",
  getfollow_data: {},
  getfollow_stats: "idle",
  fllowmsg: "",
  postexIMG: "",
  thumbimg: "",
  posteximgStats: "idle",
  postexstats: "idle",
  buyexstats: "idle",
  deleteexstats: "idle",
  collectionstats: "idle",
  deletecolstats: "idle",
  listofcontent: [],
  listofcrush: [],
  thumbdelstats: "idle",
  deleteaccstats: "idle",
  listofblockuser: [],
  blockuserstats: "idle",
  removeblockstats: "idle",
  updatesettingstats: "idle",
  emailnote: false,
  pushnote: false,
  lastnote: 0,
  lastmessagenote: 0,
  searchstats: "idle",
  search_users: [],
  testmsg: "",
  closedraw: false,
};

export const getprofile = createAsyncThunk<any, any>(
  "profile/getprofile",
  async (data) => {
    try {
      // Debug: trace outgoing request
      // eslint-disable-next-line no-console
      console.log("[getprofile] POST", `${URL}/getprofile`, {
        userid: data?.userid,
        hasToken: Boolean(data?.token),
      });
      
      let response = await axios.post(`${URL}/getprofile`, data);
      // eslint-disable-next-line no-console
      console.log("[getprofile] success", response.status);

      return response.data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[getprofile] error", err);
      throw getErrorMessage(err);
    }
  }
);

export const getsearch = createAsyncThunk("profile/getsearch", async () => {
  try {
    //console.log('ontop get profile')
    let response = await axios.post(`${URL}/searchuser`);
    // console.log('under get profile')

    return response.data;
  } catch (err : any) {
    // console.log('erro get profile')
    throw getErrorMessage(err);
  }
});

export const updatesetting = createAsyncThunk<any, any>(
  "profile/updatesetting",
  async (data) => {
    try {
      //console.log('ontop get profile')
      let response = await axios.post(`${URL}/setting`, data);
      // console.log('under get profile')

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      throw getErrorMessage(err);
    }
  }
);

export const deleteblockedUsers = createAsyncThunk<any, any>(
  "profile/deleteblockedUsers",
  async (data) => {
    try {
      //console.log('ontop get profile')
      let response = await axios.patch(`${URL}/deleteaccount`, data);
      // console.log('under get profile')

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      throw getErrorMessage(err);
    }
  }
);

export const deleteprofile = createAsyncThunk<any, any>(
  "profile/deleteprofile",
  async (data) => {
    try {
      //console.log('ontop get profile')
      let response = await axios.post(`${URL}/deleteaccount`, data);
      // console.log('under get profile')

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      throw getErrorMessage(err);
    }
  }
);

export const getcollection = createAsyncThunk<any, any>(
  "profile/getcollection",
  async (data) => {
    try {
      //console.log('ontop get profile')
      let response = await axios.put(`${URL}/exclusivecontent`, data);
      // console.log('under get profile')

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      throw getErrorMessage(err);
    }
  }
);

export const getblockedUsers = createAsyncThunk<any, any>(
  "profile/getblockedUsers",
  async (data) => {
    try {
      //console.log('ontop get profile')
      let response = await axios.put(`${URL}/deleteaccount`, data);
      // console.log('under get profile')

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      throw getErrorMessage(err);
    }
  }
);

export const deletecollection = createAsyncThunk<any, any>(
  "profile/deletecollection",
  async (data) => {
    try {
      //console.log('ontop get profile')
      let response = await axios.post(`${URL}/exclusivecontent`, data);
      // console.log('under get profile')

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      throw getErrorMessage(err);
    }
  }
);

export const post_exclusive_content = createAsyncThunk<
  any,
  PostExclusiveContentPayload
>(
  "profile/post_exclusive_content",
  async (data : any) => {
    try {
      // Send data as a FormData
      let formData = new FormData();

      // Prepare the post form data
      const postData = {
        contentname: data.contentname,
        price: data.price,
        content_type: data.content_type,
        // contentlink: data.imagelink,
        // thumblink: data.thumbnaillink,
        userid: data.userid,
        // token: data.token,
      };

      formData.append("data", JSON.stringify(postData));
      formData.append("token", data.token);
      if (data.contentlink) {
        formData.append("contentlink", data.contentlink);
      }
      if (data.thumbnaillink) {
        formData.append("thumbnaillink", data.thumbnaillink);
      }

      console.log("I am about to create formData", [...formData.entries()]);

      let response = await axios.put(`${URL}/exclusive`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        // Post was not successfully created
        throw "Error creating your verifying your model";
      }

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      throw getErrorMessage(err);
    }
  }
);

export const buy_exclusive_content = createAsyncThunk<any, any>(
  "profile/buy_exclusive_content",
  async (data) => {
    try {
      let response = await axios.post(`${URL}/exclusive`, data);
      return response.data;
    } catch (err) {
      throw getErrorMessage(err);
    }
  }
);

export const delete_exclusive_content = createAsyncThunk<any, any>(
  "profile/delete_exclusive_content",
  async (data) => {
    try {
      let response = await axios.patch(`${URL}/exclusive`, data);
      return response.data;
    } catch (err) {
      throw getErrorMessage(err);
    }
  }
);

export const get_my_history = createAsyncThunk<any, any>(
  "profile/get_my_history",
  async (data) => {
    try {
      //console.log('ontop get profile')
      let response = await axios.post(`${URL}/statistics`, data);
      // console.log('under get profile')

      // return response.data;
          return response.data.history;
    } catch (err : any) {
      // console.log('erro get profile')
      throw getErrorMessageWithNetworkFallback(err);
    }
  }
);

export const get_monthly_history = createAsyncThunk<any, any>(
  "profile/get_monthly_history",
  async (data) => {
    try {
      let response = await axios.post(`${URL}/statistics/monthly`, data);
      return response.data;
    } catch (err) {
      throw getErrorMessageWithNetworkFallback(err);
    }
  }
);

export const deposit = createAsyncThunk<any, any>("profile/deposit", async (data) => {
  try {
    let response = await axios.post(`${URL}/topup`, data);
    // console.log('under get profile')

    return response.data;
  } catch (err : any) {
    // console.log('erro get profile')
    throw getErrorMessageWithNetworkFallback(err);
  }
});

export const follow = createAsyncThunk<any, any>("profile/follow", async (data) => {
  try {
    let response = await axios.post(`${URL}/follow`, data);

    return response.data;
  } catch (err : any) {
    // console.log('erro get profile')
    console.log(err);
    throw getErrorMessageWithNetworkFallback(err);
  }
});

export const unfollow = createAsyncThunk<any, any>("profile/unfollow", async (data) => {
  try {
    let response = await axios.put(`${URL}/follow`, data);

    return response.data;
  } catch (err : any) {
    console.log(err);
    // console.log('erro get profile')
    throw getErrorMessageWithNetworkFallback(err);
  }
});

export const getfollow = createAsyncThunk<any, any>("profile/getfollow", async (data) => {
  try {
    // Debug: trace outgoing request for followers/following
    // eslint-disable-next-line no-console
    console.log("[getfollow] POST", `${URL}/getfollowers`, {
      userid: data?.userid,
      hasToken: Boolean(data?.token),
    });

    let response = await axios.post(`${URL}/getfollowers`, data);
    // eslint-disable-next-line no-console
    console.log("[getfollow] success", response.status);
    // Log raw payloads from backend
    // eslint-disable-next-line no-console
    console.log("[getfollow] response.data", response.data);
    // eslint-disable-next-line no-console
    console.log("[getfollow] response.data.data", response.data?.data);

    return response.data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[getfollow] error", err);
    throw getErrorMessageWithNetworkFallback(err);
  }
});

export const post_exclusive_img = createAsyncThunk<
  { img: string | undefined; thumb: string | undefined },
  PostExclusiveImgPayload
>(
  "profile/post_exclusive_img",
  async (data: any) => {
    try {
      let img;
      let thumb;

      // img = await saveImage(data.imagelink, "post");
      // thumb = await saveImage(data.thumbnaillink, "post");

      img = (data.imagelink as any).name;
      thumb = (data.thumbnaillink as any).name;
      return { img, thumb };
    } catch (err) {
      throw getErrorMessageWithNetworkFallback(err);
    }
  }
);

export const delete_exclusive_thumb = createAsyncThunk<
  string,
  void
>(
  "profile/delete_exclusive_thumb",
  async () => {
    try {
      return "success";
    } catch (err) {
      throw getErrorMessageWithNetworkFallback(err);
    }
  }
);

const profile = createSlice({
  name: "profile",
  initialState,
  reducers: {
    ProfilechangeStatus(state, action: PayloadAction<ProfileState["status"]>) {
      state.status = action.payload;
      state.history_stats = action.payload;
      state.monthly_history_stats = action.payload;
      state.deposit_stats = action.payload;
      state.follow_stats = action.payload;
      state.unfollow_stats = action.payload;
      state.getfollow_stats = action.payload;
      state.posteximgStats = action.payload;
      state.postexstats = action.payload;
      state.buyexstats = action.payload;
      state.deleteexstats = action.payload;
      state.collectionstats = action.payload;
      state.deletecolstats = action.payload;
      state.thumbdelstats = action.payload;
      state.deleteaccstats = action.payload;
      state.blockuserstats = action.payload;
      state.removeblockstats = action.payload;
      state.updatesettingstats = action.payload;
      state.searchstats = action.payload;
    },
    setlastnote(state, action) {
      state.lastnote = action.payload;
    },
    setmessagelastnote(state, action) {
      state.lastmessagenote = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getprofile.pending, (state, action) => {
        state.status = "loading";
        console.log(state.status);
      })
      .addCase(getprofile.fulfilled, (state, action) => {
        state.status = "succeeded";

        const p = action.payload?.profile ?? {};
        state.firstname = p.firstname ?? "";
        state.lastname = p.lastname ?? "";
        state.nickname = p.nickname ?? "";
        state.active = p.active ?? false;
        // Use state if present, otherwise fall back to country for display
        state.State = (p as any).state ?? p.country ?? "";
        state.country = p.country ?? "";
        state.balance = p.balance ?? "";
        // Backend may return either boolean model or isModel
        state.model = (p as any).model ?? (p as any).isModel ?? false as any;
        // Backend may use modelId
        state.modelID = (p as any).modelID ?? (p as any).modelId ?? "";
        state.modelname = (p as any).modelname ?? "";
        state.modelphotolink = (p as any).modelphotolink ?? "";
        state.admin = p.admin ?? false;
        // Support both exclusive and exclusive_verify flags
        state.exclusive_verify = (p as any).exclusive ?? (p as any).exclusive_verify ?? false;
        state.emailnote = (p as any).emailnot ?? (p as any).emailnot === true; // boolean
        state.pushnote = (p as any).pushnot ?? (p as any).pushnot === true; // boolean
        state.email = p.email ?? "";
        // Optionally keep createdAt for joined date display
        (state as any).createdAt = (p as any).createdAt ?? "";
      })
      .addCase(getprofile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message ?? "";
      })
      .addCase(get_my_history.pending, (state, action) => {
        state.history_stats = "loading";
      })
      .addCase(get_my_history.fulfilled, (state, action) => {
        state.history_stats = "succeeded";

        state.historys = action.payload;
      })
      .addCase(get_my_history.rejected, (state, action) => {
        state.history_stats = "failed";
        state.history_message = action.error?.message ?? "Check internet connection";
      })
      .addCase(get_monthly_history.pending, (state, action) => {
        state.monthly_history_stats = "loading";
      })
      .addCase(get_monthly_history.fulfilled, (state, action) => {
        state.monthly_history_stats = "succeeded";

        state.monthly = action.payload.Month;
      })
      .addCase(get_monthly_history.rejected, (state, action) => {
        state.monthly_history_stats = "failed";
        state.monthly_history_messege = action.error?.message ?? "Check internet connection";
      })
      .addCase(deposit.pending, (state, action) => {
        state.deposit_stats = "loading";
      })
      .addCase(deposit.fulfilled, (state, action) => {
        state.deposit_stats = "succeeded";

        state.deposit_message = action.payload.message;
      })
      .addCase(deposit.rejected, (state, action) => {
        state.deposit_stats = "failed";
        state.deposit_message = action.error?.message ?? "Check internet connection";
      })
      .addCase(follow.pending, (state, action) => {
        state.follow_stats = "loading";
      })
      .addCase(follow.fulfilled, (state, action) => {
        state.follow_stats = "succeeded";
      })
      .addCase(follow.rejected, (state, action) => {
        state.follow_stats = "failed";
        state.deposit_message = action.error?.message ?? "Check internet connection";
      })
      .addCase(unfollow.pending, (state, action) => {
        state.unfollow_stats = "loading";
      })
      .addCase(unfollow.fulfilled, (state, action) => {
        state.unfollow_stats = "succeeded";
      })
      .addCase(unfollow.rejected, (state, action) => {
        state.unfollow_stats = "failed";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })

      .addCase(getfollow.pending, (state, action) => {
        state.getfollow_stats = "loading";
      })
      .addCase(getfollow.fulfilled, (state, action) => {
        state.getfollow_stats = "succeeded";
        state.getfollow_data = action.payload.data;
      })
      .addCase(getfollow.rejected, (state, action) => {
        state.getfollow_stats = "failed";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(post_exclusive_img.pending, (state, action) => {
        state.posteximgStats = "loading";
      })
      .addCase(post_exclusive_img.fulfilled, (state, action) => {
        state.posteximgStats = "succeeded";
        console.log("content img " + action.payload);
        state.postexIMG = action.payload.img ?? "";
        state.thumbimg = action.payload.thumb ?? "";
      })
      .addCase(post_exclusive_img.rejected, (state, action) => {
        state.posteximgStats = "failed";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(post_exclusive_content.pending, (state, action) => {
        state.postexstats = "loading";
      })
      .addCase(post_exclusive_content.fulfilled, (state, action) => {
        state.postexstats = "succeeded";
      })
      .addCase(post_exclusive_content.rejected, (state, action) => {
        state.postexstats = "failed";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(buy_exclusive_content.pending, (state, action) => {
        state.buyexstats = "loading";
      })
      .addCase(buy_exclusive_content.fulfilled, (state, action) => {
        state.buyexstats = "succeeded";
      })
      .addCase(buy_exclusive_content.rejected, (state, action) => {
        state.buyexstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(delete_exclusive_content.pending, (state, action) => {
        state.deleteexstats = "loading";
      })
      .addCase(delete_exclusive_content.fulfilled, (state, action) => {
        state.deleteexstats = "succeeded";
      })
      .addCase(delete_exclusive_content.rejected, (state, action) => {
        state.deleteexstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(getcollection.pending, (state, action) => {
        state.collectionstats = "loading";
      })
      .addCase(getcollection.fulfilled, (state, action) => {
        state.listofcontent = action.payload.data.allcontent;
        state.listofcrush = action.payload.data.allcrush;
        state.collectionstats = "succeeded";
      })
      .addCase(getcollection.rejected, (state, action) => {
        state.collectionstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(deletecollection.pending, (state, action) => {
        state.deletecolstats = "loading";
      })
      .addCase(deletecollection.fulfilled, (state, action) => {
        state.deletecolstats = "succeeded";
      })
      .addCase(deletecollection.rejected, (state, action) => {
        state.deletecolstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(delete_exclusive_thumb.pending, (state, action) => {
        state.thumbdelstats = "loading";
      })
      .addCase(delete_exclusive_thumb.fulfilled, (state, action) => {
        state.thumbdelstats = "succeeded";
      })
      .addCase(delete_exclusive_thumb.rejected, (state, action) => {
        state.thumbdelstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(deleteprofile.pending, (state, action) => {
        state.deleteaccstats = "loading";
      })
      .addCase(deleteprofile.fulfilled, (state, action) => {
        state.deleteaccstats = "succeeded";
      })
      .addCase(deleteprofile.rejected, (state, action) => {
        state.deleteaccstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(getblockedUsers.pending, (state, action) => {
        state.blockuserstats = "loading";
      })
      .addCase(getblockedUsers.fulfilled, (state, action) => {
        state.blockuserstats = "succeeded";
        state.listofblockuser = action.payload.users;
      })
      .addCase(getblockedUsers.rejected, (state, action) => {
        state.blockuserstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(deleteblockedUsers.pending, (state, action) => {
        state.removeblockstats = "loading";
      })
      .addCase(deleteblockedUsers.fulfilled, (state, action) => {
        state.removeblockstats = "succeeded";
      })
      .addCase(deleteblockedUsers.rejected, (state, action) => {
        state.removeblockstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(updatesetting.pending, (state, action) => {
        state.updatesettingstats = "loading";
      })
      .addCase(updatesetting.fulfilled, (state, action) => {
        state.updatesettingstats = "succeeded";
      })
      .addCase(updatesetting.rejected, (state, action) => {
        state.updatesettingstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(getsearch.pending, (state, action) => {
        state.searchstats = "loading";
      })
      .addCase(getsearch.fulfilled, (state, action) => {
        state.searchstats = "succeeded";
        state.search_users = action.payload.users;
      })
      .addCase(getsearch.rejected, (state, action) => {
        state.searchstats = "failed";
        state.testmsg = action.error?.message ?? "Check internet connection";
      });
  },
});

export default profile.reducer;
export const { ProfilechangeStatus, setlastnote, setmessagelastnote } =
  profile.actions;
