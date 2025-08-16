import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { URL } from "@/api/config";
import axios from "axios";
import { CreateModelPayload, 
  ModelState,
  UpdateModelPayload,
  DeleteModelPayload,
  PostExclusiveDocsPayload,
  DeleteExclusiveIdsPayload,
  PostExclusiveIdsPayload,
  TokenPayload,
  ReviewPayload, } from "@/types/model";
// import { saveImage, deleteImage, updateImage } from "../../../api/sendImage";

const initialState: ModelState = {
  modelpoststatus: "idle",
  message: "",
  mymodel: [],
  mymodelstatus: "idle",
  modelbyid: {},
  modelbyidstatus: "idle",
  modelupdatestatus: "idle",
  modeldeletestatus: "idle",
  unverifiedhoststatus: "idle",
  Listofunverifiedhost: [] as Array<{ id: string }>,
  verifymodelstatus: "idle",
  rejectmodelstatus: "idle",
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
};

export const createmodel = createAsyncThunk<any, CreateModelPayload>(
  "model/createmodel",
  async (data: any) => {
    try {
      // Prepare data for request
      let formData = new FormData();

      if (data.photolink) {
        data.photolink.forEach((image: File) => {
          formData.append("modelfiles", image);
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
        formData.append("modelFiles", value);
      });

      console.log("I am about to create formData", [...formData.entries()]);

      const response = await axios.put(`${URL}/model`, formData, {
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

export const getViews = createAsyncThunk("/models/updateview", async (data: any) => {
  try {
    let response = await axios.post(`${URL}/models/updateview`, data);

    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});

export const updateFollowers = createAsyncThunk(
  "/models/update-followers",
  async (data : any) => {
    try {
      let response = await axios.post(`${URL}/models/update-followers`, data);

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
  "model/delete_exclusive_ids",
  async (data: any) => {
    try {
      console.log("outside data");
      if (data.file > 0) {
        console.log("inside data");
        for (let i = 0; i < data.file; i++) {
          console.log("deleting " + data.file[i]);
          // deleteImage(data.file[i], "model")
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
  "model/post_exclusive_ids",
  async (data: any) => {
    try {
      let dataPonit = {
        holdphoto: "",
        id: "",
      };

      // if (data) {
      //   dataPonit.holdphoto = await saveImage(data.holdingIdPhotofile, "model");
      //   dataPonit.id = await saveImage(data.idPhotofile, "model");

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
  "model/post_exclusive_docs",
  async (data: any) => {
    try {
      // Send data as a FormData
      let formData = new FormData();

      // Prepare the post form data
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
        // holdingIdPhotofile: data.holdingIdPhotofile,
        // idPhotofile: data.idPhotofile,
        idexpire: data.idexpire,
      };

      formData.append("data", JSON.stringify(postData));
      formData.append("token", data.token);
      formData.append("idPhotofile", data.idPhotofile || "");
      formData.append("holdingIdPhotofile", data.holdingIdPhotofile || "");

      console.log("I am about to create formData", [...formData.entries()]);

      let response = await axios.put(`${URL}/postdocument`, formData, {
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
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const getmymodel = createAsyncThunk("model/getmymodel", async (data: any) => {
  try {
    console.log("after info");

    //console.log('ontop get profile')
    let response = await axios.post(`${URL}/model`, data);
    // console.log('under get profile')

    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});

export const getmymodelbyid = createAsyncThunk(
  "model/getmymodelbyid",
  async (data: any) => {
    try {
      console.log("after info");

      //console.log('ontop get profile')
      let response = await axios.patch(`${URL}/getmodelbyid`, data);
      // console.log('under get profile')

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const updatemodel = createAsyncThunk<any, UpdateModelPayload>(
  "model/updatemodel",
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
        formData.append("updateModelPhotos", photo);
      });

      console.log("I am about to create formData", [...formData.entries()]);

      let response = await axios.post(`${URL}/editmodel`, formData, {
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
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const deletemodelImage = createAsyncThunk(
  "model/deletemodelImage",
  async (data : any) => {
    try {
      if (data) {
        for (let i = 0; i < data.length; i++) {
          // await deleteImage(data[i], "model");
        }
      }

      return "success";
    } catch (err : any) {
      throw err;
    }
  }
);

export const deletemodel = createAsyncThunk<any, DeleteModelPayload>(
  "model/deletemodel ",
  async (data: any) => {
    try {
      if (data.photolink) {
        for (let i = 0; i < data.photocount; i++) {
          // await deleteImage(data.oldlink[i], "model");
        }

        for (let i = 0; i < data.docCount; i++) {
          // await deleteImage(data.documentlink[i], "model");
        }
      }
      console.log(" after upadting model db on server");

      let info = {
        document: data.documentlink,
        photolink: data.photolink,
        hostid: data.hostid,
        token: data.token,
      };

      let response = await axios.post(`${URL}/deletemodel`, info);

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
  "model/unverifiedHost ",
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

export const verifymodel = createAsyncThunk(
  "model/verifymodel ",
  async (data: any) => {
    try {
      let response = await axios.post(`${URL}/verifymodel`, data);

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const rejectmodel = createAsyncThunk(
  "model/rejectmodel ",
  async (data: any) => {
    try {
      let response = await axios.post(`${URL}/rejectmodel`, data);

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
  "model/getverifyhost ",
  async (data: any) => {
    try {
      let response = await axios.post(`${URL}/getverifymodel`, data);
      console.log("Backend /getverifymodel response:", response.data);

      return response.data;
    } catch (err : any) {
      if (!err.response.data.message) {
        throw "check internet connection";
      }
      throw err.response.data.message;
    }
  }
);

export const review = createAsyncThunk<any, ReviewPayload>("model/review ", async (data) => {
  try {
    let response = await axios.put(`${URL}/reviewmodel`, data);

    return response.data;
  } catch (err : any) {
    if (!err.response.data.message) {
      throw "check internet connection";
    }
    throw err.response.data.message;
  }
});

export const getreview = createAsyncThunk("model/getreview ", async (data: any) => {
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
  "model/deletereview ",
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

export const addcrush = createAsyncThunk("model/addcrush ", async (data: any) => {
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

export const getcrush = createAsyncThunk("model/getcrushs ", async (data : any) => {
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
  "model/delete_MSG ",
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
  "model/remove_Crush ",
  async (
    data: {
      userid: string;
      token: string;
      modelid: string;
    }
  ) => {
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

const model = createSlice({
  name: "model",
  initialState,
  reducers: {
    changemodelstatus(state, action: PayloadAction<string>) {
      state.modelpoststatus = action.payload;
      state.mymodelstatus = action.payload;
      state.modelbyidstatus = action.payload;
      state.modelupdatestatus = action.payload;
      state.modeldeletestatus = action.payload;
      state.unverifiedhoststatus = action.payload;
      state.verifymodelstatus = action.payload;
      state.rejectmodelstatus = action.payload;
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
    },
  },
  extraReducers(builder) {
    builder
      .addCase(createmodel.pending, (state, action) => {
        state.modelpoststatus = "loading";
      })
      .addCase(createmodel.fulfilled, (state, action) => {
        state.modelpoststatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
      })
      .addCase(createmodel.rejected, (state, action) => {
        state.modelpoststatus = "failed";

        if (!action.error.message) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(getmymodel.pending, (state, action) => {
        state.mymodelstatus = "loading";
      })
      .addCase(getmymodel.fulfilled, (state, action) => {
        state.mymodelstatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
        state.mymodel = action.payload.host;
      })
      .addCase(getmymodel.rejected, (state, action) => {
        state.mymodelstatus = "failed";

        if (!action.error.message) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(getmymodelbyid.pending, (state, action) => {
        state.modelbyidstatus = "loading";
      })
      .addCase(getmymodelbyid.fulfilled, (state, action) => {
        state.modelbyidstatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
        state.modelbyid = action.payload.host;
      })
      .addCase(getmymodelbyid.rejected, (state, action) => {
        state.modelbyidstatus = "failed";

        if (!action.error.message) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(updatemodel.pending, (state, action) => {
        state.modelupdatestatus = "loading";
      })
      .addCase(updatemodel.fulfilled, (state, action) => {
        state.modelupdatestatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
      })
      .addCase(updatemodel.rejected, (state, action) => {
        state.modelupdatestatus = "failed";

        if (!action.error.message) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(deletemodel.pending, (state, action) => {
        state.modeldeletestatus = "loading";
      })
      .addCase(deletemodel.fulfilled, (state, action) => {
        state.modeldeletestatus = "succeeded";
        state.message = action.payload?.message ?? state.message;
      })
      .addCase(deletemodel.rejected, (state, action) => {
        state.modeldeletestatus = "failed";

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
      .addCase(verifymodel.pending, (state, action) => {
        state.verifymodelstatus = "loading";
      })
      .addCase(verifymodel.fulfilled, (state, action) => {
        state.verifymodelstatus = "succeeded";
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
      .addCase(verifymodel.rejected, (state, action) => {
        state.verifymodelstatus = "failed";

        if (action.error.message === undefined) {
          state.message = "Check internet connection";
        } else {
          state.message = action.error.message ?? state.message;
        }
      })
      .addCase(rejectmodel.pending, (state, action) => {
        state.rejectmodelstatus = "loading";
      })
      .addCase(rejectmodel.fulfilled, (state, action) => {
        state.rejectmodelstatus = "succeeded";
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
      .addCase(rejectmodel.rejected, (state, action) => {
        state.rejectmodelstatus = "failed";

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
      .addCase(deletemodelImage.pending, (state, action) => {
        state.deletmodeImage_stats = "loading";
      })
      .addCase(deletemodelImage.fulfilled, (state, action) => {
        state.deletmodeImage_stats = "succeeded";
      })
      .addCase(deletemodelImage.rejected, (state, action) => {
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
      });
  },
});

export default model.reducer;

export const { changemodelstatus } = model.actions;
