import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "@/api/config";
import { saveImage } from "@/api/sendImage";
import axios from "axios";
import type { RootState } from "./store";

export interface RegisterState {
  status: string;
  error: string | null;
  verifystatus: string;
  userID: string;
  compstats: string;
  message: string;
  logedin: boolean;
  refreshtoken: string;
  accesstoken: string;
  logstats: string;
  email: string;
  password: string;
  forgetpassstate: string;
  conpasswordstate: string;
  chagepassword: string;
  modelId?: string;
  isModel?: boolean;
}

const getInitialState = (): RegisterState => {
  let initialState: RegisterState = {
    status: "idle",
    error: null,
    verifystatus: "idle",
    userID: "",
    compstats: "",
    message: "",
    logedin: false,
    refreshtoken: "",
    accesstoken: "",
    logstats: "idle",
    email: "",
    password: "",
    forgetpassstate: "idle",
    conpasswordstate: "idle",
    chagepassword: "idle",
  };

  try {
    const loginData = localStorage.getItem("login");
    if (loginData) {
      const parsed = JSON.parse(loginData);
      initialState.email = parsed.email || "";
      initialState.refreshtoken = parsed.refreshtoken || "";
      initialState.accesstoken = parsed.accesstoken || "";
      initialState.userID = parsed.userID || "";
      initialState.modelId = parsed.modelId || "";
      initialState.isModel = parsed.isModel || false;
      initialState.logedin = !!parsed.accesstoken;
    }
  } catch (error) {
    console.error("Failed to initialize state from localStorage:", error);
  }

  return initialState;
};

const initialState: RegisterState = getInitialState();

export const registernewUser = createAsyncThunk(
  "register/registernewUser",
  async (data, { rejectWithValue }) => {
    console.log("Register request data:", data);
    try {
      let response = await axios.post(`https://mmekoapi.onrender.com/register`, data);
      return response.data;
    } catch (err: any) {
      console.error("Register error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const verifyemail = createAsyncThunk(
  "register/verifyemail",
  async (data, { rejectWithValue }) => {
    try {
      let response = await axios.post(`${URL}/verifyemail`, data);
      return response.data;
    } catch (err: any) {
      console.error("Verify email error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || "Email verification failed");
    }
  }
);

export const registercomplete = createAsyncThunk(
  "register/registercomplete",
  async (data: any, { rejectWithValue }) => {
    try {
      let infomfomation;
      let link;

      if (data.photoLink) {
        link = await saveImage(data.photoLink, "profile");
        console.log("Profile image link:", link);
      } else {
        link = "";
      }

      infomfomation = {
        useraccountId: data.useraccountId,
        interestedIn: data.interestedIn,
        photoLink: link,
        relationshipType: data.relationshipType,
        details: data.details,
      };
      console.log("Complete register data:", infomfomation);

      let response = await axios.post(`${URL}/completeregister`, infomfomation);
      return response.data;
    } catch (err: any) {
      console.error("Complete register error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || "Complete registration failed");
    }
  }
);

export const loginuser = createAsyncThunk(
  "register/loginuser",
  async (data, { rejectWithValue }) => {
    try {
      console.log("Sending login request with data:", data);
      let response = await axios.post(`https://mmekoapi.onrender.com/login`, data);
      console.log("Login API response:", response.data);
      if (!response.data.accessToken) {
        console.warn("No accessToken in response:", response.data);
      }
      return response.data;
    } catch (err: any) {
      console.error("Login error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || "Check internet connection");
    }
  }
);

export const forgetpass = createAsyncThunk(
  "register/forgetpass",
  async (data, { rejectWithValue }) => {
    try {
      let response = await axios.post(`${URL}/forgetpassword`, data);
      return response.data;
    } catch (err: any) {
      console.error("Forget password error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || "Password reset failed");
    }
  }
);

export const comfirmpasscode = createAsyncThunk(
  "register/comfirmpasscode",
  async (data, { rejectWithValue }) => {
    try {
      let response = await axios.post(`${URL}/comfirmpasscode`, data);
      return response.data;
    } catch (err: any) {
      console.error("Confirm passcode error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || "Passcode confirmation failed");
    }
  }
);

export const ChangePass = createAsyncThunk(
  "register/ChangePass",
  async (data, { rejectWithValue }) => {
    try {
      let response = await axios.post(`${URL}/changepassword`, data);
      return response.data;
    } catch (err: any) {
      console.error("Change password error:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data?.message || "Password change failed");
    }
  }
);

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    changeStatus(state, action) {
      state.status = action.payload;
      state.chagepassword = action.payload;
    },
    changeemailvery(state, action) {
      state.verifystatus = action.payload;
    },
    changecompleate(state, action) {
      state.compstats = action.payload.compstats;
      state.message = action.payload.message;
    },
    changelogin(state, action) {
      state.logstats = action.payload.logstats;
      state.message = action.payload.message;
    },
    savelogin(state, action) {
      const { email, password } = action.payload;
      state.email = email;
      state.password = password;
    },
    changepasswordback(state, action) {
      state.chagepassword = action.payload;
    },
    loginAuthUser(state, action) {
      state.email = action.payload.email;
      state.password = action.payload.password;
      state.message = action.payload.message;
      state.logedin = true;
      state.refreshtoken = action.payload.refreshToken || action.payload.refreshtoken;
      state.accesstoken = action.payload.accessToken || action.payload.accesstoken;
      state.userID = action.payload.userId;
      state.modelId = action.payload.modelId;
      state.isModel = action.payload.isModel;
    },
    logout(state) {
      state.accesstoken = "";
      state.refreshtoken = "";
      state.userID = "";
      state.logedin = false;
      state.email = "";
      state.password = "";
      state.modelId = "";
      state.isModel = false;
      try {
        localStorage.removeItem("login");
      } catch (error) {
        console.error("Failed to clear localStorage:", error);
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(registernewUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registernewUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = action.payload.message;
      })
      .addCase(registernewUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string || "Registration failed";
      })
      .addCase(verifyemail.pending, (state) => {
        state.verifystatus = "loading";
      })
      .addCase(verifyemail.fulfilled, (state, action) => {
        state.verifystatus = "succeeded";
        state.userID = action.payload.ID;
      })
      .addCase(verifyemail.rejected, (state, action) => {
        state.verifystatus = "failed";
        state.error = action.payload as string || "Email verification failed";
      })
      .addCase(registercomplete.pending, (state) => {
        state.compstats = "loading";
      })
      .addCase(registercomplete.fulfilled, (state, action) => {
        state.compstats = "succeeded";
        state.message = action.payload.message;
      })
      .addCase(registercomplete.rejected, (state, action) => {
        state.compstats = "failed";
        state.error = action.payload as string || "Complete registration failed";
      })
      .addCase(loginuser.pending, (state) => {
        state.logstats = "loading";
      })
      .addCase(loginuser.fulfilled, (state, action) => {
        try {
          localStorage.setItem(
            "login",
            JSON.stringify({
              email: state.email,
              refreshtoken: action.payload.token,
              accesstoken: action.payload.accessToken,
              userID: action.payload.userId,
              modelId: action.payload.modelId,
              isModel: action.payload.isModel,
            })
          );
        } catch (error) {
          console.error("Failed to save login data to localStorage:", error);
        }

        state.logstats = "succeeded";
        state.message = action.payload.message;
        state.logedin = true;
        state.refreshtoken = action.payload.token;
        state.accesstoken = action.payload.accessToken;
        state.userID = action.payload.userId;
        state.modelId = action.payload.modelId;
        state.isModel = action.payload.isModel;
      })
      .addCase(loginuser.rejected, (state, action) => {
        state.logstats = "failed";
        state.error = action.payload as string || "Check internet connection";
      })
      .addCase(forgetpass.pending, (state) => {
        state.forgetpassstate = "loading";
      })
      .addCase(forgetpass.fulfilled, (state) => {
        state.forgetpassstate = "succeeded";
      })
      .addCase(forgetpass.rejected, (state, action) => {
        state.forgetpassstate = "failed";
        state.error = action.payload as string || "Password reset failed";
      })
      .addCase(comfirmpasscode.pending, (state) => {
        state.conpasswordstate = "loading";
      })
      .addCase(comfirmpasscode.fulfilled, (state, action) => {
        state.conpasswordstate = "succeeded";
        state.userID = action.payload.userId;
      })
      .addCase(comfirmpasscode.rejected, (state, action) => {
        state.conpasswordstate = "failed";
        state.error = action.payload as string || "Passcode confirmation failed";
      })
      .addCase(ChangePass.pending, (state) => {
        state.chagepassword = "loading";
      })
      .addCase(ChangePass.fulfilled, (state) => {
        state.chagepassword = "succeeded";
      })
      .addCase(ChangePass.rejected, (state, action) => {
        state.conpasswordstate = "failed";
        state.error = action.payload as string || "Password change failed";
      });
  },
});

export default registerSlice.reducer;
export const status = (state: RootState) => state.register.status;
export const error = (state: RootState) => state.register.error;
export const {
  changeStatus,
  changeemailvery,
  changecompleate,
  savelogin,
  changelogin,
  loginAuthUser,
  changepasswordback,
  logout,
} = registerSlice.actions;