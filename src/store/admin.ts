import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "../api/config";
import axios from "axios";
// import { deleteImage } from "../../../api/sendImage";

// Helper: normalize error messages from Axios or generic errors
const getAxiosErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? "check internet connection";
  }
  if (err instanceof Error) return err.message;
  return "check internet connection";
};

// Types
type User = { _id: string; [key: string]: any };
type AdminState = {
  alluser_stats: string;
  alluser_message: string;
  alluser_list: User[];
  userphotos_list: Record<string, any>;
  deleteuser_stats: string;
  deleteuser_message: string;
  delete_photo_stats: string;
  delete_photo_message: string;
  suspenduser_stats: string;
  suspenduser_message: string;
  marked_users: string[];
  send_stats: string;
  send_message: string;
  notifyme: boolean;
  notifycount: string;
  notify_stats: string;
  notify_message: string;
};
type DeleteUserPhotoArgs = {
  modelphoto: any[];
  postphoto: any[];
  profilephoto: any[];
};

const initialState: AdminState = {
    alluser_stats:"idle",
    alluser_message:"",
    alluser_list:[],
    userphotos_list:{},
    deleteuser_stats:"idle",
    deleteuser_message:"",
    delete_photo_stats: "idle",
    delete_photo_message:"",
    suspenduser_stats: "idle",
    suspenduser_message:"",
    marked_users:[],
    send_stats:"idle",
    send_message:"",
    notifyme:false,
    notifycount:"0",
    notify_stats:"idle",
    notify_message:""

}

export const getalluser = createAsyncThunk("admin/getalluser",async data=>{

    try{


        let response = await axios.post(`${URL}/getallusers`,data)
       // console.log('under get profile')

        return response.data

    }catch(err){
       // console.log('erro get profile')
       throw getAxiosErrorMessage(err);
    }


})

export const deleteuser = createAsyncThunk("admin/deleteuser",async data=>{

    try{


        let response = await axios.post(`${URL}/deleteuser`,data)
       // console.log('under get profile')

        return response.data

    }catch(err){
       // console.log('erro get profile')
       throw getAxiosErrorMessage(err);
    }


})

export const deleteuser_photo = createAsyncThunk<any, DeleteUserPhotoArgs>("admin/deleteuser_photo",async (data)=>{

    try{

       let modelphotos = data.modelphoto
       let postphoto = data.postphoto
       let profilephoto = data.profilephoto

       for(let i = 0; i < modelphotos.length; i++){

        if(modelphotos[i]){

            //  await deleteImage(modelphotos[i],"model")

        }

       }

       for(let i = 0; i < postphoto.length; i++){
          if(postphoto[i]){

            //  await deleteImage(postphoto[i],"post")

        }
       }

       for(let i = 0; i < profilephoto.length; i++){

         if(profilephoto[i]){

            //  await deleteImage(profilephoto[i],"Profile")

        }
       }
       return {message:"delete success"}

    }catch(err){
       // console.log('erro get profile')
       throw getAxiosErrorMessage(err);
    }


})

export const suspend_user = createAsyncThunk("admin/suspenduser",async data=>{

    try{


        let response = await axios.post(`${URL}/suspenduser`,data)
       // console.log('under get profile')

        return response.data

    }catch(err){
       // console.log('erro get profile')
       throw getAxiosErrorMessage(err);
    }


})

export const sendmessage = createAsyncThunk("admin/sendmessage",async data=>{

    try{


        let response = await axios.post(`${URL}/sendmessages`,data)
       // console.log('under get profile')

        return response.data

    }catch(err){
       // console.log('erro get profile')
       throw getAxiosErrorMessage(err);
    }


})

export const adminnotify = createAsyncThunk("admin/adminnotify",async data=>{

    try{


        let response = await axios.post(`${URL}/adminnotify`,data)
       // console.log('under get profile')

        return response.data

    }catch(err){
       // console.log('erro get profile')
       throw getAxiosErrorMessage(err);
    }


})


const admin = createSlice({
    name: "admin",
    initialState,
    reducers:{
        reset_alluser(state,action){
            state.alluser_stats = "idle"
            state.deleteuser_stats = "idle"
            state.delete_photo_stats = "idle"
            state.suspenduser_stats = "idle"
            state.send_stats = "idle"

        },
        remove_user(state,action){
            let id = action.payload

            let index = state.alluser_list.findIndex(value =>{
                return String(value._id) === String(id)
            })

            if(index !== -1){
                state.alluser_list.splice(index,1)
            }
        },
        add_user(state,action){

            state.marked_users = action.payload

        },
        clear_users(state,action){

            state.marked_users = []

        },
    },
    extraReducers(builder){

         builder.addCase(getalluser.pending,(state,action)=>{
            state.alluser_stats = 'loading'

        }
        )
        .addCase(getalluser.fulfilled,(state,action)=>{

            state.alluser_stats = 'succeeded'
            state.alluser_list = action.payload.users

        }

        )
        .addCase(getalluser.rejected,(state,action)=>{

            state.alluser_stats = 'failed'
            state.alluser_message = action.error.message ?? "unknown error"
        }

        )
        .addCase(deleteuser.pending,(state,action)=>{
            state.deleteuser_stats = 'loading'

        }
        )
        .addCase(deleteuser.fulfilled,(state,action)=>{

            state.deleteuser_stats = 'succeeded'

            let id = action.payload.id

            let index = state.alluser_list.findIndex(value =>{
                return value._id === id
            })

            if(index !== -1){
                state.alluser_list.splice(index,1)
            }
        }

        )
        .addCase(deleteuser.rejected,(state,action)=>{

            state.deleteuser_stats = 'failed'
            state.deleteuser_message = action.error.message ?? "unknown error"
        }

        )
        .addCase(deleteuser_photo.pending,(state,action)=>{
            state.delete_photo_stats = 'loading'

        }
        )
        .addCase(deleteuser_photo.fulfilled,(state,action)=>{

            state.delete_photo_stats = 'succeeded'


        }

        )
        .addCase(deleteuser_photo.rejected,(state,action)=>{

            state.delete_photo_stats = 'failed'
            state.delete_photo_message = action.error.message ?? "unknown error"
        }

        )
        .addCase(suspend_user.pending,(state,action)=>{
            state.suspenduser_stats = 'loading'

        }
        )
        .addCase(suspend_user.fulfilled,(state,action)=>{

            state.suspenduser_stats = 'succeeded'


        }

        )
        .addCase(suspend_user.rejected,(state,action)=>{

            state.suspenduser_stats = 'failed'
            state.suspenduser_message = action.error.message ?? "unknown error"
        }

        )
        .addCase(sendmessage.pending,(state,action)=>{
            state.send_stats = 'loading'

        }
        )
        .addCase(sendmessage.fulfilled,(state,action)=>{

            state.send_stats = 'succeeded'


        }

        )
        .addCase(sendmessage.rejected,(state,action)=>{

            state.send_stats = 'failed'
            state.send_message = action.error.message ?? "unknown error"
        }

        )
        .addCase(adminnotify.pending,(state,action)=>{
            state.notify_stats = 'loading'

        }
        )
        .addCase(adminnotify.fulfilled,(state,action)=>{

            state.notify_stats = 'succeeded'
            state.notifycount = action.payload.notifycount
            state.notifyme = action.payload.notifyme
            state.notify_stats = "idle"


        }

        )
        .addCase(adminnotify.rejected,(state,action)=>{

            state.notify_stats = 'failed'
            state.notify_message = action.error.message ?? "unknown error"
            state.notify_stats = "idle"
        }

        )
    }
})

export default admin.reducer;
export const { reset_alluser, remove_user, add_user, clear_users} = admin.actions;
