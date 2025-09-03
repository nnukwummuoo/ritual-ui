import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "@/api/config";
import axios from "axios";
import { BookingState } from "@/types/booking";

const initialState: BookingState = {
  bookingmessage: "",
  bookingstats: "idle",
  requeststats: "idle",
  requestmessage: "",
  requests: [],
  cancelmessage: "",
  cancelstats: "idle",
  bookingnote: null,
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

export const bookmdel = createAsyncThunk("booking/bookmodel", async (data:any) => {
  try {
    //console.log('after info')

    //console.log('ontop get profile')
    let response = await axios.put(`${URL}/bookhost`, data);
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

export const bookAmodel =  async (data:any) => {
  try {
    let response = await axios.put(`${URL}/bookhost`, data);
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
  "booking/getmyrequest",
  async (data) => {
    try {
      let response = await axios.put(`${URL}/pendingrequest`, data);
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
  "booking/Cancelrequest",
  async (data) => {
    try {
      //console.log('after info')

      //console.log('ontop get profile')
      let response = await axios.put(`${URL}/cancelrequest`, data);

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

export const notifymodel = createAsyncThunk(
  "booking/notifymodel",
  async (data) => {
    try {
      //console.log('after info')

      //console.log('ontop get profile')
      let response = await axios.put(`${URL}/notifymodel`, data);

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
  "booking/accepthost",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept book");
      let response = await axios.post(`${URL}/acceptbook`, data);

      console.log("under accept book " + response);

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
  "booking/declinehost",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept book");
      let response = await axios.put(`${URL}/declinebook`, data);

      console.log("under accept book " + response);

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
  "booking/acceptedr_req",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept book");
      let response = await axios.put(`${URL}/getrequeststats`, data);

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
  "booking/completepayment",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept book");
      let response = await axios.put(`${URL}/paymodel`, data);

      console.log("under accept book " + response);

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
  "booking/getall_request",
  async (data) => {
    try {
      //console.log('after info')

      console.log("ontop accept book");
      let response = await axios.post(`${URL}/allrequest`, data);

      console.log("under all request book " + response.data);

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

const booking = createSlice({
  name: "booking",
  initialState,
  reducers: {
    resetstat(state, action: any) {
      state.bookingstats = "idle";
      state.requeststats = "idle";
      state.cancelstats = "idle";
      state.notifystats = "idle";
      state.accepstats = "idle";
      state.acceptedReqstat = "idle";
      state.paystats = "idle";
    },
    deleterequest(state, action) {
      let { modelid, date, time } = action.payload;

      let index = state.requests.findIndex((value) => {
        return (
          value.modelid === modelid &&
          value.date === date &&
          value.time === time
        );
      });

      let index2 = state.Allrequest.findIndex((value) => {
        return (
          value.modelid === modelid &&
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
    deleteModel(state, action) {
      let { modelid, date, time } = action.payload;

      let index = state.acceptedList.findIndex((value) => {
        return (
          value.modelid === modelid &&
          value.date === date &&
          value.time === time
        );
      });

      let index2 = state.Allrequest.findIndex((value) => {
        return (
          value.modelid === modelid &&
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
      .addCase(bookmdel.pending, (state, action) => {
        state.bookingstats = "loading";
      })
      .addCase(bookmdel.fulfilled, (state, action) => {
        state.bookingstats = "succeeded";
        state.bookingmessage = action.payload.message;
      })
      .addCase(bookmdel.rejected, (state, action) => {
        state.bookingstats = "failed";

        if (!action.error) {
          state.bookingmessage = "Check internet connection";
        } else {
          state.bookingmessage = action.error.message as string;
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
      .addCase(notifymodel.pending, (state, action) => {
        state.notifystats = "loading";
      })
      .addCase(notifymodel.fulfilled, (state, action) => {
        state.notifystats = "succeeded";
        state.notifymessage = action.payload.message;
        state.bookingnote = action.payload.data;
      })
      .addCase(notifymodel.rejected, (state, action) => {
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

export default booking.reducer;
export const {
  resetstat,
  deleterequest,
  deleteModel,
  removemsg,
  add_call_data,
  set_reject_call,
} = booking.actions;
