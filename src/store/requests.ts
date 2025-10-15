import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "@/api/config";
import axios from "axios";
import { requestState } from "@/types/requesting";

const initialState: requestState = {
  requestmessage: "",
  requeststats: "idle",
  requests: [],
  cancelmessage: "",
  cancelstats: "idle",
  requestnote: null,
  notifymessage: "",
  notifystats: "idle",
  acceptmessage: "",
  accepstats: "idle",
  acceptedList: [],
  acceptedReqstat: "idle",
  acceptedReqMes: "",
  paystats: "idle",
  paymessage: "",
  Allrequest: [],
  allrequest_stats: "idle",
  allrequestmessage: "",
  privatecallData: [],
  rejectedCall: null,
};

export const requestmdel = createAsyncThunk("request/requestcreator", async (data:any) => {
  try {
    //console.log('after info')

    //console.log('ontop get profile')
    const response = await axios.put(`${URL}/requesthost`, data);
    //console.log('under get profile')

    return response.data;
  } catch (err : any) {
    // console.log('erro get profile')
    if (axios.isAxiosError(err)) {
      throw (err.response?.data as any)?.message ?? "Network error";
    }
    throw "Unexpected error";
  }
});

export const requestAcreator =  async (data:any) => {
  try {
    const response = await axios.put(`${URL}/requesthost`, data);
    return response.data;
  } catch (err : any) {
    // console.log('erro get profile')
    if (axios.isAxiosError(err)) {
      throw (err.response?.data as any)?.message ?? "Network error";
    }
    throw "Unexpected error";
  }
}

export const getmyrequest = createAsyncThunk(
  "request/getmyrequest",
  async (data) => {
    try {
      const response = await axios.put(`${URL}/pendingrequest`, data);
      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      if (axios.isAxiosError(err)) {
        throw (err.response?.data as any)?.message ?? "Network error";
      }
      throw "Unexpected error";
    }
  }
);

export const Cancelrequest = createAsyncThunk(
  "request/Cancelrequest",
  async (data) => {
    try {
      //console.log('after info')

      //console.log('ontop get profile')
      const response = await axios.put(`${URL}/cancelrequest`, data);

      //console.log('under get profile')

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      if (axios.isAxiosError(err)) {
        throw (err.response?.data as any)?.message ?? "Network error";
      }
      throw "Unexpected error";
    }
  }
);

export const notifycreator = createAsyncThunk(
  "request/notifycreator",
  async (data) => {
    try {
      //console.log('after info')

      //console.log('ontop get profile')
      const response = await axios.put(`${URL}/notifycreator`, data);

      //console.log('under get profile')

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      if (axios.isAxiosError(err)) {
        throw (err.response?.data as any)?.message ?? "Network error";
      }
      throw "Unexpected error";
    }
  }
);

export const accepthost = createAsyncThunk(
  "request/accepthost",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept request");
      const response = await axios.post(`${URL}/acceptrequest`, data);

      console.log("under accept request " + response);

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      if (axios.isAxiosError(err)) {
        throw (err.response?.data as any)?.message ?? "Network error";
      }
      throw "Unexpected error";
    }
  }
);

export const declinehost = createAsyncThunk(
  "request/declinehost",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept request");
      const response = await axios.put(`${URL}/declinerequest`, data);

      console.log("under accept request " + response);

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      if (axios.isAxiosError(err)) {
        throw (err.response?.data as any)?.message ?? "Network error";
      }
      throw "Unexpected error";
    }
  }
);

export const acceptedr_req = createAsyncThunk(
  "request/acceptedr_req",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept request");
      const response = await axios.put(`${URL}/getrequeststats`, data);

      console.log(response.data);

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      if (axios.isAxiosError(err)) {
        throw (err.response?.data as any)?.message ?? "Network error";
      }
      throw "Unexpected error";
    }
  }
);

export const completepayment = createAsyncThunk(
  "request/completepayment",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept request");
      const response = await axios.put(`${URL}/paycreator`, data);

      console.log("under accept request " + response);

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      if (axios.isAxiosError(err)) {
        throw (err.response?.data as any)?.message ?? "Network error";
      }
      throw "Unexpected error";
    }
  }
);

export const getall_request = createAsyncThunk(
  "request/getall_request",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept request");
      const response = await axios.post(`${URL}/allrequest`, data);

      console.log("under all request request " + response.data);

      return response.data;
    } catch (err : any) {
      // console.log('erro get profile')
      if (axios.isAxiosError(err)) {
        throw (err.response?.data as any)?.message ?? "Network error";
      }
      throw "Unexpected error";
    }
  }
);

const request = createSlice({
  name: "request",
  initialState,
  reducers: {
    resetstat(state, action: any) {
      state.requeststats = "idle";
      state.cancelstats = "idle";
      state.notifystats = "idle";
      state.accepstats = "idle";
      state.acceptedReqstat = "idle";
      state.paystats = "idle";
    },
    deleterequest(state, action) {
      let { creator_portfolio_id, date, time } = action.payload;

      let index = state.requests.findIndex((value) => {
        return (
          value.creator_portfolio_id === creator_portfolio_id &&
          value.date === date &&
          value.time === time
        );
      });

      let index2 = state.Allrequest.findIndex((value) => {
        return (
          value.creator_portfolio_id === creator_portfolio_id &&
          value.date === date &&
          value.time === time
        );
      });

      if (index !== -1) {
        state.requests.splice(index, 1);
      }

      if (index2 !== -1) {
        state.Allrequest.splice(index2, 1);
      }
    },
    deleteCreator(state, action) {
      let { creator_portfolio_id, date, time } = action.payload;

      let index = state.acceptedList.findIndex((value) => {
        return (
          value.creator_portfolio_id === creator_portfolio_id &&
          value.date === date &&
          value.time === time
        );
      });

      let index2 = state.Allrequest.findIndex((value) => {
        return (
          value.creator_portfolio_id === creator_portfolio_id &&
          value.date === date &&
          value.time === time
        );
      });

      if (index !== -1) {
        state.acceptedList.splice(index, 1);
      }

      if (index2 !== -1) {
        state.Allrequest.splice(index2, 1);
      }
    },
    removemsg(state, action) {
      let id = action.payload;
      let index = state.Allrequest.findIndex((value) => value.id === id);

      if (index !== -1) {
        state.Allrequest.splice(index, 1);
      }
    },
    add_call_data(state, action) {
      state.privatecallData = action.payload;
    },
    set_reject_call(state, action) {
      state.rejectedCall = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(requestmdel.pending, (state, action) => {
        state.requeststats = "loading";
      })
      .addCase(requestmdel.fulfilled, (state, action) => {
        state.requeststats = "succeeded";
        state.requestmessage = action.payload.message;
      })
      .addCase(requestmdel.rejected, (state, action) => {
        state.requeststats = "failed";

        if (!action.error) {
          state.requestmessage = "Check internet connection";
        } else {
          state.requestmessage = action.error.message as string;
        }
      })
      .addCase(getmyrequest.pending, (state, action) => {
        state.requeststats = "loading";
      })
      .addCase(getmyrequest.fulfilled, (state, action) => {
        state.requeststats = "succeeded";
        state.requestmessage = action.payload.message;
        state.requests = action.payload.info;
      })
      .addCase(getmyrequest.rejected, (state, action) => {
        state.requeststats = "failed";

        if (!action.error) {
          state.requestmessage = "Check internet connection";
        } else {
          state.requestmessage = action.error.message as string;
        }
      })
      .addCase(Cancelrequest.pending, (state, action) => {
        state.cancelstats = "loading";
      })
      .addCase(Cancelrequest.fulfilled, (state, action) => {
        state.cancelstats = "succeeded";
        state.cancelmessage = action.payload.message;
      })
      .addCase(Cancelrequest.rejected, (state, action) => {
        state.cancelstats = "failed";

        if (!action.error) {
          state.cancelmessage = "Check internet connection";
        } else {
          state.cancelmessage = action.error.message as string;
        }
      })
      .addCase(notifycreator.pending, (state, action) => {
        state.notifystats = "loading";
      })
      .addCase(notifycreator.fulfilled, (state, action) => {
        state.notifystats = "succeeded";
        state.notifymessage = action.payload.message;
        state.requestnote = action.payload.data;
      })
      .addCase(notifycreator.rejected, (state, action) => {
        state.notifystats = "failed";

        if (!action.error) {
          state.notifymessage = "Check internet connection";
        } else {
          state.notifymessage = action.error.message as string;
        }
      })
      .addCase(accepthost.pending, (state, action) => {
        state.accepstats = "loading";
      })
      .addCase(accepthost.fulfilled, (state, action) => {
        state.accepstats = "succeeded";
        state.acceptmessage = action.payload.message;
      })
      .addCase(accepthost.rejected, (state, action) => {
        state.accepstats = "failed";

        if (!action.error) {
          state.acceptmessage = "Check internet connection";
        } else {
          state.acceptmessage = action.error.message as string;
        }
      })
      .addCase(declinehost.pending, (state, action) => {
        state.accepstats = "loading";
      })
      .addCase(declinehost.fulfilled, (state, action) => {
        state.accepstats = "succeeded";
        state.acceptmessage = action.payload.message;
      })
      .addCase(declinehost.rejected, (state, action) => {
        state.accepstats = "failed";

        if (!action.error) {
          state.acceptmessage = "Check internet connection";
        } else {
          state.acceptmessage = action.error.message as string;
        }
      })
      .addCase(acceptedr_req.pending, (state, action) => {
        state.acceptedReqstat = "loading";
      })
      .addCase(acceptedr_req.fulfilled, (state, action) => {
        state.acceptedReqstat = "succeeded";
        state.acceptedReqMes = action.payload.message;
        state.acceptedList = action.payload.approve;
      })
      .addCase(acceptedr_req.rejected, (state, action) => {
        state.acceptedReqstat = "failed";

        if (!action.error) {
          state.acceptedReqMes = "Check internet connection";
        } else {
          state.acceptedReqMes = action.error.message as string;
        }
      })
      .addCase(completepayment.pending, (state, action) => {
        state.paystats = "loading";
      })
      .addCase(completepayment.fulfilled, (state, action) => {
        state.paystats = "succeeded";
        state.paymessage = action.payload.message;
      })
      .addCase(completepayment.rejected, (state, action) => {
        state.paystats = "failed";
        state.paymessage = action.error.message ?? "Check internet connection";
      })
      .addCase(getall_request.pending, (state, action) => {
        state.allrequest_stats = "loading";
      })
      .addCase(getall_request.fulfilled, (state, action) => {
        state.allrequest_stats = "succeeded";
        state.allrequestmessage = action.payload.message;
        state.Allrequest = action.payload.approve;
      })
      .addCase(getall_request.rejected, (state, action) => {
        state.allrequest_stats = "failed";
        state.allrequestmessage = action.error.message ?? "Check internet connection";
      });
  },
});

export default request.reducer;
export const {
  resetstat,
  deleterequest,
  deleteCreator,
  removemsg,
  add_call_data,
  set_reject_call,
} = request.actions;
