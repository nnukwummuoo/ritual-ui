// "use client";

// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import axios from "axios";
// import { URL } from '../../api/config'

// // --- Types
// // ---------------------------
// // Types
// // ---------------------------
// interface CreatorState {
//   creatorpoststatus: string;
//   message: string;
//   mycreator: any[];
//   mycreatorstatus: string;
//   creatorbyid: any;
//   creatorbyidstatus: string;
//   creatorupdatestatus: string;
//   creatordeletestatus: string;
//   unverifiedhoststatus: string;
//   Listofunverifiedhost: any[];
//   verifycreatorstatus: string;
//   rejectcreatorstatus: string;
//   ListofLivehost: any[];
//   Listofhoststatus: string;
//   reviewstats: string;
//   reviewmessage: string;
//   getreviewstats: string;
//   getreviewmessage: string;
//   reviewList: any[];
//   review_delete_stats: string;
//   review_delete_message: string;
//   addcrush_stats: string;
//   addcrush_message: string;
//   getcrush_stats: string;
//   getcrush_message: string;
//   delete_msg_stats: string;
//   delete_msg_message: string;
//   remove_crush_stats: string;
//   remove_crush_message: string;
//   deletmodeImage_stats: string;
//   exclusive_idphoto: string;
//   exclusive_holdphoto: string;
//   exclusive_ids_stats: string;
//   exclusive_docs_stats: string;
//   delete_docs_stats: string;
// }

// // --- Initial State
// const initialState: CreatorState = {
//   creatorpoststatus: "idle",
//   message: "",
//   mycreator: [],
//   mycreatorstatus: "idle",
//   creatorbyid: {},
//   creatorbyidstatus: "idle",
//   creatorupdatestatus: "idle",
//   creatordeletestatus: "idle",
//   unverifiedhoststatus: "idle",
//   Listofunverifiedhost: [],
//   verifycreatorstatus: "idle",
//   rejectcreatorstatus: "idle",
//   ListofLivehost: [],
//   Listofhoststatus: "idle",
//   reviewstats: "idle",
//   reviewmessage: "",
//   getreviewstats: "idle",
//   getreviewmessage: "",
//   reviewList: [],
//   review_delete_stats: "idle",
//   review_delete_message: "",
//   addcrush_stats: "idle",
//   addcrush_message: "",
//   getcrush_stats: "idle",
//   getcrush_message: "",
//   delete_msg_stats: "idle",
//   delete_msg_message: "",
//   remove_crush_stats: "idle",
//   remove_crush_message: "",
//   deletmodeImage_stats: "idle",
//   exclusive_idphoto: "",
//   exclusive_holdphoto: "",
//   exclusive_ids_stats: "idle",
//   exclusive_docs_stats: "idle",
//   delete_docs_stats: "idle",
// };

// // --- Helper for axios errors
// const catchError = (err: any) => {
//   if (!err.response?.data?.message) throw "Check internet connection";
//   throw err.response.data.message;
// };

// // --- Thunks

// export const createcreator = createAsyncThunk(
//   "creator/createcreator",
//   async (data: any) => {
//     try {
//       const formData = new FormData();
//       data.photolink?.forEach((img: File) =>
//         formData.append("creatorfiles", img)
//       );
//       formData.append(
//         "data",
//         JSON.stringify({
//           /* relevant fields */
//         })
//       );
//       formData.append("token", data.token);
//       data.photolink?.forEach((img: File) =>
//         formData.append("creatorFiles", img)
//       );
//       const res = await axios.put(`${URL}/creator`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       if (res.status !== 200) throw "Error updating your post";
//       return res.data;
//     } catch (err) {
//       catchError(err);
//     }
//   }
// );

// export const getmycreator = createAsyncThunk(
//   "creator/getmycreator",
//   async (data: { userid: string; token: string }) => {
//     try {
//       const res = await axios.post(`${URL}/creator`, data);
//       return res.data;
//     } catch (err) {
//       catchError(err);
//     }
//   }
// );

// export const getmycreatorbyid = createAsyncThunk(
//   "creator/getmycreatorbyid",
//   async (data: any) => {
//     try {
//       const res = await axios.patch(`${URL}/getcreatorbyportfolioid`, data);
//       return res.data;
//     } catch (err) {
//       catchError(err);
//     }
//   }
// );

// export const updatecreator = createAsyncThunk(
//   "creator/updatecreator",
//   async (data: any) => {
//     try {
//       const formData = new FormData();
//       const updateData = {
//         /* map your update payload */
//       };
//       formData.append("data", JSON.stringify(updateData));
//       formData.append("token", data.token);
//       data.photolink?.forEach((file: File) =>
//         formData.append("updateCreatorPhotos", file)
//       );
//       const res = await axios.post(`${URL}/editcreator`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       if (res.status !== 200) throw "Error updating";
//       return res.data;
//     } catch (err) {
//       catchError(err);
//     }
//   }
// );

// export const deletecreator = createAsyncThunk(
//   "creator/deletecreator",
//   async (data: any) => {
//     try {
//       const info: any = { /* hostid, lists, etc. */ token: data.token };
//       const res = await axios.post(`${URL}/deletecreator`, info);
//       return res.data;
//     } catch (err) {
//       catchError(err);
//     }
//   }
// );

// export const getverifyhost = createAsyncThunk(
//   "creator/getverifyhost",
//   async (data: any) => {
//     try {
//       const res = await axios.post(`${URL}/getverifycreator`, data);
//       return res.data;
//     } catch (err) {
//       catchError(err);
//     }
//   }
// );

// // Add any additional thunks (review, crush, etc.) similarly...

// // --- Slice Definition

// const creator = createSlice({
//   name: "creator",
//   initialState,
//   reducers: {
//     changecreatorstatus(state, action: PayloadAction<string>) {
//       Object.keys(state).forEach((key) => {
//         if (typeof (state as any)[key] === "string" && key.endsWith("status")) {
//           (state as any)[key] = action.payload;
//         }
//       });
//     },
//   },
//   extraReducers: (builder) => {
//     // Handle each thunk's pending, fulfilled, rejected states
//     builder
//       .addCase(
//         createcreator.pending,
//         (state) => (state.creatorpoststatus = "loading")
//       )
//       .addCase(createcreator.fulfilled, (state, action) => {
//         state.creatorpoststatus = "succeeded";
//         state.message = action.payload?.message;
//       })
//       .addCase(createcreator.rejected, (state, action) => {
//         state.creatorpoststatus = "failed";
//         state.message = action.error.message || "Error creating creator";
//       });

//     builder
//       .addCase(getmycreator.pending, (state) => (state.mycreatorstatus = "loading"))
//       .addCase(getmycreator.fulfilled, (state, action) => {
//         state.mycreatorstatus = "succeeded";
//         state.message = action.payload.message;
//         state.mycreator = action.payload.host;
//       })
//       .addCase(getmycreator.rejected, (state, action) => {
//         state.mycreatorstatus = "failed";
//         state.message = action.error.message || "Error fetching creators";
//       });

//     builder
//       .addCase(
//         getverifyhost.pending,
//         (state) => (state.Listofhoststatus = "loading")
//       )
//       .addCase(getverifyhost.fulfilled, (state, action) => {
//         state.Listofhoststatus = "succeeded";
//         state.message = action.payload.message;
//         state.ListofLivehost = action.payload.host;
//       })
//       .addCase(getverifyhost.rejected, (state, action) => {
//         state.Listofhoststatus = "failed";
//         state.message = action.error.message || "Error fetching live hosts";
//       });

//     // Repeat similar blocks for getmycreatorbyid, updatecreator, deletecreator...
//   },
// });

// // --- Exports
// export const { changecreatorstatus } = creator.actions;
// export default creator.reducer;
