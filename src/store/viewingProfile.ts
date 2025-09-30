import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { URL } from '../api/config';
import type { Profile } from '@/types/profile';

interface ViewingProfileState {
  // Profile data for the user being viewed
  userId: string;
  firstname: string;
  lastname: string;
  nickname: string;
  bio: string;
  photolink: string;
  State: string;
  country: string;
  active: boolean;
  creator: boolean;
  creatorID: string;
  creatorname: string;
  creatorphotolink: string;
  exclusive_verify: boolean;
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
}

const initialState: ViewingProfileState = {
  userId: "",
  firstname: "",
  lastname: "",
  nickname: "",
  bio: "",
  photolink: "",
  State: "",
  country: "",
  active: false,
  creator: false,
  creatorID: "",
  creatorname: "",
  creatorphotolink: "",
  exclusive_verify: false,
  createdAt: "",
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
};

// Async thunk to get profile data for viewing
export const getViewingProfile = createAsyncThunk(
  'viewingProfile/getProfile',
  async ({ userid, token }: { userid: string; token: string }) => {
    try {
      const response = await axios.post(`${URL}/getprofile`, { userid, token });

      return response.data;
    } catch (error) {
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
      .addCase(getViewingProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getViewingProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        
        const p = action.payload?.profile ?? {};
        state.userId = p.userId ?? p._id ?? "";
        state.firstname = p.firstname ?? "";
        state.lastname = p.lastname ?? "";
        state.nickname = p.nickname ?? "";
        state.active = p.active ?? false;
        state.State = (p as any).state ?? p.country ?? "";
        state.country = p.country ?? "";
        state.balance = p.balance ?? "";
        state.creator = (p as any).creator ?? (p as any).creator_listing ?? false;
        state.creatorID = (p as any).creatorID ?? (p as any).creatorId ?? "";
        state.creatorname = (p as any).creatorname ?? "";
        state.creatorphotolink = (p as any).creatorphotolink ?? "";
        state.photolink = (p as any).photolink ?? (p as any).photoLink ?? "";
        state.bio = (p as any).bio ?? "";
        state.admin = p.admin ?? false;
        state.exclusive_verify = (p as any).exclusive ?? (p as any).exclusive_verify ?? false;
        state.createdAt = (p as any).createdAt ?? "";
      })
      .addCase(getViewingProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch profile";
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
