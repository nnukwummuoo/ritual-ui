/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { URL } from "../api/config";
import axios from "axios";
import { ProfileState } from "@/types/profile";
import { RootState } from "@/store/store";

// Define types for API responses
interface FollowData {
  followers: Array<any>;
  following: Array<any>;
}

interface UsersData {
  users: Array<any>;
}

interface CollectionData {
  allcontent: Array<any>;
  allcrush: Array<any>;
}
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
  userId: "",
  firstname: "",
  lastname: "",
  email: "",
  nickname: "",
  active: false,
  State: "",
  country: "",
  balance: "",
  pending: "0",
  earnings: "0",
  admin: false,
  witdrawable: "",
  creator: "false",
  status: "idle",
  error: "",
  creatorID: "",
  creatorphotolink: "",
  creatorname: "",
  photolink: "",
  bio: "",
  createdAt: "",
  history_stats: "idle",
  history_message: "",
  historys: {},
  monthly_history_stats: "idle",
  monthly_history_messege: "",
  monthly: [] as any[],
  deposit_stats: "idle",
  deposit_message: "",
  exclusive_verify: false,
  follow_stats: "idle",
  unfollow_stats: "idle",
  getfollow_data: {} as FollowData,
  getfollow_stats: "idle",
  fllowmsg: "",
  getAllUsers_stats: "idle",
  getAllUsers_data: [] as any[],
  postexIMG: "",
  thumbimg: "",
  posteximgStats: "idle",
  postexstats: "idle",
  buyexstats: "idle",
  deleteexstats: "idle",
  collectionstats: "idle",
  deletecolstats: "idle",
  listofcontent: [] as any[],
  listofcrush: [] as any[],
  thumbdelstats: "idle",
  deleteaccstats: "idle",
  listofblockuser: [] as any[],
  blockuserstats: "idle",
  removeblockstats: "idle",
  updatesettingstats: "idle",
  emailnote: false,
  pushnote: false,
  lastnote: 0,
  lastmessagenote: 0,
  searchstats: "idle",
  search_users: [] as any[],
  testmsg: "",
  closedraw: false,
};

export const getprofile = createAsyncThunk<
  { profile: any },
  { userid: string; token: string },
  { rejectValue: { message: string; code?: number } }
>(
  "profile/getprofile",
  async (data, thunkAPI) => {
    try {
      // Enhanced logging for profile data fetching

      const response = await axios.post(`${URL}/getprofile`, data);
      

      return response.data;
    } catch (err) {
      // Surface backend message and status for graceful UI
      if (axios.isAxiosError(err)) {
        const network = !err.response; // no response => likely ECONNREFUSED / CORS / offline
        const code = err.response?.status ?? (err as any)?.code;
        const backendMsg = (err.response?.data as any)?.message;
        const message = network
          ? "Cannot reach server. Please check your connection or start the backend."
          : backendMsg || err.message || "Unable to load profile";
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          try {
            const summary = JSON.stringify({
              code,
              message,
              network,
              statusText: err.response?.statusText,
              url: err.config?.url,
              method: err.config?.method,
            });
            console.warn("[getprofile] axios warning", summary);
          } catch {
            // eslint-disable-next-line no-console
            console.warn("[getprofile] axios warning", String(message));
          }
        }
        return thunkAPI.rejectWithValue({ message, code });
      }
      const message = getErrorMessage(err);
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn("[getprofile] unknown error", message, err);
      }
      return thunkAPI.rejectWithValue({ message });
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

export const updatesetting = createAsyncThunk<{ message: string }, { userid: string; token: string; emailnot: boolean; pushnot: boolean }>(
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

export const deleteblockedUsers = createAsyncThunk<{ message: string }, { userid: string; token: string }>(
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

export const deleteprofile = createAsyncThunk<any, void, { state: RootState }>(
  "profile/deleteprofile",
  async (_, { getState }) => {
    const state = getState();
    const userId = state.profile.userId;  // 👈 safely read from Redux

    const res = await axios.delete(
      `${process.env.NEXT_PUBLIC_API}/deleteaccount`,
      {
        data: { userid: userId },
        withCredentials: true,
      }
    );
    return res.data;
  }
);

export const getcollection = createAsyncThunk<{ data: CollectionData }, { userid: string; token: string }>(
  "profile/getcollection",
  async (data) => {
    try {
      let response = await axios.put(`${URL}/exclusivecontent`, data);
      return response.data;
    } catch (err : any) {
      throw getErrorMessage(err);
    }
  }
);

export const getblockedUsers = createAsyncThunk<{ users: any[] }, { userid: string; token: string }>(
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

export const deletecollection = createAsyncThunk<{ message: string }, { userid: string; token: string; contentid: string }>(
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
  { message: string },
  PostExclusiveContentPayload
>(
  "profile/post_exclusive_content",
  async (data: PostExclusiveContentPayload) => {
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


      let response = await axios.put(`${URL}/exclusive`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        // Post was not successfully created
        throw "Error creating your verifying your creator";
      }

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      throw getErrorMessage(err);
    }
  }
);

export const buy_exclusive_content = createAsyncThunk<{ message: string }, { userid: string; token: string; contentid: string }>(
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

export const delete_exclusive_content = createAsyncThunk<{ message: string }, { userid: string; token: string; contentid: string }>(
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

export const get_my_history = createAsyncThunk<{ history: any[] }, { userid: string; token: string }>(
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

export const get_monthly_history = createAsyncThunk<{ Month: any[] }, { userid: string; token: string }>(
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

export const deposit = createAsyncThunk<{ message: string }, { userid: string; token: string; amount: number }>("profile/deposit", async (data) => {
  try {
    let response = await axios.post(`${URL}/topup`, data);
    // console.log('under get profile')

    return response.data;
  } catch (err : any) {
    // console.log('erro get profile')
    throw getErrorMessageWithNetworkFallback(err);
  }
});

export const follow = createAsyncThunk<
  { message: string }, 
  { userid: string; followerid: string; token: string }
>("profile/follow", async (data) => {
  try {
    
    // Send only userid and followerid in body (backend doesn't expect authentication)
    const requestBody = {
      userid: data.userid,
      followerid: data.followerid
    };
    
    
    let response = await axios.post(`${URL}/follow`, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    

    return response.data;
  } catch (err : any) {
    console.error("❌ [follow] Error details:", {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data,
        headers: err.config?.headers
      }
    });
    
    // Log the specific error data from backend
    if (err.response?.data) {
      console.error("🔍 [follow] Backend error response:", JSON.stringify(err.response.data, null, 2));
    }
    throw getErrorMessageWithNetworkFallback(err);
  }
});

export const unfollow = createAsyncThunk<
  { message: string }, 
  { userid: string; followerid: string; token: string }
>("profile/unfollow", async (data) => {
  try {
    
    // Send only userid and followerid in body (backend doesn't expect authentication)
    const requestBody = {
      userid: data.userid,
      followerid: data.followerid
    };
    
    
    let response = await axios.put(`${URL}/follow`, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    

    return response.data;
  } catch (err : any) {
    console.error("❌ [unfollow] Error details:", {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data,
        headers: err.config?.headers
      }
    });
    
    // Log the specific error data from backend
    if (err.response?.data) {
      console.error("🔍 [unfollow] Backend error response:", JSON.stringify(err.response.data, null, 2));
    }
    throw getErrorMessageWithNetworkFallback(err);
  }
});

export const getfollow = createAsyncThunk<{ data: FollowData }, { userid: string; token: string }>("profile/getfollow", async (data) => {
  try {
    // Debug: trace outgoing request for followers/following

    // Set up headers with authorization token if available
    const headers = data.token ? { 
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };

    let response = await axios.post(`${URL}/getfollowers`, 
      { userid: data.userid }, 
      { headers }
    );
    

    return response.data;
  } catch (err) {
    console.error("[getfollow] error", err);
    throw getErrorMessageWithNetworkFallback(err);
  }
});

export const getAllUsers = createAsyncThunk<{ users: Array<any> }, { token: string; userid?: string }>("profile/getAllUsers", async (data) => {
  try {
    
    // Set up headers with authorization token if available
    const headers = data.token ? { 
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
    
    let response = await axios.post(`${URL}/getallusers`, { 
      token: data.token,
      userid: data.userid 
    }, { headers });

    return response.data;
  } catch (err) {
    console.error("[getAllUsers] error", err);
    throw getErrorMessageWithNetworkFallback(err);
  }
});

export const post_exclusive_img = createAsyncThunk<
  { img: string | undefined; thumb: string | undefined },
  PostExclusiveImgPayload
>(
  "profile/post_exclusive_img",
  async (data: PostExclusiveImgPayload) => {
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
      })
      .addCase(getprofile.fulfilled, (state, action) => {
        state.status = "succeeded";

        const p = action.payload?.profile ?? {};
        state.userId = p.userId ?? p._id ?? "";
        state.firstname = p.firstname ?? "";
        state.lastname = p.lastname ?? "";
        state.nickname = p.nickname ?? "";
        state.active = p.active ?? false;
        // Use state if present, otherwise fall back to country for display
        state.State = (p as any).state ?? p.country ?? "";
        state.country = p.country ?? "";
        state.balance = p.balance ?? "";
        // Add pending balance field
        (state as any).pending = p.pending ?? "0";
        // Add earnings field
        (state as any).earnings = p.earnings ?? "0";
        // Backend may return either boolean creator or creator_portfolio
        state.creator = (p as any).creator ?? (p as any).creator_portfolio ?? false as any;
        // Backend may use creatorId
        state.creatorID = (p as any).creatorID ?? (p as any).creatorId ?? "";
        state.creatorname = (p as any).creatorname ?? "";
        state.creatorphotolink = (p as any).creatorphotolink ?? "";
        state.photolink = (p as any).photolink ?? (p as any).photoLink ?? "";
        state.bio = (p as any).bio ?? "";
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
        // Prefer structured error from rejectWithValue
        state.error = (action.payload as any)?.message ?? action.error?.message ?? "";
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
      .addCase(getAllUsers.pending, (state, action) => {
        state.getAllUsers_stats = "loading";
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.getAllUsers_stats = "succeeded";
        state.getAllUsers_data = action.payload.users;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.getAllUsers_stats = "failed";
        state.fllowmsg = action.error?.message ?? "Check internet connection";
      })
      .addCase(post_exclusive_img.pending, (state, action) => {
        state.posteximgStats = "loading";
      })
      .addCase(post_exclusive_img.fulfilled, (state, action) => {
        state.posteximgStats = "succeeded";
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