import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { URL } from "@/api/config";
import axios from "axios";
import { CreateCreatorPayload, 
  CreatorState,
  UpdateCreatorPayload,
  DeleteCreatorPayload,
  PostExclusiveDocsPayload,
  DeleteExclusiveIdsPayload,
  PostExclusiveIdsPayload,
  TokenPayload,
  ReviewPayload, } from "@/types/creator";
// import { saveImage, deleteImage, updateImage } from "../../../api/sendImage";

const initialState: CreatorState = {
  creatorpoststatus: "idle",
  message: "",
  mycreator: [],
  mycreatorstatus: "idle",
  creatorbyid: {},
  creatorbyidstatus: "idle",
  creatorupdatestatus: "idle",
  creatordeletestatus: "idle",
  unverifiedhoststatus: "idle",
  Listofunverifiedhost: [] as Array<{ id: string }>,
  verifycreatorstatus: "idle",
  rejectcreatorstatus: "idle",
  ListofLivehost: [],
  Listofhoststatus: "idle",
  reviewstats: "idle",
  reviewmessage: "",
  getreviewstats: "idle",
  getreviewmessage: "",
  reviewList: [] as Array<{ id: string }>,
  review_delete_stats: "idle",
  review_delete_message: "",
  addcrush_stats: "idle",
  addcrush_message: "",
  getcrush_stats: "idle",
  getcrush_message: "",
  delete_msg_stats: "idle",
  delete_msg_message: "",
  remove_crush_stats: "idle",
  remove_crush_message: "",
  deletmodeImage_stats: "idle",
  exclusive_idphoto: "",
  exclusive_holdphoto: "",
  exclusive_ids_stats: "idle",
  exclusive_docs_stats: "idle",
  delete_docs_stats: "idle",
  getdocumentstatus: "idle", // New: for getdocument thunk
  documents: [] as any[], // New: to store fetched documents
  rejectdocumentstatus: "idle", // New: for rejectdocument thunk
};

export const createcreator = createAsyncThunk<any, CreateCreatorPayload>(
  "creator/createcreator",
  async (data: any) => {
    try {
      // Prepare data for request
      let formData = new FormData();

      if (data.photolink) {
        data.photolink.forEach((image: File) => {
          formData.append("creatorfiles", image);
        });
      }

      const information = {
        userid: data.userid,
        // token: data.token,
        name: data.name,
        age: data.age,
        location: data.location,
        price: data.price,
        duration: data.duration,
        bodytype: data.bodytype,
        smoke: data.smoke,
        drink: data.drink,
        interestedin: data.interestedin,
        height: data.height,
        weight: data.weight,
        description: data.discription,
        gender: data.gender,
        timeava: data.timeava,
        daysava: data.daysava,
        token: data.token,
        hosttype: data.hosttype,
      };

      formData.append("data", JSON.stringify(information));
      formData.append("token", data.token);

      data.photolink.forEach((value: File) => {
        formData.append("creatorFiles", value);
      });


      const response = await axios.put(`${URL}/creator`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        // Post was not successfully created
        throw "Error updating your post";
      }

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const createACreator=async (data: any) => {
  try {
      const fd=new FormData()
      const oKeys=Object.keys(data)
      for(const key of oKeys){
        fd.append(key,data[key])
      }
      const response = await axios.put(`${URL}/creator`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response?.data;
    } catch (err : any) {
      throw err
    }
  }

export const getViews = createAsyncThunk("/creators/updateview", async (data: any) => {
  try {
    let response = await axios.post(`${URL}/creators/updateview`, data);

    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});

export const updateFollowers = createAsyncThunk(
  "/creators/update-followers",
  async (data : any) => {
    try {
      let response = await axios.post(`${URL}/creators/update-followers`, data);

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const delete_exclusive_ids = createAsyncThunk<any, DeleteExclusiveIdsPayload>(
  "creator/delete_exclusive_ids",
  async (data: any) => {
    try {
      console.log("outside data");
      if (data.file > 0) {
        console.log("inside data");
        for (let i = 0; i < data.file; i++) {
          console.log("deleting " + data.file[i]);
          // deleteImage(data.file[i], "creator")
        }
      }

      return "sucesss";
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const post_exclusive_ids = createAsyncThunk<any, PostExclusiveIdsPayload>(
  "creator/post_exclusive_ids",
  async (data: any) => {
    try {
      let dataPonit = {
        holdphoto: "",
        id: "",
      };

      // if (data) {
      //   dataPonit.holdphoto = await saveImage(data.holdingIdPhotofile, "creator");
      //   dataPonit.id = await saveImage(data.idPhotofile, "creator");

      // }

      return dataPonit;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const post_exclusive_docs = createAsyncThunk<any, PostExclusiveDocsPayload>(
  "creator/post_exclusive_docs",
  async (data: any) => {
    try {
      let formData = new FormData();
      const postData = {
        userid: data.userid,
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email,
        dob: data.dob,
        country: data.country,
        city: data.city,
        address: data.address,
        documentType: data.documentType,
        idexpire: data.idexpire,
      };

      formData.append("data", JSON.stringify(postData));
      if (data.idPhotofile instanceof File) {
        formData.append("idPhotofile", data.idPhotofile);
      } else {
        throw new Error("Invalid ID photo file");
      }
      if (data.holdingIdPhotofile instanceof File) {
        formData.append("holdingIdPhotofile", data.holdingIdPhotofile);
      } else {
        throw new Error("Invalid holding ID photo file");
      }

      console.log("FormData entries:", [...formData.entries()]);

      let response = await axios.put(`${URL}/postdocument`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status !== 200) {
        throw "Error creating your verifying your creator";
      }

      return response.data;
    } catch (err: any) {
      console.error("Error in post_exclusive_docs:", err);
      if (!err.response?.data?.message) {
        throw err.message || "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const getmycreator = createAsyncThunk("creator/getmycreator", async (data: any) => {
  try {
    console.log("after info");

    //console.log('ontop get profile')
    let response = await axios.post(`${URL}/creator`, data);
    // console.log('under get profile')

    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});

export const getmycreatorbyid = createAsyncThunk(
  "creator/getmycreatorbyid",
  async (data: any) => {
    try {
      let response = await axios.patch(`${URL}/getcreatorbyid`, data);
      return response.data;
    } catch (err : any) {
      if (!err.response?.data?.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const updatecreator = createAsyncThunk<any, UpdateCreatorPayload>(
  "creator/updatecreator",
  async (data: any) => {
    try {
      // Send data as a FormData
      let formData = new FormData();

      // Prepare the post form data
      const updateData = {
        age: data.age,
        location: data.location,
        price: data.price,
        duration: data.duration,
        bodytype: data.bodytype,
        smoke: data.smoke,
        drink: data.drink,
        interestedin: data.interestedin,
        height: data.height,
        weight: data.weight,
        description: data.description,
        gender: data.gender,
        timeava: data.timeava,
        daysava: data.daysava,
        hosttype: data.hosttype,
        hostid: data.hostid,
        token: data.token,
        photolink: data.photocount,
        // photolink: newphotolink.toString(),
      };

      console.log("data.photolink: ", data.photolink);

      formData.append("data", JSON.stringify(updateData));
      formData.append("token", data.token);

      data.photolink.forEach((photo: File) => {
        formData.append("updateCreatorPhotos", photo);
      });

      console.log("I am about to create formData", [...formData.entries()]);

      let response = await axios.post(`${URL}/editcreator`, formData, {
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
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const deletecreatorImage = createAsyncThunk(
  "creator/deletecreatorImage",
  async (data : any) => {
    try {
      if (data) {
        for (let i = 0; i < data.length; i++) {
          // await deleteImage(data[i], "creator");
        }
      }

      return "success";
    } catch (err : any) {
      throw err;
    }
  }
);

export const deletecreator = createAsyncThunk<any, DeleteCreatorPayload>(
  "creator/deletecreator ",
  async (data: any) => {
    try {
      if (data.photolink) {
        for (let i = 0; i < data.photocount; i++) {
          // await deleteImage(data.oldlink[i], "creator");
        }

        for (let i = 0; i < data.docCount; i++) {
          // await deleteImage(data.documentlink[i], "creator");
        }
      }
      console.log(" after upadting creator db on server");

      let info = {
        document: data.documentlink,
        photolink: data.photolink,
        hostid: data.hostid,
        token: data.token,
      };

      let response = await axios.post(`${URL}/deletecreator`, info);

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

//undode for getting exclusive that we need to verify
export const unverifiedHost = createAsyncThunk(
  "creator/unverifiedHost ",
  async (data: any) => {
    try {
      let response = await axios.post(`${URL}/getadminhost`, data);

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const verifycreator = createAsyncThunk(
  "creator/verifycreator ",
  async (data: any) => {
    try {
      let response = await axios.post(`${URL}/verifycreator`, data);

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const rejectcreator = createAsyncThunk(
  "creator/rejectcreator ",
  async (data: any) => {
    try {
      let response = await axios.post(`${URL}/rejectcreator`, data);

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const getverifyhost = createAsyncThunk(
  "creator/getverifyhost ",
  async (data: any) => {
    try {
      let response = await axios.post(`${URL}/getverifycreator`, data);
      console.log("Backend /getverifycreator response:", response.data);

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const review = createAsyncThunk<any, ReviewPayload>("creator/review ", async (data) => {
  try {
    let response = await axios.put(`${URL}/reviewcreator`, data);

    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});

export const getreview = createAsyncThunk("creator/getreview ", async (data: any) => {
  try {
    let response = await axios.put(`${URL}/getreviews`, data);

    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});

export const deletereview = createAsyncThunk(
  "creator/deletereview ",
  async (data: any) => {
    try {
      let response = await axios.put(`${URL}/deletereview`, data);

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const addcrush = createAsyncThunk("creator/addcrush ", async (data: any) => {
  try {
    let response = await axios.post(`${URL}/addcrush`, data);

    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});

export const getcrush = createAsyncThunk("creator/getcrushs ", async (data : any) => {
  try {
    let response = await axios.get(`${URL}/getcrushs`, data);

    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});

export const delete_MSG = createAsyncThunk(
  "creator/delete_MSG ",
  async (data: any) => {
    try {
      let response = await axios.post(`${URL}/deleteMsg`, data);

      return response.data;
    } catch (err: any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const remove_Crush = createAsyncThunk(
  "creator/remove_Crush ",
  async (data: any) => {
    try {
      let response = await axios.post(`${URL}/deletecrush`, data);

      return response.data;
    } catch (err: any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

// New thunk: getdocument (GET /getdocument/:userid)
export const getdocument = createAsyncThunk("creator/getdocument", async () => {
  try {
    let response = await axios.get(`${URL}/getdocument`);

    return response.data;
  } catch (err: any) {
    if (!err.response?.data?.message) {
      throw "Check internet connection";
    }
    throw err.response.data.message;
  }
});

// New thunk: rejectdocument (POST /rejectdocument, body: { userid, docid })
export const rejectdocument = createAsyncThunk<any, { userid: string; docid: string }>(
  "creator/rejectdocument",
  async (data) => {
    try {
      let response = await axios.post(`${URL}/rejectdocument`, data);
      return response.data;
    } catch (err: any) {
      if (!err.response?.data?.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

const creator = createSlice({
  name: "creator",
  initialState,
  reducers: {
    changecreatorstatus(state, action: PayloadAction<string>) {
      state.creatorpoststatus = action.payload;
      state.mycreatorstatus = action.payload;
      state.creatorbyidstatus = action.payload;
      state.creatorupdatestatus = action.payload;
      state.creatordeletestatus = action.payload;
      state.unverifiedhoststatus = action.payload;
      state.verifycreatorstatus = action.payload;
      state.rejectcreatorstatus = action.payload;
      state.Listofhoststatus = action.payload;
      state.reviewstats = action.payload;
      state.review_delete_stats = action.payload;
      state.addcrush_stats = action.payload;
      state.getcrush_stats = action.payload;
      state.delete_msg_stats = action.payload;
      state.remove_crush_stats = action.payload;
      state.deletmodeImage_stats = action.payload;
      state.exclusive_ids_stats = action.payload;
      state.delete_docs_stats = action.payload;
      state.getdocumentstatus = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(createcreator.pending, (state, action) => {
        state.creatorpoststatus = "loading";
      })
      .addCase(createcreator.fulfilled, (state, action) => {
        state.creatorpoststatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
      })
      .addCase(createcreator.rejected, (state, action) => {
        state.creatorpoststatus = "failed";

        if (!action.error.message) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(getmycreator.pending, (state, action) => {
        state.mycreatorstatus = "loading";
      })
      .addCase(getmycreator.fulfilled, (state, action) => {
        state.mycreatorstatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
        state.mycreator = action.payload.host;
      })
      .addCase(getmycreator.rejected, (state, action) => {
        state.mycreatorstatus = "failed";

        if (!action.error.message) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(getmycreatorbyid.pending, (state, action) => {
        state.creatorbyidstatus = "loading";
      })
      .addCase(getmycreatorbyid.fulfilled, (state, action) => {
        state.creatorbyidstatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
        state.creatorbyid = action.payload.host;
      })
      .addCase(getmycreatorbyid.rejected, (state, action) => {
        state.creatorbyidstatus = "failed";

        if (!action.error.message) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(updatecreator.pending, (state, action) => {
        state.creatorupdatestatus = "loading";
      })
      .addCase(updatecreator.fulfilled, (state, action) => {
        state.creatorupdatestatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
      })
      .addCase(updatecreator.rejected, (state, action) => {
        state.creatorupdatestatus = "failed";

        if (!action.error.message) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(deletecreator.pending, (state, action) => {
        state.creatordeletestatus = "loading";
      })
      .addCase(deletecreator.fulfilled, (state, action) => {
        state.creatordeletestatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
      })
      .addCase(deletecreator.rejected, (state, action) => {
        state.creatordeletestatus = "failed";

        if (action.error.message === undefined) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(unverifiedHost.pending, (state, action) => {
        state.unverifiedhoststatus = "loading";
      })
      .addCase(unverifiedHost.fulfilled, (state, action) => {
        state.unverifiedhoststatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
        state.Listofunverifiedhost = action.payload.hosts;
      })
      .addCase(unverifiedHost.rejected, (state, action) => {
        state.unverifiedhoststatus = "failed";

        if (action.error.message === undefined) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(verifycreator.pending, (state, action) => {
        state.verifycreatorstatus = "loading";
      })
      .addCase(verifycreator.fulfilled, (state, action) => {
        state.verifycreatorstatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
        if (action.payload.hostid) {
          let index = state.Listofunverifiedhost.findIndex((value) => {
            return value.id === action.payload.hostid;
          });

          if (index !== -1) {
            state.Listofunverifiedhost.splice(index, 1);
          }
        }
      })
      .addCase(verifycreator.rejected, (state, action) => {
        state.verifycreatorstatus = "failed";

        if (action.error.message === undefined) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(rejectcreator.pending, (state, action) => {
        state.rejectcreatorstatus = "loading";
      })
      .addCase(rejectcreator.fulfilled, (state, action) => {
        state.rejectcreatorstatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
        if (action.payload.hostid) {
          let index = state.Listofunverifiedhost.findIndex((value) => {
            return value.id === action.payload.hostid;
          });

          if (index !== -1) {
            state.Listofunverifiedhost.splice(index, 1);
          }
        }
      })
      .addCase(rejectcreator.rejected, (state, action) => {
        state.rejectcreatorstatus = "failed";

        if (action.error.message === undefined) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(getverifyhost.pending, (state, action) => {
        state.Listofhoststatus = "loading";
      })
      .addCase(getverifyhost.fulfilled, (state, action) => {
        state.Listofhoststatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
        state.ListofLivehost = action.payload.host;
      })
      .addCase(getverifyhost.rejected, (state, action) => {
        state.Listofhoststatus = "failed";

        if (action.error.message === undefined) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(review.pending, (state, action) => {
        state.reviewstats = "loading";
      })
      .addCase(review.fulfilled, (state, action) => {
        state.reviewstats = "succeeded";
        state.reviewmessage = action.payload?.message ?? state.reviewmessage;
      })
      .addCase(review.rejected, (state, action) => {
        state.reviewstats = "failed";
        state.reviewmessage = action.error?.message ?? "Check internet connection";
      })
      .addCase(getreview.pending, (state, action) => {
        state.getreviewstats = "loading";
      })
      .addCase(getreview.fulfilled, (state, action) => {
        state.getreviewstats = "succeeded";
        state.getreviewmessage = action.payload?.message ?? state.getreviewmessage;
        state.reviewList = action.payload.reviews;
      })
      .addCase(getreview.rejected, (state, action) => {
        state.getreviewstats = "failed";
        state.getreviewmessage = action.error?.message ?? "Check internet connection";
      })
      .addCase(deletereview.pending, (state, action) => {
        state.review_delete_stats = "loading";
      })
      .addCase(deletereview.fulfilled, (state, action) => {
        state.review_delete_stats = "succeeded";
        state.review_delete_message = action.payload?.message ?? state.review_delete_message;
        let id = action.payload.id;

        let index = state.reviewList.findIndex((value) => {
          return id === value.id;
        });

        if (index !== -1) {
          state.reviewList.splice(index, 1);
        }
      })
      .addCase(deletereview.rejected, (state, action) => {
        state.review_delete_stats = "failed";

        state.review_delete_message = action.error?.message ?? "Check internet connection";
      })
      .addCase(addcrush.pending, (state, action) => {
        state.addcrush_stats = "loading";
      })
      .addCase(addcrush.fulfilled, (state, action) => {
        state.addcrush_stats = "succeeded";
        state.addcrush_message = action.payload?.message ?? state.addcrush_message;
      })
      .addCase(addcrush.rejected, (state, action) => {
        state.addcrush_stats = "failed";

        state.addcrush_message = action.error?.message ?? "Check internet connection";
      })
      .addCase(getcrush.pending, (state, action) => {
        state.getcrush_stats = "loading";
      })
      .addCase(getcrush.fulfilled, (state, action) => {
        state.getcrush_stats = "suceeded";
        state.getcrush_message = action.payload?.message ?? state.getcrush_message;
      })
      .addCase(getcrush.rejected, (state, action) => {
        state.getcrush_stats = "failed";

        state.getcrush_message = action.error?.message ?? "Check internet connection";
      })
      .addCase(delete_MSG.pending, (state, action) => {
        state.delete_msg_stats = "loading";
      })
      .addCase(delete_MSG.fulfilled, (state, action) => {
        state.delete_msg_stats = "suceeded";
        state.delete_msg_message = action.payload.message;
      })
      .addCase(delete_MSG.rejected, (state, action) => {
        state.delete_msg_stats = "failed";
        state.delete_msg_message =
          action.error?.message ?? "Check internet connection";
      })
      .addCase(remove_Crush.pending, (state, action) => {
        state.remove_crush_stats = "loading";
      })
      .addCase(remove_Crush.fulfilled, (state, action) => {
        state.remove_crush_stats = "succeeded";
        state.remove_crush_message = action.payload?.message ?? state.remove_crush_message;
      })
      .addCase(remove_Crush.rejected, (state, action) => {
        state.remove_crush_stats = "failed";

        state.remove_crush_message = action.error?.message ?? "Check internet connection";
      })
      .addCase(deletecreatorImage.pending, (state, action) => {
        state.deletmodeImage_stats = "loading";
      })
      .addCase(deletecreatorImage.fulfilled, (state, action) => {
        state.deletmodeImage_stats = "succeeded";
      })
      .addCase(deletecreatorImage.rejected, (state, action) => {
        state.deletmodeImage_stats = "failed";
      })
      .addCase(post_exclusive_ids.pending, (state, action) => {
        state.exclusive_ids_stats = "loading";
      })
      .addCase(post_exclusive_ids.fulfilled, (state, action) => {
        state.exclusive_ids_stats = "succeeded";

        state.exclusive_holdphoto = action.payload.holdphoto;
        state.exclusive_idphoto = action.payload.id;
      })
      .addCase(post_exclusive_ids.rejected, (state, action) => {
        state.exclusive_ids_stats = "failed";
      })
      .addCase(post_exclusive_docs.pending, (state, action) => {
        state.exclusive_docs_stats = "loading";
      })
      .addCase(post_exclusive_docs.fulfilled, (state, action) => {
        state.exclusive_docs_stats = "succeeded";

        console.log("id success");
      })
      .addCase(post_exclusive_docs.rejected, (state, action) => {
        state.exclusive_docs_stats = "failed";
        console.log("id failed " + action.error.message);
      })
      .addCase(delete_exclusive_ids.pending, (state, action) => {
        state.delete_docs_stats = "loading";
      })
      .addCase(delete_exclusive_ids.fulfilled, (state, action) => {
        state.delete_docs_stats = "succeeded";
      })
      .addCase(delete_exclusive_ids.rejected, (state, action) => {
        state.delete_docs_stats = "failed";
      })
      .addCase(getdocument.pending, (state) => {
        state.getdocumentstatus = "loading";
      })
      .addCase(getdocument.fulfilled, (state, action) => {
        state.getdocumentstatus = "succeeded";
        state.documents = action.payload.documents || [];
        state.message = action.payload.message ?? state.message;
      })
      .addCase(getdocument.rejected, (state, action) => {
        state.getdocumentstatus = "failed";
        state.message = action.error.message ?? "Check internet connection";
      })
      .addCase(rejectdocument.pending, (state) => {
        state.rejectdocumentstatus = "loading";
      })
      .addCase(rejectdocument.fulfilled, (state, action) => {
        state.rejectdocumentstatus = "succeeded";
        state.message = action.payload.message ?? state.message;
        if (action.payload.rejectedDocId) {
          let index = state.Listofunverifiedhost.findIndex((value) => {
            return value._id === action.payload.rejectedDocId; // Assuming _id is the doc ID
          });
          if (index !== -1) {
            state.Listofunverifiedhost.splice(index, 1);
          }
        }
      })
      .addCase(rejectdocument.rejected, (state, action) => {
        state.rejectdocumentstatus = "failed";
        state.message = action.error.message ?? "Check internet connection";
      });
  },
});

export default creator.reducer;

export const { changecreatorstatus } = creator.actions;