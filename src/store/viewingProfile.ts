import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { URL } from '../api/config';
import type { Profile } from '@/types/profile';

interface ViewingProfileState {
  // Profile data for the user being viewed
  userId: string;
  firstname: string;
  lastname: string;
  username: string;
  bio: string;
  photolink: string;
  State: string;
  country: string;
  active: boolean;
  creator: boolean;
  creator_portfolio_id: string;
  creatorname: string;
  creatorphotolink: string;
  hosttype: string;
  creator_verified: boolean;
  fan_verified: boolean;
  Creator_Application_status: string;
  fan_application_status: string;
  createdAt: string;
  balance: string;
  admin: boolean;
  
  // Status tracking
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  
  // Follow data
  getfollow_data: any;
  getfollow_stats: "idle" | "loading" | "succeeded" | "failed";
  follow_stats: "idle" | "loading" | "succeeded" | "failed";
  unfollow_stats: "idle" | "loading" | "succeeded" | "failed";
  fllowmsg: string;
  
  // Other users data
  getAllUsers_data: any[];
  getAllUsers_stats: "idle" | "loading" | "succeeded" | "failed";
  
  // Search
  search_users: any[];
  searchstats: "idle" | "loading" | "succeeded" | "failed";

  /** Slug/userid we are currently fetching; used to ignore stale responses when navigating away */
  requestKey: string;
}

const initialState: ViewingProfileState = {
  userId: "",
  firstname: "",
  lastname: "",
  username: "",
  bio: "",
  photolink: "",
  State: "",
  country: "",
  active: false,
  creator: false,
  creator_portfolio_id: "",
  creatorname: "",
  creatorphotolink: "",
  hosttype: "Fan meet",
  creator_verified: false,
  fan_verified: false,
  createdAt: "",
  Creator_Application_status: "none",
  fan_application_status: "none",
  balance: "",
  admin: false,
  
  status: "idle",
  error: null,
  
  getfollow_data: {},
  getfollow_stats: "idle",
  follow_stats: "idle",
  unfollow_stats: "idle",
  fllowmsg: "",
  
  getAllUsers_data: [],
  getAllUsers_stats: "idle",
  
  search_users: [],
  searchstats: "idle",

  requestKey: "",
};

// Async thunk to get profile data for viewing (accepts userid or username)
export const getViewingProfile = createAsyncThunk(
  'viewingProfile/getProfile',
  async ({ userid, username, token }: { userid?: string; username?: string; token: string }, { rejectWithValue }) => {
    const payload: { userid?: string; username?: string; token: string } = { token };
    if (username && String(username).trim()) payload.username = String(username).trim();
    else if (userid) payload.userid = userid;
    try {
      const response = await axios.post(`${URL}/getprofile`, payload);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        const data = error.response?.data as { message?: string; debug?: unknown };
        return rejectWithValue(data?.message || 'User not found.');
      }
      console.error('Error fetching viewing profile:', error);
      throw error;
    }
  }
);

// Async thunk to get follow data for viewing profile
export const getViewingFollow = createAsyncThunk(
  'viewingProfile/getFollow',
  async ({ userid, token }: { userid: string; token: string }) => {
    try {
      const response = await axios.post(`${URL}/getfollowers`, { userid, token });

      return response.data;
    } catch (error) {
      console.error('Error fetching viewing follow data:', error);
      throw error;
    }
  }
);

// Async thunk to get all users
export const getAllUsersForViewing = createAsyncThunk(
  'viewingProfile/getAllUsers',
  async ({ token }: { token: string }) => {
    try {
      const response = await axios.post(`${URL}/getallusers`, { token });

      return response.data;
    } catch (error) {
      console.error('Error fetching all users for viewing:', error);
      throw error;
    }
  }
);

const viewingProfileSlice = createSlice({
  name: 'viewingProfile',
  initialState,
  reducers: {
    clearViewingProfile: (state) => {
      // Reset to initial state
      Object.assign(state, initialState);
    },
    setViewingProfileStatus: (state, action: PayloadAction<ViewingProfileState["status"]>) => {
      state.status = action.payload;
      state.getfollow_stats = action.payload;
      state.follow_stats = action.payload;
      state.unfollow_stats = action.payload;
      state.getAllUsers_stats = action.payload;
      state.searchstats = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getViewingProfile.pending, (state, action) => {
        state.status = "loading";
        state.requestKey = (action.meta.arg?.username || action.meta.arg?.userid || "") as string;
      })
      .addCase(getViewingProfile.fulfilled, (state, action) => {
        const requested = (action.meta.arg?.username || action.meta.arg?.userid || "") as string;
        if (state.requestKey && requested !== state.requestKey) {
          return; // Stale response (e.g. navigated to another profile); ignore
        }
        state.status = "succeeded";
        state.error = null;
        const raw = action.payload;
        const p = raw?.profile ?? raw?.data?.profile ?? {};
        const id = p.userId ?? p._id;
        state.userId = id != null ? String(id) : "";
        state.firstname = p.firstname ?? "";
        state.lastname = p.lastname ?? "";
        state.username = p.username ?? "";
        state.active = p.active ?? false;
        state.State = (p as any).state ?? p.country ?? "";
        state.country = p.country ?? "";
        state.balance = p.balance ?? "";
        state.creator = (p as any).creator ?? (p as any).creator_portfolio ?? false;
        state.creator_portfolio_id = (p as any).creator_portfolio_id ?? (p as any).creator_portfolio_id ?? "";
        state.creatorname = (p as any).creatorname ?? "";
        state.creatorphotolink = (p as any).creatorphotolink ?? "";
        state.hosttype = (p as any).hosttype ?? "Fan meet";
        state.photolink = (p as any).photolink ?? (p as any).photoLink ?? "";
        state.bio = (p as any).bio ?? "";
        state.admin = p.admin ?? false;
        state.creator_verified = (p as any).exclusive ?? (p as any).creator_verified ?? false;
        state.fan_verified = (p as any).fan_verified ?? false;
        state.Creator_Application_status = (p as any).Creator_Application_status ?? "none";
        state.fan_application_status = (p as any).fan_application_status ?? "none";
        state.createdAt = (p as any).createdAt ?? "";
      })
      .addCase(getViewingProfile.rejected, (state, action) => {
        const requested = (action.meta.arg?.username || action.meta.arg?.userid || "") as string;
        if (state.requestKey && requested !== state.requestKey) {
          return; // Stale rejection; ignore
        }
        state.status = "failed";
        state.error = (action.payload as string) || action.error.message || "Failed to fetch profile";
      })
      .addCase(getViewingFollow.pending, (state) => {
        state.getfollow_stats = "loading";
      })
      .addCase(getViewingFollow.fulfilled, (state, action) => {
        state.getfollow_stats = "succeeded";
        state.getfollow_data = action.payload.data;
      })
      .addCase(getViewingFollow.rejected, (state, action) => {
        state.getfollow_stats = "failed";
      })
      .addCase(getAllUsersForViewing.pending, (state) => {
        state.getAllUsers_stats = "loading";
      })
      .addCase(getAllUsersForViewing.fulfilled, (state, action) => {
        state.getAllUsers_stats = "succeeded";
        state.getAllUsers_data = action.payload?.users ?? [];
      })
      .addCase(getAllUsersForViewing.rejected, (state, action) => {
        state.getAllUsers_stats = "failed";
      });
  },
});

export const { clearViewingProfile, setViewingProfileStatus } = viewingProfileSlice.actions;
export default viewingProfileSlice.reducer;
