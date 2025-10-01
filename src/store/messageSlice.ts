import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "@/api/config";
import axios from "axios";
import { MessageState } from "@/types/message";
import { RootState } from "./store";
// import { saveImage, deleteImage, updateImage } from "../../../api/sendImage";

const initialState: MessageState = {
  currentmessagestatus: "idle",
  listofcurrentmessage: [],
  msgnitocations: [],
  lastmessage:"",
  msgnotifystatus: "idle",
  recentmsg: [],
  Allmsg: [],
  mymessagenotifystatus: "idle",
  messageupdatestatus: "idle",
  giftstats: "idle",
  giftmessage: "",
  chatinfo:{},
  video_call_message:"",
  video_call_data:null,
  calling:false,
  spd_call:null,
  offer:null,
  rejectAnswer:null
};

export const getchat = createAsyncThunk< { chats: any[]; chatInfo: any }, any>("chat/getchat", async (data, thunkAPI) => {
  try {
    console.log("🌐 [GETCHAT_API] ===== STARTING GETCHAT API CALL =====");
    console.log("🌐 [GETCHAT_API] Making API call to getcurrentchat with data:", data);
    console.log("🌐 [GETCHAT_API] API URL:", `${URL}/getcurrentchat`);
    
    const state = thunkAPI.getState() as RootState;
    const token = state.register.refreshtoken || state.register.accesstoken || (() => {
      try {
        return JSON.parse(localStorage.getItem("login") || "{}").refreshtoken || 
               JSON.parse(localStorage.getItem("login") || "{}").accesstoken;
      } catch {
        return "";
      }
    })();

    console.log("🔑 [GETCHAT_API] Token available:", !!token);

    // Use the same pattern as ProfilePage - include token in request body
    const requestData = {
      ...data,
      token: token || ""
    };

    console.log("📤 [GETCHAT_API] Request data with token:", {
      creatorid: requestData.creatorid,
      clientid: requestData.clientid,
      hasToken: !!requestData.token
    });

    console.log("🌐 [GETCHAT_API] Making axios request to:", `${URL}/getcurrentchat`);
    console.log("🌐 [GETCHAT_API] Request data:", requestData);
    console.log("🌐 [GETCHAT_API] Full URL:", `${URL}/getcurrentchat`);
    console.log("🌐 [GETCHAT_API] URL variable:", URL);
    
    // Remove the test GET request - we need PUT request
    
    let response = await axios.put(`${URL}/getcurrentchat`, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("🌐 [GETCHAT_API] Axios request completed successfully");

    console.log("✅ [GETCHAT_API] API response received:", response.data);
    console.log("📊 [GETCHAT_API] Response status:", response.status);
    console.log("📊 [GETCHAT_API] Response data keys:", Object.keys(response.data || {}));
    console.log("📊 [GETCHAT_API] Response data type:", typeof response.data);
    console.log("📊 [GETCHAT_API] Response data.chats:", response.data.chats);
    console.log("📊 [GETCHAT_API] Response data.chats length:", response.data.chats?.length);
    console.log("📊 [GETCHAT_API] Response data.chatInfo:", response.data.chatInfo);
    
    return response.data;
  } catch (err : any) {
    console.error("❌ [GETCHAT_API] ===== API CALL FAILED =====");
    console.error("❌ [GETCHAT_API] API call failed:", err);
    console.error("❌ [GETCHAT_API] Error response:", err.response?.data);
    console.error("❌ [GETCHAT_API] Error status:", err.response?.status);
    console.error("❌ [GETCHAT_API] Error message:", err.message);
    console.error("❌ [GETCHAT_API] Full error:", err);
    
    if (!err.response?.data?.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});


export const getmsgnitify = createAsyncThunk(
  "chat/getmsgnitify",
  async (data: any, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.register.refreshtoken || state.register.accesstoken || (() => {
        try {
          return JSON.parse(localStorage.getItem("login") || "{}").refreshtoken || 
                 JSON.parse(localStorage.getItem("login") || "{}").accesstoken;
        } catch {
          return "";
        }
      })();

      // Use the same pattern as getchat - include token in request body
      const requestData = {
        ...data,
        token: token || ""
      };

      let response = await axios.put(`${URL}/getmsgnotify`, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (err: any) {
      
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as any)?.message ?? "check internet connection";
        throw msg;
      }
      throw "Unexpected error";
    }
  }
);

export const updatemessage = createAsyncThunk(
  "chat/updatemessage",
  async (data: any, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token =
        state.register.accesstoken ||
        (() => {
          try {
            return JSON.parse(localStorage.getItem("login") || "{}").accesstoken;
          } catch {
            return "";
          }
        })();

      let response = await axios.put(`${URL}/updatenotify`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw "Unexpected error";
    }
  }
);

export const getmessagenotication = createAsyncThunk(
  "chat/getmessagenotication",
  async (data: any, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.register.refreshtoken || state.register.accesstoken || (() => {
        try {
          return JSON.parse(localStorage.getItem("login") || "{}").refreshtoken || 
                 JSON.parse(localStorage.getItem("login") || "{}").accesstoken;
        } catch {
          return "";
        }
      })();

      // Use the same pattern as getchat - include token in request body
      const requestData = {
        ...data,
        token: token || ""
      };

      let response = await axios.put(`${URL}/messagenotification`, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (err : any) {
      
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as any)?.message ?? "check internet connection";
        throw msg;
      }
      throw "Unexpected error";
    }
  }
);

export const send_gift = createAsyncThunk("chat/send_gift", async (data) => {
  try {
    let response = await axios.put(`${URL}/giftcreator`, data);
    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
  }
});

const message = createSlice({
  name: "message",
  initialState,
  reducers: {
    changemessagestatus(state, action) {
      state.currentmessagestatus = action.payload;
      state.msgnotifystatus = action.payload;
      state.giftstats = action.payload;
      state.msgnotifystatus = action.payload
    },
    recivemessage(state, action) {
      state.listofcurrentmessage.forEach((index) => {
        action.payload((value: any) => [...value, index]);
      });

      state.listofcurrentmessage = [];
    },
    recivenotify(state, action) {
      state.msgnitocations = action.payload.data;
      let ID = action.payload.id;

      state.msgnitocations.forEach((value, index) => {
        state.msgnitocations.forEach((value2, index1) => {
          if (value.fromid === value2.fromid && value.toid === value2.toid) {
            state.Allmsg[index] = value2;
          } else {
            state.Allmsg.push(value);
          }
        });
      });

      state.Allmsg.forEach((value, index1) => {
        state.Allmsg.forEach((value1, index2) => {
          if (
            value.fromid === value1.fromid &&
            value.toid === value1.toid &&
            index1 !== index2
          ) {
            state.Allmsg.splice(index2, 1);
          }
        });
      });
    },
    removenotification(state, action) {
      let date = action.payload;

      let index = state.Allmsg.findIndex((value) => value.date === date);

      if (index !== -1) {
        state.Allmsg.splice(index, 1);
      }
    },
    reset_recent(state: any, action: any) {
      state.recentmsg = []
    },
    set_videocall_message(state, action) {
      state.video_call_message = action.payload
    },
    set_videocall_data(state, action) {
      state.video_call_data = action.payload
    },
    set_calling(state, action) {
      state.calling = action.payload
    },
    set_sdpcall(state, action) {
      state.spd_call = action.payload
    },
    set_offer(state, action) {
      state.offer = action.payload
    },
     set_reject_answer(state, action) {
      state.rejectAnswer = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getchat.pending, (state, action) => {
        state.currentmessagestatus = "loading";
      })
      .addCase(getchat.fulfilled, (state, action) => {
        state.currentmessagestatus = "succeeded";
        state.listofcurrentmessage = action.payload.chats || [];
        state.chatinfo = action.payload.chatInfo || {};
      })
      .addCase(getchat.rejected, (state, action) => {
        state.currentmessagestatus = "failed";

        if (!action.error.message) {
        } else {
        }
      })
      .addCase(getmsgnitify.pending, (state, action) => {
        state.msgnotifystatus = "loading";
      })
      .addCase(getmsgnitify.fulfilled, (state, action) => {
        state.msgnotifystatus = "succeeded";
        // Use Allmsg (all conversations) instead of lastchat (only sent messages)
        state.recentmsg = action.payload.Allmsg || action.payload.recentmsg || action.payload.lastchat;
      })
      .addCase(getmsgnitify.rejected, (state, action) => {
        state.msgnotifystatus = "failed";

        if (!action.error.message) {
        } else {
        }
      })
      .addCase(getmessagenotication.pending, (state, action) => {
        state.mymessagenotifystatus = "loading";
      })
      .addCase(getmessagenotication.fulfilled, (state, action) => {
        state.mymessagenotifystatus = "succeeded";
        // state.recentmsg = action.payload.lastchat

        state.msgnitocations = action.payload.notify;
        state.lastmessage = action.payload.lastmessage;
        // let ID = action.payload.id;

        state.mymessagenotifystatus = "idle";
      })
      .addCase(getmessagenotication.rejected, (state, action) => {
        state.mymessagenotifystatus = "failed";

        if (!action.error.message) {
        } else {
        }
      })
      .addCase(updatemessage.pending, (state, action) => {
        state.messageupdatestatus = "loading";
      })
      .addCase(updatemessage.fulfilled, (state, action) => {
        state.messageupdatestatus = "succeeded";
        // state.recentmsg = action.payload.lastchat

        state.mymessagenotifystatus = "idle";
      })
      .addCase(updatemessage.rejected, (state, action) => {
        state.messageupdatestatus = "failed";

        if (!action.error.message) {
        } else {
        }
      })
      .addCase(send_gift.pending, (state, action) => {
        state.giftstats = "loading";
      })
      .addCase(send_gift.fulfilled, (state, action) => {
        state.giftstats = "succeeded";
        state.giftmessage = action.payload.message;
      })
      .addCase(send_gift.rejected, (state, action) => {
        state.giftstats = "failed";

        if (!action.error.message) {
          state.giftmessage = "network error";
        } else {
          state.giftmessage = action.error.message;
        }
      });
  },
});

export default message.reducer;
export const {
  changemessagestatus,
  recivemessage,
  recivenotify,
  removenotification,
  reset_recent,
  set_videocall_message,
  set_videocall_data,
  set_calling,
  set_sdpcall,
  set_offer,
  set_reject_answer
} = message.actions;
