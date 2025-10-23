import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "../api/config"
import axios from "axios";

interface CommentState {
  message: string;
  commentstatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  allcomment: any[];
  allcommentstatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  editcommentstatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deletecommentstatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: CommentState = {
  message: '',
  commentstatus: 'idle',
  error: null,
  allcomment: [],
  allcommentstatus: 'idle',
  editcommentstatus: 'idle',
  deletecommentstatus: 'idle',
}



export const postcomment = createAsyncThunk("comment/postcomment",async (data: any)=>{
   
    try{

 
        console.log('Posting comment:', data)
        
        let response = await axios.put(`${URL}/comment`,data)
        console.log('Comment posted successfully:', response.data)
       
        return response.data
        
    }catch(err){
        console.log('Error posting comment:', err)
        if (axios.isAxiosError(err)) {
          throw (err.response?.data as any)?.message ?? "Network error";
        }
        throw "Unexpected error";
    }


})

export const getpostcomment = createAsyncThunk("comment/getpostcomment",async (data: any)=>{
   
    try{
        console.log('💬 [REDUX] GETPOSTCOMMENT ACTION TRIGGERED');
        console.log('💬 [REDUX] Comment data:', data);
        console.log('💬 [REDUX] API URL:', `${URL}/getpostcomment`);
        console.log('💬 [REDUX] Request method: PUT');
        
        let response = await axios.put(`${URL}/getpostcomment`, data)
        console.log('💬 [REDUX] Comment response received:', response);
        console.log('💬 [REDUX] Response status:', response.status);
        console.log('💬 [REDUX] Response data:', response.data);
       
        return response.data
        
    }catch(err){
        console.error('💬 [REDUX] Comment fetch error:', err);
        if (axios.isAxiosError(err)) {
            console.error('💬 [REDUX] Axios error details:', {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                config: {
                    url: err.config?.url,
                    method: err.config?.method,
                    data: err.config?.data
                }
            });
            throw (err.response?.data as any)?.message ?? "Network error";
        }
        throw "Unexpected error";
    }


})

export const editpostcomment = createAsyncThunk("comment/editpostcomment",async (data: any)=>{
   
    try{

 
        //console.log('after info')
        
        
        let response = await axios.post(`${URL}/comment`,data)
       // console.log('under get profile')
       
        return response.data
        
    }catch(err){
       // console.log('erro get profile')
        if (axios.isAxiosError(err)) {
          throw (err.response?.data as any)?.message ?? "Network error";
        }
        throw "Unexpected error";
    }


})

export const deletecomment = createAsyncThunk("comment/deletecomment",async (data: any)=>{
   
    try{

 
        //console.log('after info')
        
        
        let response = await axios.patch(`${URL}/comment`,data)
       // console.log('under get profile')
       
        return response.data
        
    }catch(err){
       // console.log('erro get profile')
        if (axios.isAxiosError(err)) {
          throw (err.response?.data as any)?.message ?? "Network error";
        }
        throw "Unexpected error";
    }


})



const comment = createSlice({
    name:"comment",
    initialState,
    reducers:{
        resetcomment(state,action){
            state.commentstatus = action.payload
            state.allcommentstatus = action.payload
            state.editcommentstatus = action.payload
            state.deletecommentstatus= action.payload
        
    },
    clearcomment(state,action){
        state.allcomment = []
    
}
   },
    extraReducers(builder){

        builder.addCase(postcomment.pending,(state,action)=>{
            state.commentstatus = 'loading'
            
        }
        )
        .addCase(postcomment.fulfilled,(state,action)=>{

            state.commentstatus = 'succeeded'
            state.message = action.payload.message;
           
            
        }

        )
        .addCase(postcomment.rejected,(state,action)=>{
           
            state.commentstatus = 'failed'
           
            if(!action.error){

                state.error = "Check internet connection"
            }else{
                state.error = action.error.message ?? null
            }
        }

        )
        .addCase(getpostcomment.pending,(state,action)=>{
            console.log('💬 [REDUX] Comment fetch pending...');
            state.allcommentstatus = 'loading'
            
        }
        )
        .addCase(getpostcomment.fulfilled,(state,action)=>{
            console.log('💬 [REDUX] Comment fetch fulfilled:', action.payload);
            state.allcommentstatus = 'succeeded'
            state.allcomment = action.payload.comment;
           
           
            
        }

        )
        .addCase(getpostcomment.rejected,(state,action)=>{
            console.error('💬 [REDUX] Comment fetch rejected:', action.error);
            state.allcommentstatus = 'failed'
           
            if(!action.error){

                state.error = "Check internet connection"
            }else{
                state.error = action.error.message ?? null
            }
        }

        )
        .addCase(editpostcomment.pending,(state,action)=>{
            state.editcommentstatus = 'loading'
            
        }
        )
        .addCase(editpostcomment.fulfilled,(state,action)=>{

            state.editcommentstatus = 'succeeded'
            
           
           
            
        }

        )
        .addCase(editpostcomment.rejected,(state,action)=>{
           
            state.editcommentstatus = 'failed'
           
            if(!action.error){

                state.error = "Check internet connection"
            }else{
                state.error = action.error.message ?? null
            }
        }

        )
        .addCase(deletecomment.pending,(state,action)=>{
            state.deletecommentstatus = 'loading'
            
        }
        )
        .addCase(deletecomment.fulfilled,(state,action)=>{

            state.deletecommentstatus = 'succeeded'
            
           
           
            
        }

        )
        .addCase(deletecomment.rejected,(state,action)=>{
           
            state.deletecommentstatus = 'failed'
           
            if(!action.error){

                state.error = "Check internet connection"
            }else{
                state.error = action.error.message ?? null
            }
        }

        )
    }
})

export default comment.reducer
export const {resetcomment, clearcomment} = comment.actions